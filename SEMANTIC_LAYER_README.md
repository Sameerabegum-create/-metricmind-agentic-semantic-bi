\# MetricMind - Semantic Layer and Analytics



\## 1. Project Overview



MetricMind is a data analytics project that aims to provide consistent business insights from sales data through a governed semantic layer.



My contribution focuses on developing and documenting the \*\*semantic layer and analytics foundation\*\*. This layer defines standardized sales measures and dimensions so that business questions can be translated into consistent analytical queries.



The work includes:



\- Developing Cube semantic model definitions.

\- Defining reusable sales metrics.

\- Organizing dimensions for business analysis.

\- Adding dbt data-quality tests.

\- Documenting metric definitions and governance practices.

\- Preparing a validation plan for semantic metrics and business questions.



\## 2. My Role and Responsibilities



\*\*Role:\*\* Semantic Layer and Analytics



My responsibilities include:



\- Defining business measures and dimensions in Cube.

\- Creating reusable metric definitions for sales analysis.

\- Adding data-quality tests to the dbt model schema.

\- Documenting the semantic layer and its intended usage.

\- Preparing test cases for validating business questions.

\- Identifying configuration requirements and validation limitations.



\## 3. Technology Stack



| Technology | Purpose |

|---|---|

| Cube | Semantic modeling of business measures and dimensions |

| dbt Core | SQL-based data transformation and data-quality testing |

| Snowflake | Intended data warehouse for analytical sales data |

| SQL | Data transformation and metric calculations |

| YAML | Cube model definitions, dbt configuration, and schema tests |

| Git and GitHub | Version control and collaboration |



\## 4. Semantic Layer Architecture



The semantic layer uses the transformed sales fact table as its analytical source.



\*\*Source table:\*\* `METRICMIND.ANALYTICS.FCT\_SALES`



The intended data flow is:



```text

Raw Sales Data in Snowflake

&#x20;           |

&#x20;           v

&#x20;     dbt Staging Model

&#x20;        stg\_sales

&#x20;           |

&#x20;           v

&#x20;    dbt Fact Model

&#x20;        fct\_sales

&#x20;           |

&#x20;           v

&#x20;    Cube Semantic Layer

&#x20;      Measures and Dimensions

&#x20;           |

&#x20;           v

&#x20;   Analytical Queries

&#x20;           |

&#x20;           v

&#x20;Business Insights and Results

```



The Cube semantic model is defined in `cube/sales.yml`.



\## 5. Business Measures



The following measures are defined in the current Cube sales model.



| Measure | Definition | Business Purpose |

|---|---|---|

| `revenue` | Sum of `sales` | Analyze total sales revenue |

| `profit` | Sum of `profit` | Measure total profit |

| `shipping\_cost` | Sum of `shipping\_cost` | Analyze total shipping costs |

| `profit\_margin` | `100.0 \* profit / NULLIF(revenue, 0)` | Calculate profit as a percentage of revenue |

| `quantity` | Sum of `quantity` | Measure total units sold |

| `discount` | Sum of `discount` | Analyze total discount values |

| `average\_discount` | Average of `discount` | Calculate the average discount field value per sales record |

| `average\_selling\_price` | `1.0 \* revenue / NULLIF(quantity, 0)` | Calculate average revenue per unit sold |



\### Metric Interpretation



\- \*\*Revenue:\*\* Helps compare sales performance across markets, regions, categories, and time periods.

\- \*\*Profit:\*\* Helps assess the profit generated from sales.

\- \*\*Shipping cost:\*\* Helps analyze shipping expenses.

\- \*\*Profit margin:\*\* Measures profitability relative to revenue and is expressed as a percentage.

\- \*\*Quantity:\*\* Measures the total quantity of products sold.

\- \*\*Discount:\*\* Represents the total value of the source discount field.

\- \*\*Average discount:\*\* Represents the average value of the source discount field per sales record. Its units should be confirmed before interpreting it as a currency amount.

\- \*\*Average selling price:\*\* Divides total revenue by total quantity, with division-by-zero handling.



The Cube model is the implementation source of truth for these definitions.



\## 6. Business Dimensions



Dimensions allow measures to be grouped, filtered, and analyzed from different business perspectives.



\### Time

\- `order\_date` - Order date



\### Geography

\- `country` - Customer country

\- `region` - Sales region

\- `state` - Sales state

\- `city` - Sales city

\- `market` - Sales market



\### Product

\- `category` - Product category

\- `sub\_category` - Product sub-category

\- `product\_id` - Product identifier

\- `product\_name` - Product name



\### Customer

\- `segment` - Customer segment



These dimensions support comparisons across geographic areas, products, customer segments, and time periods.



\## 7. dbt Data Transformation



The dbt project is located in `metricmind\_dbt/`.



\### Source Configuration



File: `metricmind\_dbt/models/staging/sources.yml`



The source is configured as:



\- Database: `METRICMIND`

\- Schema: `RAW`

\- Table: `SALES`



\### Staging Model



File: `metricmind\_dbt/models/staging/stg\_sales.sql`



The staging model is configured as a view and selects records from the declared raw sales source.



\### Fact Model



File: `metricmind\_dbt/models/analytics/fct\_sales.sql`



The fact model is configured as a table and references `stg\_sales`.



Its transformations include renaming source fields into standardized names such as:



\- `Row.ID` to `row\_id`

\- `Order.ID` to `order\_id`

\- `Order.Date` to `order\_date`

\- `Sub.Category` to `sub\_category`

\- `Product.ID` to `product\_id`

\- `Product.Name` to `product\_name`

\- `Shipping.Cost` to `shipping\_cost`



The fact model also selects sales, profit, discount, quantity, shipping, geography, product, and customer-related fields for analytical use.



\## 8. Data-Quality Tests



File: `metricmind\_dbt/models/analytics/schema.yml`



The following dbt schema tests are configured:



| Column | Configured tests |

|---|---|

| `row\_id` | `not\_null`, `unique` |

| `order\_id` | `not\_null` |

| `order\_date` | `not\_null` |

| `sales` | `not\_null` |

| `profit` | `not\_null` |

| `quantity` | `not\_null` |



These tests are intended to identify missing values in important fields and duplicate row identifiers.



\*\*Important:\*\* These tests are configured in the project, but their successful execution has not yet been verified.



\## 9. Semantic Layer Documentation



The semantic layer documentation is maintained in `cube/README.md`.



It describes:



\- The semantic layer's purpose.

\- The source fact table.

\- Business measures and their definitions.

\- Dimensions and their business meanings.

\- Governance practices.

\- Example business questions.

\- Validation requirements and limitations.



The validation plan is maintained separately in `cube/VALIDATION.md`.



\## 10. Example Business Questions



The semantic layer is designed to support analytical questions such as:



\- What is the total revenue?

\- What is the total profit?

\- What is the profit margin by market?

\- Which region has the highest profit?

\- Which product category generates the most revenue?

\- What is the average discount per sales record?

\- What is the average selling price per unit?

\- Which customer segment generates the highest revenue?

\- How does quantity sold vary by product category?

\- How do shipping costs compare across regions?



These are intended use cases; they should be validated against actual query results before being treated as verified outputs.



\## 11. Validation Plan



The validation plan covers:



1\. Comparing Cube revenue with the source sales total.

2\. Comparing Cube profit with the source profit total.

3\. Checking shipping-cost, quantity, and discount aggregations.

4\. Verifying the profit-margin formula.

5\. Checking the defined dimensions.

6\. Testing representative business questions.

7\. Comparing analytical results with independently verified results.

8\. Checking agent and frontend integration when the required components are available.

9\. Executing dbt data-quality tests.



Validation results must be recorded only after the corresponding checks have actually run.



\## 12. Current Validation Status



The following checks have been completed at the configuration-review level:



\- Reviewed the Cube model definitions.

\- Reviewed the dbt source configuration.

\- Reviewed the staging and fact model SQL.

\- Reviewed the dbt schema-test definitions.

\- Confirmed that dbt Core and the Snowflake adapter are installed.

\- Confirmed that the dbt project configuration file is present.



The following items remain unverified:



\- Successful connection to Snowflake.

\- Successful execution of dbt data-quality tests.

\- Successful execution of Cube analytical queries.

\- Numerical comparison of Cube metrics against source data.

\- End-to-end agent and frontend integration.



The attempted `dbt debug` command reported that the expected `profiles.yml` file was missing from `C:\\Users\\Pallavi\\.dbt\\profiles.yml`. Consequently, the Snowflake connection test was skipped, and warehouse-dependent tests have not been confirmed as executed.



These limitations must be resolved before the affected checks can be marked as passed.



\## 13. Repository Files Covered



| File | Purpose |

|---|---|

| `cube/sales.yml` | Cube semantic model, measures, and dimensions |

| `cube/README.md` | Semantic layer documentation |

| `cube/VALIDATION.md` | Semantic layer validation plan |

| `metricmind\_dbt/dbt\_project.yml` | dbt project configuration |

| `metricmind\_dbt/models/staging/sources.yml` | Raw sales source definition |

| `metricmind\_dbt/models/staging/stg\_sales.sql` | Staging view definition |

| `metricmind\_dbt/models/analytics/fct\_sales.sql` | Sales fact table transformation |

| `metricmind\_dbt/models/analytics/schema.yml` | dbt schema tests |



\## 14. Version Control



The work is maintained on the Git branch:



`feature/pallavi-semantic-layer`



The semantic layer documentation was committed and pushed with commit:



`c646022 - Update semantic layer documentation`



The repository also contains earlier commits covering semantic measures, dimensions, dbt schema tests, and validation documentation.



This README documents the contribution and its current state. It does not claim that unexecuted tests or unverified integrations have passed.



\## 15. Conclusion



This contribution establishes a documented foundation for governed sales analytics in MetricMind. The Cube semantic model provides reusable measures and business dimensions, while dbt provides transformation models and configured data-quality tests.



The next stage is to complete the Snowflake connection setup, execute the available validations, compare metrics against actual source data, and record the results in the validation documentation.



The overall goal is to improve the consistency, traceability, and reliability of sales analytics for MetricMind.



