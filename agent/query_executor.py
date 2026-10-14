
from agent.snowflake_client import query_snowflake


# Governed metric queries
GOVERNED_QUERIES = {
    "revenue": """
        SELECT SUM(SALES) AS REVENUE
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """,

    "profit": """
        SELECT SUM(PROFIT) AS PROFIT
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """,

    "profit_margin": """
        SELECT
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """,

    "shipping_cost": """
        SELECT SUM(SHIPPING_COST) AS SHIPPING_COST
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """,
}


ALLOWED_MARKETS = {
    "EU",
    "US",
    "APAC",
    "LATAM",
    "Africa",
    "Canada",
}


def _add_market_filter(query, market):
    """Add a validated market filter to a governed query."""
    if market is None:
        return query

    if market not in ALLOWED_MARKETS:
        raise ValueError(f"Market is not governed: {market}")

    marker = "FROM METRICMIND.ANALYTICS.FCT_SALES"

    if marker not in query:
        raise ValueError("Cannot apply market filter to this query")

    return query.replace(
        marker,
        f"{marker} WHERE MARKET = '{market}'",
        1,
    )


def execute_metric(metric, market=None):
    """Execute a single governed metric."""
    if metric not in GOVERNED_QUERIES:
        raise ValueError(f"Metric is not governed: {metric}")

    query = _add_market_filter(GOVERNED_QUERIES[metric], market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_kpis(market=None):
    """Fetch dashboard KPIs from the governed fact table."""
    query = """
        SELECT
            SUM(SALES) AS REVENUE,
            SUM(PROFIT) AS PROFIT,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN,
            SUM(SHIPPING_COST) AS SHIPPING_COST
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_margin_analysis(market=None):
    """Calculate revenue, profit, and profit margin."""
    query = """
        SELECT
            SUM(SALES) AS REVENUE,
            SUM(PROFIT) AS PROFIT,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_cost_analysis(market=None):
    """Calculate revenue, profit, and shipping cost."""
    query = """
        SELECT
            SUM(SALES) AS REVENUE,
            SUM(PROFIT) AS PROFIT,
            SUM(SHIPPING_COST) AS SHIPPING_COST,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN,
            100.0 * SUM(SHIPPING_COST) / NULLIF(SUM(SALES), 0)
                AS SHIPPING_COST_PERCENT
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_sales_by_country(limit=None):
    """Return sales totals for every country, highest first."""
    query = """
        SELECT
            COUNTRY,
            SUM(SALES) AS TOTAL_SALES
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY COUNTRY
        ORDER BY TOTAL_SALES DESC
    """

    if limit is not None:
        if not isinstance(limit, int) or not 1 <= limit <= 100:
            raise ValueError("Limit must be between 1 and 100")

        query += f"\nLIMIT {limit}"

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_top_country():
    """Return the country with the highest total sales."""
    query = """
        SELECT
            COUNTRY,
            SUM(SALES) AS TOTAL_REVENUE,
            SUM(PROFIT) AS TOTAL_PROFIT,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN,
            SUM(SHIPPING_COST) AS TOTAL_SHIPPING_COST
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY COUNTRY
        ORDER BY TOTAL_REVENUE DESC
        LIMIT 1
    """

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_top_products(limit=10, market=None):
    """Return top products by revenue with actual grouped KPI values."""
    if not isinstance(limit, int) or not 1 <= limit <= 100:
        raise ValueError("Limit must be between 1 and 100")

    query = f"""
        SELECT
            PRODUCT_NAME,
            SUM(SALES) AS TOTAL_REVENUE,
            SUM(PROFIT) AS TOTAL_PROFIT,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN,
            SUM(SHIPPING_COST) AS TOTAL_SHIPPING_COST
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY PRODUCT_NAME
        ORDER BY TOTAL_REVENUE DESC
        LIMIT {limit}
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_sales_by_category(market=None):
    """Return sales grouped by product category."""
    query = """
        SELECT
            CATEGORY,
            SUM(SALES) AS TOTAL_SALES
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY CATEGORY
        ORDER BY TOTAL_SALES DESC
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_sales_by_region(market=None):
    """Return sales grouped by region."""
    query = """
        SELECT
            REGION,
            SUM(SALES) AS TOTAL_SALES
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY REGION
        ORDER BY TOTAL_SALES DESC
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


def execute_monthly_sales(market=None):
    """Return sales grouped by month."""
    query = """
        SELECT
            TO_CHAR(DATE_TRUNC('MONTH', ORDER_DATE), 'YYYY-MM') AS MONTH,
            SUM(SALES) AS TOTAL_SALES
        FROM METRICMIND.ANALYTICS.FCT_SALES
        GROUP BY DATE_TRUNC('MONTH', ORDER_DATE)
        ORDER BY DATE_TRUNC('MONTH', ORDER_DATE)
    """

    query = _add_market_filter(query, market)

    return {
        "query": query,
        **query_snowflake(query),
    }


if __name__ == "__main__":
    result = execute_sales_by_country(limit=10)

    print("Columns:", result["columns"])
    print("Rows:", result["rows"])

    top_country = execute_top_country()

    print("Top country:")
    print(top_country["rows"])
