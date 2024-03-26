explain_prompt = """
# For this original question about some data in a BigQuery table:
{user_query}


# I have written the following SQL query:
{sql_query}


# The following knowdledge and context was provided with the original question:
## Schema description:
{schema_description}

## Knowledge base:
{knowledge_base}

## Bigquery dataset:
{DATASET}






# Your task:

You must interpret the sql query and explain it in plain English.
Explain why the sql query was written the way it was, and what the results mean.
"""
