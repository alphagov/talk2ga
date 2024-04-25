from llm.formatting import remove_comments, format_sql

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
        == """\
SELECT COUNT(DISTINCT unique_session_id) AS unique_page_views
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20220101' AND '20230101'
  AND page_location = 'https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-yes'"""
    )
