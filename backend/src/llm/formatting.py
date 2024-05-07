import re
import sqlparse
from sqlglot import parse_one, exp
from sqlglot.expressions import Subquery
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


def replace_dataset_in_sql_ast(parsed_sql, new_dataset):
    """
    This function replaces the dataset in the SQL AST
    Compatible with nested SQL queries
    """

    from_clause = parsed_sql.find(exp.From).this

    if type(from_clause) == Subquery:
        within_brackets = lambda x: f"({x.strip()})"
        parsed_sql = parsed_sql.from_(
            within_brackets(
                replace_dataset_in_sql_ast(from_clause.this, new_dataset).sql()
            )
        )
    else:
        return parsed_sql.from_(new_dataset)

    return parsed_sql


@_observe()
def insert_correct_dataset(sql):
    clean_sql = sql.replace("`", '"')
    DATASET = "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*"
    dataset_is_correct = f"FROM {DATASET}" in clean_sql
    if dataset_is_correct:
        return sql

    parsed_sql = parse_one(clean_sql)

    new_parsed_sql = replace_dataset_in_sql_ast(parsed_sql, f"'{DATASET}'")
    new_sql = new_parsed_sql.sql()

    new_sql = new_sql.replace(f"'{DATASET}'", f"`{DATASET}`")
    new_sql = new_sql.replace(f'"{DATASET}"', f"`{DATASET}`")

    # Now, just in case, manually replace any instances of the wrong dataset
    # This is a dataset that is often hallucinated by the model
    wrong_dataset = "flattened_dataset.flattened_daily_ga_data_*"
    new_sql = new_sql.replace(f"'{wrong_dataset}'", f"`{DATASET}`")
    new_sql = new_sql.replace(f"`{wrong_dataset}`", f"`{DATASET}`")
    new_sql = new_sql.replace(f'"{wrong_dataset}"', f"`{DATASET}`")

    return new_sql


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


@_observe()
def contains_date_range(sql: str) -> bool:
    pattern = re.compile(
        "(where)[\s\n\t]+_TABLE_SUFFIX[\s\n\t]+between[\s\n\t]+'[a-zA-Z0-9]+'[\s\n\t]+and[\s\n\t]+'[a-zA-Z0-9]+'",
        re.IGNORECASE,
    )
    return bool(pattern.search(sql))
