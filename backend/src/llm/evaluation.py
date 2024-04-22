from llm.knowledge_bases import get_schema_columns
from sql_metadata import Parser
from webapp.exceptions import InvalidSQLColumnsException
from llm.flags import _observe


# List of columns that are allowed to be used in the SQL query
# The validation SQL compiler tends to pick up on keywords that aren't columns
# Such as _TABLE_SUFFIX, which is a valid keyword in BigQuery
WRONG_COLUMNS_ALLOW_LIST = ["_TABLE_SUFFIX"]


def extract_columns(sql_query: str) -> list[str]:
    columns = Parser(sql_query).columns

    return columns


def validate_sql_columns(sql: str):
    columns = extract_columns(sql)
    schema_columns = get_schema_columns()

    wrong_columns = [col for col in columns if col not in schema_columns]

    for wg in wrong_columns:
        if wg in WRONG_COLUMNS_ALLOW_LIST:
            wrong_columns.remove(wg)

    if len(wrong_columns) != 0:
        raise InvalidSQLColumnsException(columns, wrong_columns, sql)

    return True


def validate_does_not_contain_suffix(sql: str):
    """
    * should not contain instance of "_TABLE_SUFFIX", because queries tend to break with that
    """
    assert "_TABLE_SUFFIX" not in sql, "INVALID SQL OUTPUT: contains _TABLE_SUFFIX"
    return True


# List of validators to run on the SQL query
VALIDATORS = [
    validate_sql_columns,
    # validate_does_not_contain_suffix,
]


@_observe()
def is_valid_sql(sql: str):
    # The first validator to raise an exception will stop the execution
    for validator in VALIDATORS:
        validator(sql)

    return sql
