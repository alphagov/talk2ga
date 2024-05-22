-- Question: Where do users go next, after viewing the child benefit page?
-- Description: This query finds the pages that users visit the most after, immediately after viewing the child benefit page.
-- Explanation: To track user navigation after viewing a specific page, follow these steps:
-- 1. Inspect the referrer page using the page_referrer column.
-- 2. Filter events with the value page_view using the event_name column.
-- 3. Use the LIKE keyword for the page referrer.
-- 4. Filter the referrers to match the initially viewed page.
-- Then, filter the referrers to match the initially viewed page.

-- SQL
SELECT cleaned_page_location, COUNT(cleaned_page_location) AS view_count
FROM `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE event_name = 'page_view'
  AND page_referrer LIKE '%/child-benefit%'
  AND _TABLE_SUFFIX BETWEEN '20240520' AND '20240520'
GROUP BY cleaned_page_location
ORDER BY view_count DESC
LIMIT 10;
