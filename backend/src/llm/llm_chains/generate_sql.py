from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import code_bison_6k
from llm.prompts.sql_generation import sql_generation_prompt
from llm.flags import _observe
from langchain_core.runnables import chain


def create_sql_generation_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or sql_generation_prompt)
    _chain = prompt | code_bison_6k | output_parser

    return _chain


@chain
@_observe()
def gen(input):
    return create_sql_generation_chain().invoke(input)
