from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import code_bison_6k
from llm.prompts.sql_generation import sql_generation_prompt


def create_sql_generation_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or sql_generation_prompt)
    chain = prompt | code_bison_6k | output_parser

    return chain


chain = create_sql_generation_chain()
chain_test = create_sql_generation_chain("""{prompt}""")
