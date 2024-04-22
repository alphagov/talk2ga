import re
from llm.flags import _observe

@_observe()
def remove_sql_quotes(input: str) -> str:
    """
    Now extract the SQL language only from the prompt result
    """
    relevant_str = input

    if "```sql" in relevant_str:
        relevant_str = input.split("```sql")[1]

    if "```" in relevant_str:
        relevant_str = relevant_str.split("```")[0]
    

    relevant_str = relevant_str.strip().replace("\n", " ")

    return relevant_str


@_observe()
def insert_correct_dates(sql, date_range):
    pattern_start_date = r"BETWEEN\s'([0-9]{8})'\sAND\s'[0-9]{8}'"
    pattern_end_date = r"BETWEEN\s'[0-9]{8}'\sAND\s'([0-9]{8})'"

    start_date_matches = re.search(pattern_start_date, sql)
    end_date_matches = re.search(pattern_end_date, sql)

    if not start_date_matches or not end_date_matches:
        raise Exception("Invalid SQL query: no date range found")

    start_date_match = start_date_matches.group(1)
    end_date_match = end_date_matches.group(1)


    new_start_date = date_range['start_date'].replace("-", "")
    new_end_date = date_range['end_date'].replace("-", "")

    sql = sql.replace(start_date_match, new_start_date)
    sql = sql.replace(end_date_match, new_end_date)

    return sql

