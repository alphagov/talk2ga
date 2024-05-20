refinement_reword_prompt = """
# Context:
The user is working with a BigQuery dataset that holds Google Analytics data for a UK government website.

# Dataset Schema:
{dataset_schema}

Original #Question:
"{user_question}"

# Identified Ambiguities:
{identified_ambiguities}

# Task:
Please reformulate the original question by resolving each ambiguity listed above. Ensure that the new version of the question is specific enough to facilitate the creation of an accurate and possibly complex SQL query. The question should clarify any assumptions about data fields, required operations, and necessary details like time frames or specific data attributes.

Provide a clear and detailed version of the question.
Provide the new question only. Nothing else.
"""
