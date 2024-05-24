-- Question: What is the proportion of events generated from mobile devices?
-- Description: This query calculates the proportion of events generated from mobile devices as a percentage of all events.
-- Explanation: Uses the `category` column for filtering and calculates the percentage of mobile events.

-- SQL
SELECT
  *
FROM
  `SOME_DATASASET.SOME_TABLE`;

SELECT
  COUNTIF(category LIKE '%mobile%') * 100.0 / COUNT(*) AS percentage_mobile_events
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _table_suffix BETWEEN '20240520' AND '20240520';
