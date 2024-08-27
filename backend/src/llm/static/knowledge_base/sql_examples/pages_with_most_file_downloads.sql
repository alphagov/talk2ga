-- Question: Which pages have the most file downloads?
-- Description: Retrieves the top 10 pages with the most file downloads.
-- Explanation: Filters events where `event_name = 'file_download'`, groups by `cleaned_page_location`, and counts the number of downloads. The results are ordered by download count.

-- SQL
SELECT
  COUNT(*) AS nb,
  cleaned_page_location
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240822`
WHERE
  event_name = "file_download"
GROUP BY
  cleaned_page_location
ORDER BY
  nb DESC
LIMIT 10;
