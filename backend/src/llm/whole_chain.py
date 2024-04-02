# type: ignore
from operator import itemgetter
from langchain_core.runnables import (
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
)
from langchain_core.runnables import chain
from llm.knowledge_bases import get_text_knowledge_base, get_schema_description
from llm.llm_chains import generate_sql, format_output
from llm import config
from llm import evaluation
from llm import formatting
from llm.prompts.smart_answers import pertains_to_smart_answers, smart_answers_prompt
from llm.db import query_sql_trial


@chain
def create_gen_sql_input(question):
    if pertains_to_smart_answers(question):
        print("IS SMART ANSWER")
        question = smart_answers_prompt(question)
    else:
        print("NOT A SMART ANSWER QUESTION")
    obj = {
        "DATASET": config.DATASET,
        "schema_description": get_schema_description(),
        "knowledge_base": get_text_knowledge_base(),
        "user_query": question,
    }
    return obj


gen_sql_chain = (
    create_gen_sql_input
    | generate_sql.chain
    | RunnableLambda(formatting.remove_sql_quotes)
    | RunnableLambda(evaluation.is_valid_sql)
)


whole_chain = (
    RunnableParallel({
        "pure_sql": gen_sql_chain.with_retry(
            stop_after_attempt=2,
        ),
        "question": RunnablePassthrough(),
    })
    | RunnableParallel({
        "user_query": itemgetter("question"),
        "sql_query": itemgetter("pure_sql"),
        "response_object": RunnableLambda(query_sql_trial),
    })
    | format_output.chain
)
