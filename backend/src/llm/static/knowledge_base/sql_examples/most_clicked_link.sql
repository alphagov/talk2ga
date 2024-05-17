-- Question: What's the most clicked link on 'http://www.gov.uk'?
-- Description: Identifies the most frequently clicked link on the 'http://www.gov.uk' website over a specified date range by counting and comparing the number of clicks each link receives.

-- SQL
SELECT
  page_location, COUNT(*) as link_clicks
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20240402' AND '20240404'
  AND (page_referrer = 'https://www.gov.uk/' OR page_referrer = 'https://www.gov.uk')
GROUP BY
  page_location
ORDER BY
  link_clicks DESC
LIMIT
  1;
