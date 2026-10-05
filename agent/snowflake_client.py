import os
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

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

query = """
SELECT
    SUM(SALES) AS REVENUE,
    SUM(PROFIT) AS PROFIT
FROM METRICMIND.ANALYTICS.FCT_SALES
"""

cursor.execute(query)

result = cursor.fetchone()

print("Revenue:", result[0])
print("Profit:", result[1])

cursor.close()
connection.close()
