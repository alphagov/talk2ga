from llm.knowledge_bases import get_schema_columns
import json
from sql_metadata import Parser


class InvalidSQLColumnsException(Exception):
    def __init__(self, columns, wrong_columns, sql):
        self.columns = columns
        self.wrong_columns = wrong_columns
        self.sql = sql
        super().__init__(f"INVALID SQL OUTPUT: contains wrong columns: {wrong_columns}")


def extract_columns(sql_query: str) -> list[str]:
    columns = Parser(sql_query).columns 

    return columns

def validate_sql_columns(sql: str):
    columns = extract_columns(sql)
    schema_columns = get_schema_columns()

    wrong_columns = [col for col in columns if col not in schema_columns]

    if len(wrong_columns) != 0:
        raise InvalidSQLColumnsException(columns, wrong_columns, sql)

    return True


def validate_does_not_contain_suffix(sql: str):
    """
    * should not contain instance of "_TABLE_SUFFIX", because queries tend to break with that
    """
    assert "_TABLE_SUFFIX" not in sql, "INVALID SQL OUTPUT: contains _TABLE_SUFFIX"
    return True


def is_valid_sql(sql: str):
    validate_does_not_contain_suffix(sql)
    validate_sql_columns(sql)
    
    return sql
