{{ config(
    materialized='table'
) }}

SELECT
    country,
    state,
    city,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(revenue) AS total_revenue,
    SUM(cost) AS total_cost,
    SUM(margin) AS total_profit,
    AVG(revenue) AS average_order_revenue
FROM {{ ref('sales_transformed') }}
GROUP BY
    country,
    state,
    city
ORDER BY total_revenue DESC