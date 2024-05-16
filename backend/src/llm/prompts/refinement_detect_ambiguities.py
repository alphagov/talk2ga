refinement_prompt = """
Context: The user is interacting with a BigQuery dataset that tracks e-commerce transactions.

Original Question: "{user_question}"

Task: Analyze the user's question for any ambiguities or unclear elements. Specify what parts of the question could lead to multiple interpretations or inaccurate SQL queries. For example, does the question assume specific details about the data not explicitly stated? Does the question assum understanding of certain words?

Identify and explain all potential ambiguities.
"""
