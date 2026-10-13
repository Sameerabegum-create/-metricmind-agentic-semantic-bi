# MetricMind Semantic Layer

## Purpose
Define consistent business metrics for sales analytics.

## Core Metrics

- Total Revenue: Sum of sales revenue.
- Total Cost: Sum of costs associated with sales.
- Total Profit: Total Revenue minus Total Cost.
- Total Margin: Revenue minus Cost, as represented in the existing models.
- Total Orders: Count of distinct order IDs.
- Average Order Revenue: Total Revenue divided by the number of orders.

## Dimensions
- Order Date
- Country
- State
- City
- Product

## Data Quality
The dbt build completed successfully with 44 PASS, 0 WARN, 0 ERROR, and 0 SKIP.

## Technology Stack
- dbt: SQL transformation and testing
- DuckDB: Analytical database
- SQL: Business logic and analytics
