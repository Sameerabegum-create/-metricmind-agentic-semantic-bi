from snowflake_client import query_snowflake


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


def execute_metric(metric, market=None):
    if metric not in GOVERNED_QUERIES:
        raise ValueError(f"Metric is not governed: {metric}")

    query = GOVERNED_QUERIES[metric]

    if market is not None:
        if market not in ALLOWED_MARKETS:
            raise ValueError(f"Market is not governed: {market}")

        query = query.replace(
            "FROM METRICMIND.ANALYTICS.FCT_SALES",
            f"FROM METRICMIND.ANALYTICS.FCT_SALES WHERE MARKET = '{market}'"
        )

    return query_snowflake(query)


def execute_margin_analysis(market=None):
    query = """
        SELECT
            SUM(SALES) AS REVENUE,
            SUM(PROFIT) AS PROFIT,
            100.0 * SUM(PROFIT) / NULLIF(SUM(SALES), 0)
                AS PROFIT_MARGIN
        FROM METRICMIND.ANALYTICS.FCT_SALES
    """

    if market is not None:
        if market not in ALLOWED_MARKETS:
            raise ValueError(f"Market is not governed: {market}")

        query = query.replace(
            "FROM METRICMIND.ANALYTICS.FCT_SALES",
            f"FROM METRICMIND.ANALYTICS.FCT_SALES WHERE MARKET = '{market}'"
        )

    return query_snowflake(query)


def execute_cost_analysis(market=None):
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

    if market is not None:
        if market not in ALLOWED_MARKETS:
            raise ValueError(f"Market is not governed: {market}")

        query = query.replace(
            "FROM METRICMIND.ANALYTICS.FCT_SALES",
            f"FROM METRICMIND.ANALYTICS.FCT_SALES WHERE MARKET = '{market}'"
        )

    return query_snowflake(query)


if __name__ == "__main__":
    result = execute_cost_analysis("EU")

    print("Columns:", result["columns"])
    print("Rows:", result["rows"])
