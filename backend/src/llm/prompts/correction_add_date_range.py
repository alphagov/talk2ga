correct_missing_date_range_prompt = """
Given the following SQL query, it lacks a mandatory date range filter using the _TABLE_SUFFIX keyword for querying Google BigQuery tables. The query is intended to run against a dataset where tables are split daily and named by date. Please correct the SQL by adding a WHERE clause that includes a date range filter between 'START_DATE' and 'END_DATE'. If a WHERE clause already exists, integrate the date range filter appropriately.

Original SQL:
```sql
{sql_query}
```

Please insert the corrected SQL query below:
"""
