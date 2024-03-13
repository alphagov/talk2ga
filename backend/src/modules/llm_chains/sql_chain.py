from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from modules.llms import code_bison_6k
from modules.prompts.sql_generation import sql_generation_prompt
from modules.llm_chains.generate_sql import chain as generate_sql
from langchain_core.runnables import RunnableLambda
from modules import formatting
from modules import evaluation


def validate_sql(sql):
    if not evaluation.is_valid_sql(sql):
        raise Exception("Invalid SQL")

    return sql


def create_sql_chain(custom_prompt=None):
    chain = (
        generate_sql
        | RunnableLambda(formatting.remove_sql_quotes)
        | RunnableLambda(validate_sql)
    )

    return chain


chain = create_sql_chain()
