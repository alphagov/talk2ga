from llm.validation import extract_columns
from llm.validation import validate_sql_columns
from webapp.exceptions import InvalidSQLColumnsException


QUERY_WITHOUT_URL = """
SELECT page_location,
       Count(*) AS page_views
FROM   "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*"
WHERE  _table_suffix BETWEEN '20240409' AND '20240409'
       AND event_name = 'page_view'
GROUP  BY page_location
ORDER  BY page_views DESC
LIMIT  1;
"""

QUERY_WITH_URL = """
SELECT page_title,
       Count(*) AS pageviews
FROM   "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*"
WHERE  _table_suffix BETWEEN '20240421' AND '20240423'
       AND page_location = "https://www.gov.uk/universal-credit"
       AND event_name = "page_view"
GROUP  BY page_title
ORDER  BY pageviews DESC;
"""


def test_extract_columns_from_query_fails():
    cols = extract_columns(QUERY_WITHOUT_URL)
    assert cols.sort() == ["page_title", "page_location", "event_name"].sort()

    cols = extract_columns(QUERY_WITH_URL)
    assert cols.sort() == ["page_title", "page_location", "event_name"].sort()


def test_validate_sql_columns_can_fail(mocker):
    mocker.patch(
        "llm.validation.get_schema_columns",
        return_value=["c1", "c2"],
    )

    try:
        validate_sql_columns(QUERY_WITHOUT_URL)
    except Exception as e:
        assert type(e) == InvalidSQLColumnsException


def test_validate_sql_columns_can_pass():
    validate_sql_columns(QUERY_WITHOUT_URL)
