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
