# MetricMind Semantic Layer Validation

## Objective
Validate the governed sales metrics and dimensions defined in the Cube semantic model.

## Source
METRICMIND.ANALYTICS.FCT_SALES

## 1. Measure Validation

| Measure | Validation |
|---|---|
| Revenue | Compare the Cube result with the sum of sales in the source data. |
| Profit | Compare the Cube result with the sum of profit. |
| Shipping Cost | Compare the Cube result with the sum of shipping_cost. |
| Profit Margin | Verify the calculation: 100 * total profit / total revenue. |
| Quantity | Compare the Cube result with the sum of quantity. |
| Discount | Compare the Cube result with the sum of discount. |

Profit margin should be treated as a calculated ratio, not as a sum of row-level percentages.

## 2. Dimension Validation

Verify that the semantic model supports analysis using:

- Time: order_date
- Geography: country, region, state, city, market
- Product: category, sub_category, product_id, product_name
- Customer: segment

## 3. Business Question Test Cases

| Business question | Expected semantic elements |
|---|---|
| What is the total revenue? | revenue |
| What is the total profit? | profit |
| What is the profit margin? | profit_margin |
| Which region has the highest profit? | region, profit |
| Which product category generates the most revenue? | category, revenue |
| How does performance vary by customer segment? | segment, revenue, profit |

## 4. Agent Integration Validation

- Confirm that the agent can access the intended Cube model.
- Verify that business questions use the defined measures and dimensions.
- Compare agent results with independently verified analytical results.
- Check that the returned results can be consumed by the frontend.

## 5. Data Quality

The dbt schema tests cover important fields, including row_id, order_id and order_date. Run the tests and review their results before treating the data as validated.

## 6. Current Status

This document defines the validation plan. Individual checks must be executed and their results recorded before they can be marked as passed.
