{{ config(
    materialized='table'
) }}

SELECT
    product,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(revenue) AS total_revenue,
    SUM(cost) AS total_cost,
    SUM(margin) AS total_margin,
   AVG(revenue) AS average_revenue,
AVG(cost) AS average_cost,
AVG(margin) AS average_margin
FROM {{ ref('sales_transformed') }}
GROUP BY product
ORDER BY total_revenue DESC