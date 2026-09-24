{{ config(
    materialized='view'
) }}

SELECT
    COUNT(*) AS total_records,
    SUM(revenue) AS total_revenue,
    SUM(cost) AS total_cost,
    SUM(margin) AS total_margin
FROM {{ ref('sales_transformed') }}