import traceback
import sys
import json


class CustomException(Exception):
    pass


class InvalidSQLColumnsException(CustomException):
    def __init__(self, columns, wrong_columns, sql):
        self.columns = columns
        self.wrong_columns = wrong_columns
        self.sql = sql
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback_details = traceback.format_exception(
            exc_type, exc_value, exc_traceback
        )
        # self.traceback = traceback_details
        # self.traceback = traceback.format_exc()
        super().__init__(f"INVALID SQL OUTPUT: contains wrong columns: {wrong_columns}")

    def __str__(self):
        return json.dumps(
            {
                "code": "INVALID_SQL_COLUMNS",
                "columns": self.columns,
                "wrong_columns": self.wrong_columns,
                "sql": self.sql,
                "traceback": traceback.format_tb(self.__traceback__),
            }
        )


def is_custom_exception(exception: Exception) -> bool:
    return issubclass(exception.__class__, CustomException)


def format_builtin_exception(exception: Exception) -> str:
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback_details = traceback.format_exception(exc_type, exc_value, exc_traceback)

    return json.dumps(
        {
            "message": str(exception),
            "code": exception.__class__.__name__,
            "traceback": traceback_details,
        }
    )


def format_exception(exception: Exception) -> str:
    if is_custom_exception(exception):
        return str(exception)
    else:
        return format_builtin_exception(exception)
