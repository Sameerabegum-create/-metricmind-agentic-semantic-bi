{{ config(materialized='table') }}

SELECT
    order_id,
    CAST(order_date AS DATE) AS order_date,
    country,
    state,
    city,
    product,
    revenue,
    cost,
    revenue - cost AS margin
FROM {{ ref('sales') }}
