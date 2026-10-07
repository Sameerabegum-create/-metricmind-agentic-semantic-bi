# MetricMind Architecture

## 1. Overview

MetricMind is an Agentic Semantic BI project designed to transform raw business data into analytics-ready information.

The project uses dbt for data transformation, testing, and analytics modeling.

The overall flow is:

```text
Raw Sales Data
      ↓
Sales Transformation
      ↓
Business Metrics
      ↓
Analytics Models
      ↓
Semantic / BI Layer
      ↓
AI Agent & Backend
      ↓
Frontend & Visualization
```

## 2. Current dbt Architecture

The current dbt project focuses on the data transformation and analytics layer.

```text
seeds/sales.csv
      ↓
sales_transformed
      ↓
 ┌───────────────┬──────────────────┬────────────────────┐
 ↓               ↓                  ↓
metrics     analytics_sales   product_analytics
                                      ↓
                              customer_analytics

analyses/analytics_queries.sql
```

## 3. Data Source

The primary data source is:

```text
seeds/sales.csv
```

The sales seed contains raw sales information that is loaded into the analytical environment using dbt.

Important business fields include:

* Order ID
* Order Date
* Country
* State
* City
* Product
* Revenue
* Cost

## 4. Transformation Layer

The main transformation model is:

```text
models/sales_transformed.sql
```

This model converts the raw sales data into a structured analytical table.

It also calculates the business margin:

```text
Margin = Revenue - Cost
```

This transformed dataset becomes the foundation for downstream analytics models.

## 5. Business Metrics Layer

The metrics model is:

```text
models/metrics.sql
```

It provides core business metrics such as:

* Total Revenue
* Total Cost
* Total Margin

These metrics can be used by dashboards, BI applications, and future AI-powered analytics.

## 6. Analytics Layer

The project contains several analytical models.

### Sales Analytics

```text
models/analytics_sales.sql
```

Provides sales-level information for business reporting and performance analysis.

### Product Analytics

```text
models/product_analytics.sql
```

Aggregates sales performance by product.

Important metrics include:

* Total Orders
* Total Revenue
* Total Cost
* Total Margin
* Average Revenue
* Average Cost
* Average Margin

### Customer Analytics

```text
models/customer_analytics.sql
```

Provides customer-level analytical information that can be used to understand customer sales performance.

## 7. Analytical Queries

Business-oriented SQL queries are maintained in:

```text
analyses/analytics_queries.sql
```

These queries answer questions such as:

* What is the total revenue?
* What is the total cost?
* What is the total margin?
* Which country generates the most revenue?
* Which product generates the most revenue?

## 8. Data Quality

Data quality is managed using dbt schema tests.

The test definitions are maintained in:

```text
models/schema.yml
```

Current tests include:

* `not_null`
* `unique`

These tests help verify that important fields contain valid and non-duplicated data.

## 9. Future Agentic BI Architecture

The broader MetricMind architecture can be extended beyond the current dbt layer.

```text
                 ┌──────────────────────┐
                 │     Raw Data         │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │   dbt Transformation │
                 │      & Testing       │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │   Semantic / BI      │
                 │       Layer          │
```
