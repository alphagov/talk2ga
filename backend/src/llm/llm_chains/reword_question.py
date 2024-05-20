from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import text_bison
from llm.prompts.refinement_reword_question_from_ambiguities import (
    refinement_reword_prompt,
)
from llm.flags import _observe
from langchain_core.runnables import chain


def create_reword_question_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or refinement_reword_prompt)
    _chain = prompt | text_bison | output_parser

    return _chain


@chain
@_observe()
def reword_question(input):
    return create_reword_question_chain().invoke(input)
