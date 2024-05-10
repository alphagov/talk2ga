# type: ignore
import asyncio
import json
from llm.flags import _observe
from langchain_core.runnables import chain
from langchain_core.runnables import RunnableLambda, RunnableParallel
from llm.knowledge_bases import (
    get_text_knowledge_base,
    get_schema_description,
    get_schema_columns,
)
import appconfig
from llm.llm_chains import (
    generate_sql,
    format_output,
    generate_sql_correction,
    correction_add_date_range,
)
from llm import validation
from llm import formatting
from llm.prompts.smart_answers import pertains_to_smart_answers, smart_answers_prompt
from llm.db import query_sql
from llm.validation import InvalidSQLColumnsException
from webapp import analytics_controller
from webapp.exceptions import format_exception
import random
import asyncio
from utils.side_effects import run_async_side_effect


@_observe()
def create_gen_sql_input(question):
    if pertains_to_smart_answers(question):
        question = smart_answers_prompt(question)
    obj = {
        "DATASET": appconfig.DATASET,
        "schema_description": get_schema_description(),
        "knowledge_base": get_text_knowledge_base(),
        "user_query": question,
    }
    return obj


def chain_with_retry(retries_nb):
    def chain_with_retry_decorator(func):
        @chain
        def wrapper(input):
            max_tries = retries_nb
            count_retries = 0

            output = None
            latest_exception = None

            while output is None and count_retries < max_tries:
                try:
                    output = func(input)
                except Exception as e:
                    count_retries += 1
                    print(
                        f"\n{func.__name__}: Retrying {count_retries}/{max_tries}...\n"
                    )
                    latest_exception = e

            if output is None:
                raise latest_exception

            return output

        return wrapper

    return chain_with_retry_decorator


@_observe()
def gen_sql_chain(input, date_range, question_id):
    input = create_gen_sql_input(input)

    @chain
    @_observe()
    def sql_enhancement(sql: str):
        if formatting.contains_date_range(sql):
            return sql

        new_sql = correction_add_date_range.correct_missing_date_range_chain.invoke(
            {"sql_query": sql}
        )
        return new_sql

    @chain
    @_observe()
    def validation_chain(sql: str):
        try:
            formatted_sql = formatting.remove_sql_quotes(sql)
            formatted_sql = formatting.remove_comments(formatted_sql)
            formatted_sql = formatting.insert_correct_dataset(formatted_sql)
            formatted_sql = formatting.insert_correct_dates(formatted_sql, date_range)
            formatted_sql = formatting.format_sql(formatted_sql)
            validated_sql = validation.is_valid_sql(formatted_sql)
            return validated_sql
        except Exception as e:
            # LangChain does not support return exceptions in chains as they are not json serializable
            # So we need to return a dictionary with the error information
            return {
                "is_error": True,
                "type": e.__class__.__name__,
                "error": str(e),
                "attrs": e.__dict__,
            }

    @_observe()
    def parallel_sql_gen(input):
        amount = appconfig.NB_PARALLEL_SQL_GEN
        runnable_parallel = RunnableParallel(
            {
                f"gen{i+1}": (generate_sql.gen | sql_enhancement | validation_chain)
                for i in range(amount)
            }
        )
        outputs = runnable_parallel.invoke(input)

        return outputs

    outputs = parallel_sql_gen(input)

    async def log_task():
        """
        Log the generated queries to the database for analytics purposes.
        Side effect, failsafe.
        """
        try:
            await analytics_controller.add_generated_queries_to_question(
                question_id, [v for v in outputs.values() if isinstance(v, str)], True
            )
        except Exception as e:
            print(e)
            pass  # Ignore any error.

    run_async_side_effect(log_task)

    is_error = lambda x: type(x) is not str and x.get("is_error", False)

    correct_outputs = [v for v in outputs.values() if not is_error(v)]
    if len(correct_outputs) > 0:
        return random.choice(correct_outputs)

    for _, v in outputs.items():
        if is_error(v) and v["type"] == "InvalidSQLColumnsException":
            raise InvalidSQLColumnsException(**v["attrs"])

    raise Exception("All attempts failed with unexpected errors: ", outputs.values())


@chain_with_retry(2)
@_observe()
def gen_sql_correction(payload: dict[str, list[str] | str]):
    input = {
        **payload,
        "schema_description": get_schema_description(),
        "knowledge_base": get_text_knowledge_base(),
        "table_name": appconfig.DATASET,
    }
    valid_sql = (
        generate_sql_correction.chain
        | RunnableLambda(formatting.remove_sql_quotes)
        | RunnableLambda(validation.is_valid_sql)
    ).invoke(input)

    return formatting.format_sql(valid_sql)


@_observe()
def generate_sql_from_question(
    question: str, date_range, question_id: int
) -> [str, bool]:
    try:
        return gen_sql_chain(question, date_range, question_id), False
    except InvalidSQLColumnsException as e:
        input = {
            "schema_columns": get_schema_columns(),
            "wrong_columns": e.wrong_columns,
            "wrong_query": e.sql,
            "knowledge_base": get_text_knowledge_base(),
            "question": question,
        }
        corrected_sql = gen_sql_correction.invoke(input)
        return corrected_sql, True


def log_error_to_analytics(func):
    def wrapper(question: str, config: dict[str, any], *args, **kwargs):
        try:
            return func(question, config, *args, **kwargs)
        except Exception as e:
            print(f"\n{func.__name__} failed\n")

            # Log error to analytics, side effect, failsafe
            if question_id := config.get("question_id"):
                asyncio.create_task(
                    analytics_controller.log_error(question_id, format_exception(e))
                )

            print("ERROR:::::")
            print(e)
            raise e

    return wrapper


@chain
def selected_sql_passthrough(sql):
    # just to get the sql from the stream log in the frontend
    return sql


@chain
@log_error_to_analytics
@_observe()
def whole_chain(json_input: str, config: dict[str, any], test_callback=None):
    input = json.loads(json_input)
    question = input.get("question")
    question_id = config.get("question_id")
    date_range = input.get("dateRange")
    max_tries = 2
    count_retries = 0
    response_object = None

    while response_object is None and count_retries < max_tries:
        try:
            sql, was_corrected = generate_sql_from_question(
                question, date_range, question_id
            )
            # Running the SQL though a passthrough just to get the sql from the stream log in the frontend
            # TODO: create API endpoints to record / get the SQL by question ID instead of using the stream log
            sql = selected_sql_passthrough.invoke(sql)
            response_object = query_sql(sql)
        except Exception as e:
            count_retries += 1
            print(f"\nquery_sql failed. Retrying {count_retries}/{max_tries}...\n")
            print(e)

    if response_object is None:
        raise Exception("All attempts failed to generate and query SQL.")

    final_output = format_output.format_answer(question, sql, response_object)

    if test_callback:
        test_callback(
            {
                "question": question,
                "sql": sql,
                "response_object": response_object,
                "final_output": final_output,
                "count_retries": count_retries,
                "was_corrected": was_corrected,
                "retried": count_retries > 0,
            }
        )

    return final_output
