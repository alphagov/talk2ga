from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import code_bison_6k
from llm.prompts.correction_add_date_range import correct_missing_date_range_prompt


def correct_missing_date_range_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(
        custom_prompt or correct_missing_date_range_prompt
    )
    chain = prompt | code_bison_6k | output_parser

    return chain


chain = correct_missing_date_range_chain()
