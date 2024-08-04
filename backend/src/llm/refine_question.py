import config
from llm.flags import _observe
from llm.llm_chains.identify_ambiguities import identify_ambiguities
from llm.llm_chains.reword_question import reword_question
from llm.knowledge_bases import (
    get_schema_description,
)


@_observe()
def refine_question(question: str):
    ambiguities = identify_ambiguities.invoke({"user_question": question})
    reworded_question = reword_question.invoke(
        {
            "dataset_schema": get_schema_description(schema_type=config.llm_chain.DATASET_DESCRIPTION_FORMAT),
            "user_question": question,
            "identified_ambiguities": ambiguities,
        }
    )

    return reworded_question
