import unittest
from unittest.mock import patch

from agent import api


class QueryRoutingTests(unittest.TestCase):
    @patch("agent.query_executor.query_snowflake")
    def test_top_products_returns_ten_product_rows(self, query_snowflake):
        rows = [
            (f"Product {rank:02d}", 11000 - rank * 100, 1100 - rank * 10, 10.0, 200 - rank)
            for rank in range(1, 11)
        ]
        query_snowflake.return_value = {
            "columns": [
                "PRODUCT_NAME",
                "TOTAL_REVENUE",
                "TOTAL_PROFIT",
                "PROFIT_MARGIN",
                "TOTAL_SHIPPING_COST",
            ],
            "rows": rows,
        }

        response = api.ask_metricmind(
            api.QuestionRequest(question="Show the top 10 products by revenue")
        )

        self.assertEqual(response["plan"]["analysis_type"], "top_products")
        self.assertEqual(len(response["chart_data"]), 10)
        self.assertEqual(response["chart_data"][0]["PRODUCT_NAME"], "Product 01")
        self.assertEqual(response["chart_data"][0]["TOTAL_REVENUE"], 10900)
        query = response["sql"].upper()
        self.assertIn("GROUP BY PRODUCT_NAME", query)
        self.assertIn("ORDER BY TOTAL_REVENUE DESC", query)
        self.assertIn("LIMIT 10", query)
        self.assertNotIn("GROUP BY COUNTRY", query)
        self.assertEqual(response["metrics"]["revenue"], sum(row[1] for row in rows))

    @patch("agent.query_executor.query_snowflake")
    def test_highest_revenue_country_uses_country_query(self, query_snowflake):
        query_snowflake.return_value = {
            "columns": [
                "COUNTRY",
                "TOTAL_REVENUE",
                "TOTAL_PROFIT",
                "PROFIT_MARGIN",
                "TOTAL_SHIPPING_COST",
            ],
            "rows": [("Country Alpha", 50000, 7500, 15.0, 900)],
        }

        response = api.ask_metricmind(
            api.QuestionRequest(question="Which country generates the highest revenue?")
        )

        self.assertEqual(response["plan"]["analysis_type"], "top_country")
        self.assertEqual(response["chart_data"][0]["COUNTRY"], "Country Alpha")
        self.assertEqual(response["chart_data"][0]["TOTAL_REVENUE"], 50000)
        self.assertIn("GROUP BY COUNTRY", response["sql"].upper())
        self.assertNotIn("GROUP BY PRODUCT_NAME", response["sql"].upper())
        self.assertIn("Country Alpha generates the highest revenue", response["answer"])


if __name__ == "__main__":
    unittest.main()
