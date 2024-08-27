-- Question: What is the file downloaded the most?
-- Description: Retrieves the top 10 most downloaded files on the website.
-- Explanation: Filters events where `event_name = 'file_download'`, groups by `link_url`, and counts the number of downloads for each file. The results are ordered by download count.

-- SQL
SELECT
  COUNT(*) AS nb,
  link_url
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240822`
WHERE
  event_name = "file_download"
GROUP BY
  link_url
ORDER BY
  nb DESC
LIMIT 10;
