import json
from langchain_core.runnables import chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import text_bison
from llm.prompts.explain import explain_prompt
from llm.prompts.smart_answers import pertains_to_smart_answers, smart_answers_prompt
from llm.knowledge_bases import get_text_knowledge_base, get_schema_description
import config


def create_generate_explanation_sql_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or explain_prompt)
    chain = prompt | text_bison | output_parser

    return chain


@chain
def create_explain_sql_input(payload_json):
    payload = json.loads(payload_json)
    question = payload["question"]
    sql_query = payload["sql"]

    if pertains_to_smart_answers(question):
        print("IS SMART ANSWER")
        question = smart_answers_prompt(question)
    obj = {
        "user_query": question,
        "sql_query": sql_query,
        "DATASET": config.bigquery.DATASET,
        "schema_description": get_schema_description(schema_type=config.llm_chain.DATASET_DESCRIPTION_FORMAT),
        "knowledge_base": get_text_knowledge_base(),
    }
    return obj


explain_sql_chain = create_explain_sql_input | create_generate_explanation_sql_chain()
