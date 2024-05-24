-- Question: What proportion of users come from mobile devices?
-- Equivalent question: What proportion of users use mobile devices?
-- Description: This query calculates the proportion of users interacting with GOV.UK using a mobile device.
-- Explanation: Uses the `user_pseudo_id` column to identify unique users with the keyword `distinct`, and counte them. Also filters them by the `category` column to identify mobile users.

-- SQL
SELECT
  COUNT(DISTINCT CASE WHEN category LIKE '%mobile%' THEN user_pseudo_id END) * 100.0 / COUNT(DISTINCT user_pseudo_id) AS percentage_mobile_users
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20240520' AND '20240520';
