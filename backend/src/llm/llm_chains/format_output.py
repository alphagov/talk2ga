from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import chat_bison
from llm.prompts.format_output import format_output_prompt

def create_format_output_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or format_output_prompt)
    chain = prompt | chat_bison | output_parser

    return chain


chain = create_format_output_chain()
