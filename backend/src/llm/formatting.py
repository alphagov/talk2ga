import re
import sqlparse
from sqlglot import parse_one
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
    pattern_start_date = r"BETWEEN[\s\t\n]+'([0-9a-zA-Z_\-]{8,12})'[\s\t\n]+AND[\s\t\n]+'[0-9a-zA-Z_\-]{8,12}'"
    pattern_end_date = r"BETWEEN[\s\t\n]+'[0-9a-zA-Z_\-]{8,12}'[\s\t\n]+AND[\s\t\n]+'([0-9a-zA-Z_\-]{8,12})'"

    start_date_matches = re.search(pattern_start_date, sql)
    end_date_matches = re.search(pattern_end_date, sql)

    if not start_date_matches or not end_date_matches:
        raise Exception("Invalid SQL query: no date range found")

    start_date_match = start_date_matches.group(1)
    end_date_match = end_date_matches.group(1)

    new_start_date = date_range["start_date"].replace("-", "")
    new_end_date = date_range["end_date"].replace("-", "")

    sql = sql.replace(start_date_match, new_start_date)
    sql = sql.replace(end_date_match, new_end_date)

    return sql


@_observe()
def insert_correct_dataset(sql):
    clean_sql = sql.replace("`", '"')
    DATASET = "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*"
    dataset_is_correct = f"FROM {DATASET}" in clean_sql
    if dataset_is_correct:
        return sql

    sql = parse_one(clean_sql).from_(f"'{DATASET}'").sql()
    sql = sql.replace(f"'{DATASET}'", f"`{DATASET}`")
    sql = sql.replace(f'"{DATASET}"', f"`{DATASET}`")

    return sql


@_observe()
def remove_comments(sql):
    sql = re.sub(r"^(?:[\t\s]+)?--.*$", "", sql, flags=re.MULTILINE)
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    sql = "\n".join(
        line for line in sql.split("\n") if not line.strip().startswith("--")
    )
    sql = "\n".join(line for line in sql.split("\n") if line.strip())

    return sql


@_observe()
def format_sql(sql):
    striped_sql = sql.strip()
    if striped_sql[-1] == ";":
        striped_sql = striped_sql[:-1]
    sanitised_one_line_comment = re.sub(r"^\s*--[\w\s]+\s*(SELECT\s)", r"\1", sql)
    prettified_sql = sqlparse.format(
        sanitised_one_line_comment, reindent=True, keyword_case="upper"
    )

    if prettified_sql[-1] != ";":
        prettified_sql += ";"

    return prettified_sql
