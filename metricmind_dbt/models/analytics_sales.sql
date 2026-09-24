{{ config(
    materialized='table'
) }}

SELECT
    country,
    state,
    city,
    product,
    COUNT(*) AS total_orders,
    SUM(revenue) AS total_revenue,
    SUM(cost) AS total_cost,
    SUM(margin) AS total_margin,
    AVG(revenue) AS average_revenue
FROM {{ ref('sales_transformed') }}
GROUP BY
    country,
    state,
    city,
    product