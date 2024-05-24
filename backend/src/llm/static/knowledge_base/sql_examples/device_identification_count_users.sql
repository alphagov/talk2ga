-- Question: How many visitors to GOV.UK are using mobile devices?
-- Description: This query counts the number of visitors to GOV.UK who are using mobile devices.
-- Explanation: Uses the `category` column to filter for mobile devices.

-- SQL
SELECT
  COUNT(DISTINCT user_pseudo_id) AS mobile_users
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20240520' AND '20240520'
  AND category LIKE '%mobile%';
