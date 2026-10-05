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


def execute_metric(metric, market=None):
    if metric not in GOVERNED_QUERIES:
        raise ValueError(f"Metric is not governed: {metric}")

    query = GOVERNED_QUERIES[metric]

    if market is not None:
        allowed_markets = {
            "EU",
            "US",
            "APAC",
            "LATAM",
            "Africa",
            "Canada",
        }

        if market not in allowed_markets:
            raise ValueError(f"Market is not governed: {market}")

        query = query.replace(
            "FROM METRICMIND.ANALYTICS.FCT_SALES",
            f"FROM METRICMIND.ANALYTICS.FCT_SALES WHERE MARKET = '{market}'"
        )

    return query_snowflake(query)


if __name__ == "__main__":
    result = execute_metric("revenue", "EU")

    print("Columns:", result["columns"])
    print("Rows:", result["rows"])
