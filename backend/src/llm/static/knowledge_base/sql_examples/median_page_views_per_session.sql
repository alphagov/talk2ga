-- Question: What's the median page views per session?
-- Description: This query calculates the median number of page views per session in the dataset on a specific date range.
-- Explanation: Must use APPROX_QUANTILES function to calculate the median of page views per session. Divide the set in 100 slices, take value at the 50th one.

-- SQL
SELECT
  APPROX_QUANTILES(page_views_per_session, 100)[OFFSET(50)] AS median
FROM (
  SELECT
    unique_session_id,
    COUNT(*) AS page_views_per_session
  FROM
    `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
  WHERE
    _TABLE_SUFFIX BETWEEN '20240518' AND '20240520'
    AND event_name = 'page_view'
  GROUP BY
    unique_session_id
);
