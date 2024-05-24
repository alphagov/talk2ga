-- Question: On average, how many sessions did each user have?
-- Description: This query calculates the average number of sessions per user in the dataset on a specific date range.

-- SQL
SELECT Avg(sessions_per_user) AS avg_sessions
FROM   (SELECT user_pseudo_id,
               Count(DISTINCT unique_session_id) AS sessions_per_user
        FROM
`ga4-analytics-352613.flattened_dataset.flattened_daily_ga_data_*`
        WHERE  _table_suffix BETWEEN '20240520' AND '20240520'
        GROUP  BY user_pseudo_id
        ORDER  BY sessions_per_user DESC);
