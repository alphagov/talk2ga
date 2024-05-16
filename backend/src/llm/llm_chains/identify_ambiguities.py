from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from llm.llms import text_bison
from llm.prompts.refinement_detect_ambiguities import refinement_prompt
from llm.flags import _observe
from langchain_core.runnables import chain


def create_identify_ambiguities_chain(custom_prompt=None):
    output_parser = StrOutputParser()
    prompt = ChatPromptTemplate.from_template(custom_prompt or refinement_prompt)
    _chain = prompt | text_bison | output_parser

    return _chain


@chain
@_observe()
def identify_ambiguities(input):
    return create_identify_ambiguities_chain().invoke(input)
