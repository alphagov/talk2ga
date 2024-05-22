-- Question: How many page views were there?
-- Description: This query counts the total number of page views in the dataset on a specific date range.
-- Explanation: Must use column `event_name` for page views and filter it by value 'page_view'.

-- SQL
SELECT DISTINCT event_name
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240520`
WHERE event_name = 'page_view'
LIMIT 10;
