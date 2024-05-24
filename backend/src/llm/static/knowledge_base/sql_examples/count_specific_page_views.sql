-- Question: How many page views were there for "/log-in-register-hmrc-online-services"?
-- Description: This query counts the total number of page views in the dataset on a specific date range for a specific page URL slug.
-- Explanation: Must use column `event_name` for page views and filter it by value 'page_view' as well as the cleaned_page_location since it's a URL slug.

-- SQL
SELECT COUNT(*)
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240520`
WHERE event_name = 'page_view'
AND cleaned_page_location = '/log-in-register-hmrc-online-services'
LIMIT 10;
