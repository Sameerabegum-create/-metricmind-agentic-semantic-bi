# MetricMind Semantic Layer

## Overview

The MetricMind semantic layer provides a governed definition of sales metrics and dimensions.

It sits between the analytical data warehouse and the AI agent so that business questions use consistent metric definitions instead of generating arbitrary SQL.

## Source Table

The semantic model uses:

METRICMIND.ANALYTICS.FCT_SALES

## Measures

### Revenue
- Name: `revenue`
- Source column: `sales`
- Aggregation: `sum`
- Description: Total sales revenue

### Profit
- Name: `profit`
- Source column: `profit`
- Aggregation: `sum`
- Description: Total profit

### Shipping Cost
- Name: `shipping_cost`
- Source column: `shipping_cost`
- Aggregation: `sum`
- Description: Total shipping cost

### Profit Margin
- Name: `profit_margin`
- Formula:

100.0 * profit / NULLIF(revenue, 0)

- Description: Profit margin percentage

### Quantity
- Name: `quantity`
- Source column: `quantity`
- Aggregation: `sum`
- Description: Total quantity of products sold

### Discount
- Name: `discount`
- Source column: `discount`
- Aggregation: `sum`
- Description: Total discount amount

## Dimensions

### Time
- `order_date` — Order date

### Geography
- `country` — Customer country
- `region` — Sales region
- `state` — Sales state
- `city` — Sales city
- `market` — Sales market

### Product
- `category` — Product category
- `sub_category` — Product sub-category
- `product_id` — Product identifier
- `product_name` — Product name

### Customer
- `segment` — Customer segment

## Governance

The semantic layer provides a controlled set of approved measures and dimensions.

For example, when a user asks for sales revenue by region, the agent should use the governed `revenue` measure and `region` dimension rather than inventing a new SQL calculation.

This helps maintain consistent business metrics across analytical queries.

## Example Business Questions

Examples of questions that can use this semantic model:

- What is the total revenue?
- What is the total profit?
- Show revenue by region.
- Show sales by country.
- What is the profit margin?
- Show revenue by category.
- Which market has the highest revenue?
- Show quantity sold by product category.

## Semantic Layer Flow

User Question

↓

Agentic Orchestrator

↓

Governed Semantic Layer

↓

Approved Measures and Dimensions

↓

Analytical Query

↓

Structured Result

↓

Business Explanation / Visualization