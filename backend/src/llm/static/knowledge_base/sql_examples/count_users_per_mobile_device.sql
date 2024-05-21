-- Question: What are the different types of devices used by visitors to GOV.UK?
-- Description: This query lists the different types of devices used by visitors to GOV.UK.
-- Explanation: Uses the `category` column to inspect the different types of devices used by visitors.

-- SQL
SELECT category
FROM   `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240520`
WHERE  category IS NOT NULL
GROUP  BY category
LIMIT  20;
