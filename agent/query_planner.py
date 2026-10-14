
import json
import re

from langchain_ollama import ChatOllama
from agent.prompts import SYSTEM_PROMPT


llm = ChatOllama(
    model="llama3",
    temperature=0
)


def _deterministic_dimension_plan(user_question):
    question = user_question.lower()
    market = None
    for pattern, market_name in (
        (r"\beurope\b", "EU"),
        (r"\b(?:us|united states)\b", "US"),
        (r"\bapac\b", "APAC"),
        (r"\blatam\b", "LATAM"),
        (r"\bafrica\b", "Africa"),
        (r"\bcanada\b", "Canada"),
    ):
        if re.search(pattern, question):
            market = market_name
            break

    ranking = re.search(r"\b(top|highest|most|greatest|best|rank(?:ed|ing)?)\b", question)

    if re.search(r"\bproducts?\b", question):
        count_match = re.search(r"\btop\s+(\d+)\b", question)
        limit = int(count_match.group(1)) if count_match else 10
        if not 1 <= limit <= 100:
            raise ValueError("Product ranking limit must be between 1 and 100.")
        return {
            "analysis_type": "top_products",
            "metric": "revenue",
            "market": market,
            "limit": limit,
        }

    if re.search(r"\bcountries?\b", question):
        return {
            "analysis_type": "top_country" if ranking else "sales_by_country",
            "metric": "revenue" if ranking else None,
            "market": market,
        }

    if re.search(r"\bregions?\b", question):
        return {"analysis_type": "sales_by_region", "metric": None, "market": market}

    if re.search(r"\bcategories\b|\bcategory\b", question):
        return {"analysis_type": "sales_by_category", "metric": None, "market": market}

    if re.search(r"\b(month|monthly|trend|over time|weekly|yearly|annual)\b", question):
        return {"analysis_type": "monthly_trend", "metric": "revenue", "market": market}

    return None


def plan_query(user_question):
    deterministic_plan = _deterministic_dimension_plan(user_question)
    if deterministic_plan is not None:
        return deterministic_plan

    messages = [
        (
            "system",
            SYSTEM_PROMPT
            + """

Identify the analysis type, metric, and optional market.

Return ONLY a JSON object with:
analysis_type, metric, market.

Allowed analysis_type values:
- metric
- margin_analysis
- cost_analysis
- sales_by_country
- sales_by_category
- sales_by_region
- monthly_trend
- top_country
- top_products

Allowed metrics:
- revenue
- profit
- profit_margin
- shipping_cost
- null for country analysis

Allowed markets:
- EU
- US
- APAC
- LATAM
- Africa
- Canada
- null

Rules:
- Europe means market = EU.
- Do not invent metrics, columns, or SQL.
- If no market is specified, use null.
- Use margin_analysis for questions about why or how
  profit margin changes or is calculated.
- Use cost_analysis for cost breakdown questions.
- Material cost is not available.
- Shipping cost is available.
- Use sales_by_country when asking for sales by country,
  country-wise sales, or a country sales breakdown.
- Use top_country when asking which country has the
  highest, most, or greatest sales.
- Do not use metric for country grouping or ranking.
- Use sales_by_category for sales comparisons by product category.
- Use monthly_trend for sales or revenue trends by month.
- Use sales_by_region for grouped sales by region.
- Use top_products for product-level sales or revenue rankings.
- Product rankings must never use top_country.

Examples:

User: Show me total revenue
{"analysis_type":"metric","metric":"revenue","market":null}

User: Show me total profit
{"analysis_type":"metric","metric":"profit","market":null}

User: Show me European sales
{"analysis_type":"metric","metric":"revenue","market":"EU"}

User: What is the profit margin for Europe?
{"analysis_type":"metric","metric":"profit_margin","market":"EU"}

User: Break down the costs in Europe
{"analysis_type":"cost_analysis","metric":"shipping_cost","market":"EU"}

User: Show me total sales by country
{"analysis_type":"sales_by_country","metric":null,"market":null}

User: Show sales for each country
{"analysis_type":"sales_by_country","metric":null,"market":null}

User: Which country has the highest sales?
{"analysis_type":"top_country","metric":null,"market":null}

User: Which country has the most revenue?
{"analysis_type":"top_country","metric":null,"market":null}

User: Show me the highest sales country in Europe
{"analysis_type":"top_country","metric":null,"market":"EU"}

User: Compare sales by category
{"analysis_type":"sales_by_category","metric":null,"market":null}

User: Show monthly revenue
{"analysis_type":"monthly_trend","metric":null,"market":null}

User: Show the top 10 products by revenue
{"analysis_type":"top_products","metric":"revenue","market":null,"limit":10}

User: Which country generates the highest revenue?
{"analysis_type":"top_country","metric":"revenue","market":null}
"""
        ),
        ("human", user_question),
    ]

    response = llm.invoke(messages)
    content = response.content.strip()

    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end == -1:
        raise ValueError(
            f"Llama did not return a valid JSON object: {content}"
        )

    result = json.loads(content[start:end + 1])

    allowed_types = {
        "metric",
        "margin_analysis",
        "cost_analysis",
        "sales_by_country",
        "sales_by_category",
        "sales_by_region",
        "monthly_trend",
        "top_country",
        "top_products",
    }

    allowed_metrics = {
        "revenue",
        "profit",
        "profit_margin",
        "shipping_cost",
    }

    allowed_markets = {
        "EU",
        "US",
        "APAC",
        "LATAM",
        "Africa",
        "Canada",
    }

    if result.get("analysis_type") not in allowed_types:
        raise ValueError("Unsupported analysis type returned by Llama.")

    analysis_type = result["analysis_type"]
    metric = result.get("metric")
    market = result.get("market")

    if analysis_type in {"sales_by_country", "sales_by_category", "sales_by_region", "monthly_trend", "top_country"}:
        result["metric"] = None
    elif analysis_type == "top_products":
        result.setdefault("metric", "revenue")
        result.setdefault("limit", 10)
    elif metric not in allowed_metrics:
        raise ValueError("Unsupported metric returned by Llama.")

    if market is not None and market not in allowed_markets:
        raise ValueError("Unsupported market returned by Llama.")

    result.setdefault("market", None)

    return result


if __name__ == "__main__":
    questions = [
        "Show me total profit",
        "Show me total sales by country",
        "Which country has the highest sales?",
    ]

    for question in questions:
        print("\nQuestion:", question)
        print("Plan:", plan_query(question))
