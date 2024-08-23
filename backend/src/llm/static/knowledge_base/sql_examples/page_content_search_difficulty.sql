-- Question: On what pages do users struggle to find content or information?
-- Question: Which pages lead to the most searches?
-- Question: On which pages do users frequently use the search bar?
-- Question: What pages cause users to search for more information?
-- Question: Where do users typically need to search for additional content?
-- Description: Retrieves the top 10 pages where users performed the most searches, indicating potential difficulty in finding content.
-- Explanation: Filters events to those where `event_name = 'search'`, groups by page URL slug, and counts the number of searches per page. The top 10 pages with the highest search counts are returned.

-- SQL
SELECT
  cleaned_page_location AS page_slug,
  COUNT(*) AS search_count
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240821`
WHERE
  event_name = 'search'
GROUP BY
  cleaned_page_location
ORDER BY
  search_count DESC
LIMIT 10;
