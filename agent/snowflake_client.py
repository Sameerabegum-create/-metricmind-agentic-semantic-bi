import os
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()


def query_snowflake(query):
    connection = snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
        role=os.getenv("SNOWFLAKE_ROLE"),
    )

    cursor = connection.cursor()

    try:
        cursor.execute(query)

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()

        return {
            "columns": columns,
            "rows": rows,
        }

    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    query = """
    SELECT
        SUM(SALES) AS REVENUE,
        SUM(PROFIT) AS PROFIT
    FROM METRICMIND.ANALYTICS.FCT_SALES
    """

    result = query_snowflake(query)

    print("Columns:", result["columns"])
    print("Rows:", result["rows"])
