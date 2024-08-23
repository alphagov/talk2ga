-- Question: What are the files downloaded the most, along with their pages?
-- Description: Retrieves the top 10 most downloaded files along with the pages they were downloaded from.
-- Explanation: Filters events where `event_name = 'file_download'`, groups by both `link_url` and `cleaned_page_location`, and counts the downloads. The results are ordered by download count.

-- SQL
SELECT 
  COUNT(*) AS nb, 
  cleaned_page_location, 
  link_url 
FROM 
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240822` 
WHERE 
  event_name = "file_download" 
GROUP BY 
  link_url, 
  cleaned_page_location 
ORDER BY 
  nb DESC 
LIMIT 10;
