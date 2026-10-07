# MetricMind — Agentic Semantic BI

MetricMind is a data analytics and semantic BI project built with **dbt** and **DuckDB**. The project transforms raw sales data into analytics-ready models and provides business metrics for revenue, cost, margin, customers, products, and sales performance.

## Project Overview

The dbt project follows a transformation pipeline:

**Raw Sales Data → Transformed Sales → Business Metrics → Analytics Models**

The goal is to create a reliable analytics layer that can be used by BI tools and AI-driven analytics applications.

## Technology Stack

* **dbt Core** — Data transformation and testing
* **DuckDB** — Analytical database
* **SQL** — Data transformation and analytics
* **Git/GitHub** — Version control
* **Python** — dbt environment and tooling

## Project Structure

```text
metricmind_dbt/
│
├── analyses/
│   └── analytics_queries.sql
│
├── models/
│   ├── sales_transformed.sql
│   ├── metrics.sql
│   ├── analytics_sales.sql
│   ├── product_analytics.sql
│   ├── customer_analytics.sql
│   └── schema.yml
│
├── seeds/
│   └── sales.csv
│
├── macros/
├── snapshots/
├── tests/
├── logs/
├── target/
│
├── dbt_project.yml
└── README.md
```

## Data Pipeline

### 1. Sales Seed

`seeds/sales.csv`

Contains the raw sales data used as the starting point of the transformation pipeline.

### 2. Sales Transformation

`models/sales_transformed.sql`

Transforms the raw sales data into a structured analytical table.

Key fields include:

* Order ID
* Order date
* Country
* State
* City
* Product
* Revenue
* Cost
* Margin

Margin is calculated as:

```text
Margin = Revenue - Cost
```

### 3. Metrics Model

`models/metrics.sql`

Provides core business metrics such as:

* Total Revenue
* Total Cost
* Total Margin

### 4. Sales Analytics

`models/analytics_sales.sql`

Provides sales-level analytical information that can be used for business reporting and performance analysis.

### 5. Product Analytics

`models/product_analytics.sql`

Aggregates sales performance by product.

Key metrics include:

* Total orders
* Total revenue
* Total cost
* Total margin
* Average revenue
* Average cost
* Average margin

Products can be ordered by total revenue to identify the highest-performing products.

### 6. Customer Analytics

`models/customer_analytics.sql`

Provides customer-level analytical information for understanding customer sales performance.

### 7. Analytics Queries

`analyses/analytics_queries.sql`

Contains analytical SQL queries for answering business questions such as:

* What is the total revenue?
* What is the total cost?
* What is the total profit/margin?
* Which countries generate the most revenue?
* Which products generate the most revenue?

## Data Quality

The project includes dbt schema tests in:

```text
models/schema.yml
```

Current tests cover important data-quality requirements such as:

* `not_null`
* `unique`

These tests help ensure that important fields such as order ID, revenue, cost, country, and order date contain valid values.

## Running the Project

After activating the Python virtual environment, the normal dbt commands are:

```bash
dbt seed
dbt run
dbt test
dbt build
```

To run a specific model:

```bash
dbt run --select model_name
```

For example:

```bash
dbt run --select product_analytics
```

## Current Development Status

The project currently contains:

* **1 seed**
* **6 analytical models**
* **9 schema tests**
* Sales transformation layer
* Business metrics layer
* Product analytics
* Customer analytics
* Sales analytics
* Business analytics queries

## Data Quality and Validation

The project uses dbt tests to validate important fields and maintain data quality throughout the transformation pipeline.

The analytical models are designed to support reliable business reporting and future integration with the broader MetricMind Agentic Semantic BI architecture.

## Future Scope

Planned improvements include:

* Additional business KPIs
* More advanced semantic-layer definitions
* AI-powered natural-language analytics
* BI dashboard integration
* Automated data-quality monitoring
* Additional analytical dimensions
* Backend/API integration
* Frontend visualization

## Author

MetricMind — Data Analytics & Semantic BI Project
