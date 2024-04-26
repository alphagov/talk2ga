from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import text_bison
from llm.prompts.format_output import format_output_prompt
from llm.flags import _observe


def create_format_output_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or format_output_prompt)
    chain = prompt | text_bison | output_parser

    return chain


@_observe()
def format_answer(question, sql, response_object):
    return create_format_output_chain().invoke(
        {
            "user_query": question,
            "sql_query": sql,
            "response_object": response_object,
        }
    )
