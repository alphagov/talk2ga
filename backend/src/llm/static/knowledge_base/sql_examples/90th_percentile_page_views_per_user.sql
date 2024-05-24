-- Question: What's the 90th percentile of page views per user?
-- Description: This query calculates the 90th percentile of page views per user in the dataset on a specific date range.
-- Explanation: Must use APPROX_QUANTILES function to calculate the median of page views per session. Divide the set in 100 slices, take value at the 90th one. The set is previously grouped by `user_pseudo_id` and counted.

-- SQL
SELECT
  APPROX_QUANTILES(page_views_per_user, 100)[OFFSET(90)] AS percentile_90th
FROM (
  SELECT
    user_pseudo_id,
    COUNT(*) AS page_views_per_user
  FROM
    `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
  WHERE
    _TABLE_SUFFIX BETWEEN '20240518' AND '20240520'
    AND event_name = 'page_view'
  GROUP BY
    user_pseudo_id
);
