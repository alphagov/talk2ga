-- Question: What is the average page views per user for the top 10% of users based on page views?
-- Description: This query calculates the average number of page views per user for the top 10% of users based on page views in the dataset on a specific date range.
-- Explanation:
-- 1. UserPageViews calculates the count of page views per user.
-- 2. RankedUsers ranks users based on their page views and calculates the total number of users.
-- 3. Top10PercentUsers selects the top 10% of users based on their page views.
-- 4. The final query calculates the average page views for these top 10% users by filtering the UserPageViews dataset to include only those users.

-- SQL
WITH UserPageViews AS (
  SELECT
    user_pseudo_id,
    COUNT(*) AS page_views
  FROM
    `ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
  WHERE
    _TABLE_SUFFIX BETWEEN '20240520' AND '20240520'
    AND event_name = 'page_view'
  GROUP BY
    user_pseudo_id
),
RankedUsers AS (
  SELECT
    user_pseudo_id,
    page_views,
    ROW_NUMBER() OVER (ORDER BY page_views DESC) AS row_num,
    COUNT(*) OVER () AS total_users
  FROM
    UserPageViews
),
Top10PercentUsers AS (
  SELECT
    user_pseudo_id
  FROM
    RankedUsers
  WHERE
    row_num <= total_users * 0.1
)

SELECT
  AVG(page_views) AS avg_page_views
FROM
  UserPageViews
WHERE
  user_pseudo_id IN (SELECT user_pseudo_id FROM Top10PercentUsers);
