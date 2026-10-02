-- Analytics SQL Queries

-- 1. Total Revenue
SELECT
    SUM(revenue) AS total_revenue
FROM analytics_sales;

-- 2. Total Cost
SELECT
    SUM(cost) AS total_cost
FROM analytics_sales;

-- 3. Total Profit
SELECT
    SUM(margin) AS total_profit
FROM analytics_sales;

-- 4. Revenue by Country
SELECT
    country,
    SUM(revenue) AS total_revenue
FROM analytics_sales
GROUP BY country
ORDER BY total_revenue DESC;

-- 5. Revenue by Product
SELECT
    product,
    SUM(revenue) AS total_revenue
FROM analytics_sales
GROUP BY product
ORDER BY total_revenue DESC;