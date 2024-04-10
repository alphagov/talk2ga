# type: ignore
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel
)
from langchain_core.runnables import chain
from llm.knowledge_bases import get_text_knowledge_base, get_schema_description, get_schema_columns
from llm.llm_chains import generate_sql, format_output, generate_sql_correction
from llm import config
from llm import evaluation
from llm import formatting
from llm.prompts.smart_answers import pertains_to_smart_answers, smart_answers_prompt
from llm.db import query_sql
from llm.evaluation import InvalidSQLColumnsException
from webapp import analytics_controller
from webapp.exceptions import format_exception
import random


def create_gen_sql_input(question):
    if pertains_to_smart_answers(question):
        question = smart_answers_prompt(question)
    obj = {
        "DATASET": config.DATASET,
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
                    print(f"\n{func.__name__}: Retrying {count_retries}/{max_tries}...\n")
                    latest_exception = e

            if output is None:
                raise latest_exception

            return output

        return wrapper
    
    return chain_with_retry_decorator


@chain
def gen_sql_chain(input):
    input = create_gen_sql_input(input)

    @chain
    def validation_chain(gen_sql_output):
        print(f"\n\n\nValidating\n{gen_sql_output}\n\n\n")
        try:
          return (RunnableLambda(formatting.remove_sql_quotes)| RunnableLambda(evaluation.is_valid_sql)).invoke(gen_sql_output)
        except Exception as e:
            # LangChain does not support return exceptions in chains as they are not json serializable
            # So we need to return a dictionary with the error information
            return {
                "is_error": True,
                "type": e.__class__.__name__,
                "error": str(e),
                "attrs": e.__dict__
            }
    

    outputs = (
        RunnableParallel(
            gen1=generate_sql.chain | validation_chain,
            gen2=generate_sql.chain | validation_chain,
            gen3=generate_sql.chain | validation_chain,
        )
    ).invoke(input)

    is_error = lambda x: type(x) is not str and  x.get("is_error", False)

    correct_outputs = [v for v in outputs.values() if not is_error(v)]
    if len(correct_outputs) > 0:
        return random.choice(correct_outputs)

    
    for _, v in outputs.items():
        if is_error(v) and v["type"] == "InvalidSQLColumnsException":
            raise InvalidSQLColumnsException(**v["attrs"])
    
    raise Exception("All attempts failed with unexpected errors: ", outputs.values())


@chain_with_retry(2)
def gen_sql_correction(payload: dict[str, list[str] | str]):
    input = {
        **payload,
        "schema_description": get_schema_description(),
        "knowledge_base": get_text_knowledge_base(),
        "table_name": config.DATASET,
    }
    return (
        generate_sql_correction.chain
        | RunnableLambda(formatting.remove_sql_quotes)
        | RunnableLambda(evaluation.is_valid_sql)
    ).invoke(input)


def generate_sql_from_question(question:str):
    try:
        return gen_sql_chain.invoke(question)
    except InvalidSQLColumnsException as e:
        input = {
            "schema_columns": get_schema_columns(),
            "wrong_columns": e.wrong_columns,
            "wrong_query": e.sql,
            "knowledge_base": get_text_knowledge_base(),
            "question": question,
        }
        corrected_sql = gen_sql_correction.invoke(input)
        return corrected_sql
    

def log_error_to_analytics(func):
    async def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"\n{func.__name__} failed\n")
            print(e)

            # Log error to analytics
            question_id = kwargs.get("config", {}).get("question_id")
            if question_id:
                await analytics_controller.log_error(question_id, str(e))


            raise e
    
    return wrapper





@chain
# @log_error_to_analytics
async def whole_chain(question: str, config: dict[str, any]):
    try:
        question_id = config.get("question_id")
        max_tries = 2
        count_retries = 0
        response_object = None

        raise InvalidSQLColumnsException(["column1", "column2"], ['cewqrofsdfj'], "SELECT * FROM table WHERE column1 = 1")
        # raise Exception("Test error")
        
        while response_object is None and count_retries < max_tries:
            try:
                sql = generate_sql_from_question(question)
                response_object = query_sql(sql)
            except Exception as e:
                count_retries += 1
                print(f"\nquery_sql failed. Retrying {count_retries}/{max_tries}...\n")
                print(e)
        
        if response_object is None:
            raise Exception("All attempts failed to generate and query SQL.")
        
        final_output = format_output.chain.invoke({
            "user_query": question,
            "sql_query": sql,
            "response_object": response_object,
        })
        
        return final_output
    except Exception as e:
        # print(f"\n{func.__name__} failed\n")
        print(e)

        # Log error to analytics
        if question_id:
            await analytics_controller.log_error(question_id, format_exception(e))


        raise e
