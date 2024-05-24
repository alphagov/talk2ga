-- Question: How many sessions were there?
-- Description: This query counts the number of sessions in the dataset on a specific date range.
-- Explanation: Must use column `unique_session_id` for sessions.

-- SQL
SELECT
  COUNT(DISTINCT unique_session_id) AS long_sessions
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20240520' AND '20240520';
