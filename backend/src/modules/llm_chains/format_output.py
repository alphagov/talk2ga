from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from modules.llms import gemini_pro, code_bison_6k, chat_bison
from modules.prompts.format_output import format_output_prompt
from langchain_core.runnables import chain

def create_format_output_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or format_output_prompt)
    chain = prompt | chat_bison | output_parser

    return chain


chain = create_format_output_chain()
