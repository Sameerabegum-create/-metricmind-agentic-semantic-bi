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


def execute_metric(metric):
    if metric not in GOVERNED_QUERIES:
        raise ValueError(f"Metric is not governed: {metric}")

    return query_snowflake(GOVERNED_QUERIES[metric])


if __name__ == "__main__":
    result = execute_metric("revenue")

    print("Columns:", result["columns"])
    print("Rows:", result["rows"])