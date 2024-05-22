-- Question: How many visits were there to GOV.UK?
-- Description: This query counts the number of visits to GOV.UK on a specific date range.
-- Explanation: A visit is the same as a unique session. Must use column `unique_session_id` for visits.

-- SQL
SELECT COUNT(DISTINCT unique_session_id) AS total_visits
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20240520' AND '20240520';
