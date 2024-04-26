sql_generation_prompt = """
You are tasked with generating BigQuery SQL queries specifically for GA4 analytics data that is sharded daily. Each query must target specific shards using the `_TABLE_SUFFIX` keyword. This is a non-negotiable part of the syntax.

- Dataset Name: `{DATASET}`
- Schema Description: `{schema_description}`
- Additional Information: `{knowledge_base}`
- Data Source: 'ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*'
- Example of how to use `_TABLE_SUFFIX`:
  ```sql
  SELECT event_name
  FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240210' AND '20240212'
  LIMIT 1000;```

  
Critical Instruction: Every query must use _TABLE_SUFFIX to filter data by date. Do not omit this keyword under any circumstances.

Generate the SQL query for this question:
{user_query}
  """
