Welcome to your new dbt project!

### Using the starter project

Try running the following commands:
- dbt run
- dbt test


### Resources:
- Learn more about dbt [in the docs](https://docs.getdbt.com/docs/introduction)
- Check out [Discourse](https://discourse.getdbt.com/) for commonly asked questions and answers
- Join the [chat](https://community.getdbt.com/) on Slack for live discussions and support
- Find [dbt events](https://events.getdbt.com) near you
- Check out [the blog](https://blog.getdbt.com/) for the latest news on dbt's development and best practices
## Data Pipeline

The MetricMind data foundation follows this workflow:

Global Superstore CSV
        ↓
Snowflake RAW.SALES
        ↓
dbt staging model (stg_sales)
        ↓
dbt analytics model (fct_sales)
        ↓
Semantic Layer

### Completed Data Engineering Work

- Loaded 51,290 Superstore records into Snowflake.
- Created METRICMIND database with RAW and ANALYTICS schemas.
- Created dbt staging model: `stg_sales`.
- Created dbt analytics model: `fct_sales`.
- Verified the dbt project runs successfully.

## Cube Semantic Layer

The MetricMind semantic layer was implemented using Cube Cloud on top of the dbt analytics model `ANALYTICS.FCT_SALES`.

### Governed Metrics

- Revenue
- Profit
- Shipping Cost
- Profit Margin
- Total Quantity
- Average Discount
- Distinct Customers
- Distinct Orders

### Validation

The Cube semantic model was validated using Explore:

- Revenue query returned successfully.
- Profit query returned successfully.
- Profit Margin returned 11.61%.
- Shipping Cost returned successfully.
- Market filtering was tested using `Market = EU`.
- EU Revenue returned 2,938,139.
- Semantic SQL and Generated SQL were verified.
- The development branch was merged into the master branch.

This completes the MetricMind semantic-layer setup and validation.
