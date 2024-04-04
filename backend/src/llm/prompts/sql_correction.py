sql_correction_prompt = """
You are expert BigQuery SQL queries writer.
I need your help to correct a SQL query.
The problem with the SQL query is that it contains invalid columns that don't exist in the schema of the table.


# Here is the SQL query to be corrected:
```
{wrong_query}
```

# The invalid columns in the query are:
(!!important: do NOT use any of the following columns in the corrected SQL!!)
{wrong_columns}


# The list of columns in the schema are:
(!!important: use only the following columns in the corrected SQL!!)
{schema_columns}


# The question the query was trying to solve was:
{question}


# Here some more knowledge about the data:
{knowledge_base}

Please correct the SQL query by replacing the invalid columns with the correct ones.
Make sure to only use the columns from the schema of the table.
"""
