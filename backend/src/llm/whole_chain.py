# type: ignore
from langchain_core.runnables import (
    RunnableLambda,
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


@chain_with_retry(2)
def gen_sql_chain(input):
    input = create_gen_sql_input(input)
    return (
        generate_sql.chain
        | RunnableLambda(formatting.remove_sql_quotes)
        | RunnableLambda(evaluation.is_valid_sql)
    ).invoke(input)


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
    

@chain
def whole_chain(question: str):
    sql = generate_sql_from_question(question)
    response_object = query_sql(sql)
    final_output = format_output.chain.invoke({
        "user_query": question,
        "sql_query": sql,
        "response_object": response_object,
    })
    
    return final_output
