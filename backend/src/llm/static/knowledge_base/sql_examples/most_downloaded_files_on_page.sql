-- Question: What are the most downloaded files on page X?
-- Description: Retrieves the top 10 most downloaded files from a specific page.
-- Explanation: Filters events where `event_name = 'file_download'` and the page is specified by `cleaned_page_location`, groups by `link_url`, and counts the number of downloads. The results are ordered by download count.

-- SQL
SELECT
  COUNT(*) AS nb,
  link_url
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240822`
WHERE
  event_name = "file_download"
  AND cleaned_page_location = "/government/publications/success-profiles"
GROUP BY
  link_url
ORDER BY
  nb DESC
LIMIT 10;
