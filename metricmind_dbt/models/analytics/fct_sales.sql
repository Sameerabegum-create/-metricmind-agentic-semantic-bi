{{ config(
    materialized='table'
) }}

SELECT
    "Row.ID" AS row_id,
    "Order.ID" AS order_id,
    "Order.Date" AS order_date,
    "Ship.Date" AS ship_date,
    "Customer.ID" AS customer_id,
    "Customer.Name" AS customer_name,
    COUNTRY AS country,
    REGION AS region,
    MARKET AS market,
    STATE AS state,
    CITY AS city,
    CATEGORY AS category,
    "Sub.Category" AS sub_category,
    "Product.ID" AS product_id,
    "Product.Name" AS product_name,
    SEGMENT AS segment,
    SALES AS sales,
    PROFIT AS profit,
    DISCOUNT AS discount,
    QUANTITY AS quantity,
    "Shipping.Cost" AS shipping_cost,
    "Ship.Mode" AS ship_mode,
    "Order.Priority" AS order_priority,
    YEAR AS order_year,
    MARKET2 AS market2,
    WEEKNUM AS weeknum

FROM {{ ref('stg_sales') }}