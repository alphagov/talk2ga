from llm.knowledge_bases import get_schema_columns
from sqlglot import parse_one, exp
from webapp.exceptions import InvalidSQLColumnsException
from llm.flags import _observe


# List of columns that are allowed to be used in the SQL query
# The validation SQL compiler tends to pick up on keywords that aren't columns
# Such as _TABLE_SUFFIX, which is a valid keyword in BigQuery
COLUMNS_DENY_LIST = ["_TABLE_SUFFIX", "_table_suffix"]


def extract_columns(sql_query: str) -> list[str]:
    sql = sql_query.replace("`", '"')  # SqlGlot doesn't support backticks
    cols = [column.alias_or_name for column in parse_one(sql).find_all(exp.Column) if column.this.quoted == False]
    aliases = [column.alias_or_name for column in parse_one(sql).find_all(exp.Alias)]
    cols = [c for c in cols if c not in aliases]
    cols = [c for c in cols if c not in COLUMNS_DENY_LIST]
    cols = list(set(cols))

    return cols


def validate_sql_columns(sql: str):
    columns = extract_columns(sql)
    schema_columns = get_schema_columns()

    wrong_columns = [col for col in columns if col not in schema_columns]

    for wg in wrong_columns:
        for wc in COLUMNS_DENY_LIST:
            if callable(wc):
                if wc(wg):
                    wrong_columns.remove(wg)
                    break
            elif wc == wg:
                wrong_columns.remove(wg)
                break

    if len(wrong_columns) != 0:
        raise InvalidSQLColumnsException(columns, wrong_columns, sql)

    return True


# List of validators to run on the SQL query
VALIDATORS = [
    validate_sql_columns,
]


@_observe()
def is_valid_sql(sql: str):
    # The first validator to raise an exception will stop the execution
    for validator in VALIDATORS:
        validator(sql)

    return sql
