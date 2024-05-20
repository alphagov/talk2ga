# flake8: noqa: W503

from llm.formatting import (
    remove_comments,
    format_sql,
    insert_correct_dataset,
    insert_correct_dates,
    contains_date_range,
)

QUERY_WITH_COMMENT = """
-- Calculate unique page views for a specific page
SELECT
  COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'
"""

QUERY_WITH_MANY_COMMENTS = """
-- Calculate unique page views for a specific page
SELECT
  COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM
    -- Calculate unique page views for a specific page-- Calculate unique page views for a specific page
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
                -- Calculate unique page views for a specific page
WHERE
  _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'
"""


POORLY_FORMATTED_QUERY = """
-- Calculate unique page views for a specific page SELECT   COUNT(DISTINCT unique_session_id) AS unique_page_views FROM   `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*` WHERE   _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'   AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'
"""


def test_remove_comments():
    assert (
        remove_comments(QUERY_WITH_COMMENT)
        == """SELECT
  COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'"""
    )

    assert (
        remove_comments(QUERY_WITH_MANY_COMMENTS)
        == """SELECT
  COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'"""
    )


def test_format_sql():
    assert (
        format_sql(POORLY_FORMATTED_QUERY)
        == """SELECT COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes';"""
    )


def test_insert_correct_dataset():
    BAD_DATASET_SQL = """SELECT page_location,
       COUNT(*) AS link_clicks
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20230308' AND '20230310'
  AND (page_referrer = 'https://www.gov.uk/'
       OR page_referrer = 'https://www.gov.uk')
GROUP BY page_location
ORDER BY link_clicks DESC
LIMIT 1;
"""
    GOOD_DATASET_SQL = """SELECT page_location,
       COUNT(*) AS page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20240403' AND '20240404'
  AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1;"""

    assert format_sql(insert_correct_dataset(BAD_DATASET_SQL)) == format_sql(
        BAD_DATASET_SQL.replace(
            "flattened_dataset.flattened_daily_ga_data_*",
            "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*",
        )
    )

    assert format_sql(insert_correct_dataset(GOOD_DATASET_SQL)) == format_sql(GOOD_DATASET_SQL)

    BAD_NESTED_SQL = """SELECT
  page_location,
  COUNT(*) AS page_views
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY user_pseudo_id, ga_sessionid ORDER BY event_timestamp) AS rn
  FROM
    `flattened_dataset.flattened_daily_ga_data_*`
  WHERE
    _TABLE_SUFFIX BETWEEN '20230101' AND '20230131'
    AND event_name = 'page_view')
WHERE rn = 1
GROUP BY
  page_location
ORDER BY
  page_views DESC
LIMIT 1;"""

    GOOD_NESTED_SQL = BAD_NESTED_SQL.replace(
        "flattened_dataset.flattened_daily_ga_data_*",
        "ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*",
    )

    assert format_sql(insert_correct_dataset(BAD_NESTED_SQL)) == format_sql(GOOD_NESTED_SQL)


def test_insert_correct_dates():
    SQL_1 = """SELECT page_location,
       COUNT(*) AS page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20240403' AND '20240404'
  AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1;"""

    SQL_2 = """SELECT page_location,
       COUNT(*) AS page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX
    BETWEEN '20240403' AND '20240404'
  AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1;"""

    SQL_3 = """SELECT page_location,
       COUNT(*) AS page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`





WHERE _TABLE_SUFFIX           BETWEEN
        '20240403'
        AND



  '20240404'
  AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1;"""

    SQL_4 = """SELECT page_location, COUNT(*) AS page_views FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*` WHERE _TABLE_SUFFIX BETWEEN 'START_DATE' AND 'END_DATE' AND event_name = 'page_view' GROUP BY page_location ORDER BY page_views DESC LIMIT 1"""

    assert insert_correct_dates(SQL_1, {"start_date": "11111111", "end_date": "22222222"}) == SQL_1.replace("20240403", "11111111").replace("20240404", "22222222")

    assert insert_correct_dates(SQL_2, {"start_date": "11111111", "end_date": "22222222"}) == SQL_2.replace("20240403", "11111111").replace("20240404", "22222222")

    assert insert_correct_dates(SQL_3, {"start_date": "11111111", "end_date": "22222222"}) == SQL_3.replace("20240403", "11111111").replace("20240404", "22222222")

    assert insert_correct_dates(SQL_4, {"start_date": "11111111", "end_date": "22222222"}) == SQL_4.replace("START_DATE", "11111111").replace("END_DATE", "22222222")


def test_contains_date_range():
    SQL_CONTAINS_1 = """```sql
SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20230101' AND '20230131'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1;
```"""

    SQL_CONTAINS_2 = """
SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20230101' AND '20230131'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    SQL_CONTAINS_3 = """
SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE

_TABLE_SUFFIX               BETWEEN


  'jmfds9gds' AND

        'fdsewr'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    assert contains_date_range(SQL_CONTAINS_1) == True
    assert contains_date_range(SQL_CONTAINS_2) == True
    assert contains_date_range(SQL_CONTAINS_3) == True

    SQL_NOT_CONTAINS_1 = """SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX '20230101' AND '20230131'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    SQL_NOT_CONTAINS_2 = """SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN AND '20230131'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    SQL_NOT_CONTAINS_3 = """SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    SQL_NOT_CONTAINS_4 = """SELECT page_location, COUNT(*) AS page_views
FROM `flattened_dataset.flattened_daily_ga_data_*`
WHERE _DATE_RANGE BETWEEN AND '20230131'
AND event_name = 'page_view'
GROUP BY page_location
ORDER BY page_views DESC
LIMIT 1"""

    assert contains_date_range(SQL_NOT_CONTAINS_1) == False
    assert contains_date_range(SQL_NOT_CONTAINS_2) == False
    assert contains_date_range(SQL_NOT_CONTAINS_3) == False
    assert contains_date_range(SQL_NOT_CONTAINS_4) == False
