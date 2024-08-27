-- Question: What search terms did users enter to reach page "/sign-in-universal-credit"?
-- Description: Retrieves and ranks search terms users entered that led them to a specific page using the `select_item` event.
-- Explanation: Filters by the `select_item` event on the search results page and the destination page URL. Splits the `search_term` into individual words, counts occurrences, and returns the most common terms.
-- Note: The `link_url` column contains only URL slugs (e.g., '/sign-in-universal-credit'). Do not use absolute URLs (e.g., 'https://www.gov.uk/sign-in-universal-credit') in the WHERE clause.

-- SQL
SELECT
  word,
  COUNT(*) AS word_count
FROM
  `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_20240821`,
  UNNEST(SPLIT(search_term, ' ')) AS word
WHERE
  event_name = 'select_item'
  AND cleaned_page_location = '/search/all'
  AND link_url = '/sign-in-universal-credit'
GROUP BY
  word
ORDER BY
  word_count DESC
LIMIT 10;
