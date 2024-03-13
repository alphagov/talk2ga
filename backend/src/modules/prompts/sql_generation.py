sql_generation_prompt = """
You are an expert BigQuery SQL queries writer.

The name of the table is is {DATASET}.
The schema of the table is:
{schema_description}


Some more infos you should know:
{knowledge_base}


The data is GA4 analytics data exported to BigQuery from Google Analytics.

The table to query from is 'ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240212'
You must use BigQuery SQL syntax.

Example query:
```sql
SELECT event_name FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240212` LIMIT 1000;
```

Generate the SQL query for this question:
{user_query}
"""
