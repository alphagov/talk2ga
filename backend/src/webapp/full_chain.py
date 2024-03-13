from langchain_core.runnables import RunnableLambda
from langchain_core.runnables import RunnablePassthrough
from modules.knowledge_bases import get_text_knowledge_base, get_schema_description
from modules.llm_chains import generate_sql, format_output, sql_chain
from modules import config
from modules import evaluation
from modules import formatting
from modules.db import query_sql


def generate_sql_sub():
    generated_sql = generate_sql.chain.invoke(
        {
            "DATASET": config.DATASET,
            "schema_description": get_schema_description(),
            "user_query": question,
            "knowledge_base": get_text_knowledge_base(),
        }
    )
    while not evaluation.is_valid_sql(result1):
        print("Invalid SQL output, retrying...")
        generated_sql = generate_sql.chain.invoke(
            {
                "DATASET": config.DATASET,
                "schema_description": get_schema_description(),
                "user_query": question,
                "knowledge_base": get_text_knowledge_base(),
            }
        )

    return generated_sql


def whole_chain():
    return (
        RunnableLambda(generate_sql_sub)
        | RunnableLambda(formatting.remove_sql_quotes)
        | RunnableLambda(query_sql)
        | format_output
    )


def call_chain_with_ctx(question):
    result1 = generate_sql.chain.invoke(
        {
            "DATASET": config.DATASET,
            "schema_description": get_schema_description(),
            "user_query": question,
            "knowledge_base": get_text_knowledge_base(),
        }
    )

    # Evaluate output
    while not evaluation.is_valid_sql(result1):
        print("Invalid SQL output, retrying...")
        result1 = generate_sql.chain.invoke(
            {
                "DATASET": config.DATASET,
                "schema_description": get_schema_description(),
                "user_query": question,
                "knowledge_base": get_text_knowledge_base(),
            }
        )

    pure_sql = formatting.remove_sql_quotes(result1)
    print("pure:\n", pure_sql)
    response_object = query_sql(pure_sql)
    print("response_object: ", response_object)

    print("\n\n\n")
    print(response_object)
    print("\n\n\n")

    result2 = format_output.chain.invoke(
        {
            "user_query": question,
            "sql_query": pure_sql,
            "response_object": response_object,
        }
    )

    def whole_chain():
        return {} | format_output

    return result2


def call_chain_with_ctx(question) -> list[str, str, any]:
    """
    This is the whole chain, implemented in regular procedural code instead of langchain syntax.
    It does use a couple of langchain chains though.

    Returns:
    list[str, str, any]: [text_result, pure_sql, response_object]
    """
    result1 = generate_sql.chain.invoke(
        {
            "DATASET": config.DATASET,
            "schema_description": get_schema_description(),
            "user_query": question,
            "knowledge_base": get_text_knowledge_base(),
        }
    )

    # Evaluate output
    while not evaluation.is_valid_sql(result1):
        print("Invalid SQL output, retrying...")
        result1 = generate_sql.chain.invoke(
            {
                "DATASET": config.DATASET,
                "schema_description": get_schema_description(),
                "user_query": question,
                "knowledge_base": get_text_knowledge_base(),
            }
        )

    pure_sql = formatting.remove_sql_quotes(result1)
    print("pure:\n", pure_sql)
    response_object = query_sql(pure_sql)
    print("response_object: ", response_object)

    print("\n\n\n")
    print(response_object)
    print("\n\n\n")

    whole_chain = sql_chain.chain | format_output

    result2 = format_output.chain.invoke(
        {
            "user_query": question,
            "sql_query": pure_sql,
            "response_object": response_object,
        }
    )

    return result2, pure_sql, response_object


chain_for_endpoint = RunnableLambda(call_chain_with_ctx)


####################################
