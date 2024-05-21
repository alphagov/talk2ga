-- Question: What are the most popular hours of the day for visits to GOV.UK
-- Description: This query will return the most popular hours of the day for visits to GOV.UK
-- Explanation: uses BigQuery's EXTRACT function to extract the hour from the event_timestamp field and groups by the hour of the day to count the number of events that occurred in each hour of the day.

-- SQL
SELECT FORMAT_TIMESTAMP('%H', TIMESTAMP_MILLIS(CAST(event_timestamp/1000 AS INT64))) AS hour_of_the_day,
       COUNT(*) AS event_count
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE _TABLE_SUFFIX BETWEEN '20240520' AND '20240520'
GROUP BY hour_of_the_day
ORDER BY event_count DESC;
