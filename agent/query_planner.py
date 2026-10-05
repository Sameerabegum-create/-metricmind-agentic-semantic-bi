import json

from langchain_ollama import ChatOllama
from prompts import SYSTEM_PROMPT


llm = ChatOllama(
    model="llama3",
    temperature=0
)


def plan_query(user_question):
    messages = [
        (
            "system",
            SYSTEM_PROMPT
            + """

Your job is to identify the governed analysis type, metric, and optional geography filter.

Return a JSON object.

Allowed analysis types:
- metric
- margin_analysis
- cost_analysis

Allowed metrics:
- revenue
- profit
- profit_margin
- shipping_cost

Allowed geography filter:
- market

Allowed market values:
- EU
- US
- APAC
- LATAM
- Africa
- Canada

Important:
- Europe means market = EU.
- Do not invent metrics.
- Do not invent database columns.
- Do not write SQL.
- If no geography filter is requested, use null.
- Use analysis_type = "margin_analysis" when the user asks why or how profit margin is calculated.
- Use analysis_type = "cost_analysis" when the user asks to break down, analyze, or explain costs.
- Material cost is NOT available in the dataset.
- Shipping cost IS available in the dataset.

Examples:

User: Show me total revenue
Response:
{"analysis_type": "metric", "metric": "revenue", "market": null}

User: Show me European sales
Response:
{"analysis_type": "metric", "metric": "revenue", "market": "EU"}

User: What is the profit in Europe?
Response:
{"analysis_type": "metric", "metric": "profit", "market": "EU"}

User: What is the profit margin for Europe?
Response:
{"analysis_type": "metric", "metric": "profit_margin", "market": "EU"}

User: Why is the profit margin in Europe 12.69%?
Response:
{"analysis_type": "margin_analysis", "metric": "profit_margin", "market": "EU"}

User: Show me shipping cost
Response:
{"analysis_type": "metric", "metric": "shipping_cost", "market": null}

User: Break down the costs in Europe
Response:
{"analysis_type": "cost_analysis", "metric": "shipping_cost", "market": "EU"}

User: Analyze shipping costs in Europe
Response:
{"analysis_type": "cost_analysis", "metric": "shipping_cost", "market": "EU"}
"""
        ),
        ("human", user_question),
    ]

    response = llm.invoke(messages)

    content = response.content.strip()

    # Extract the JSON object even if Llama adds extra text.
    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end == -1:
        raise ValueError(
            f"Llama did not return a valid JSON object: {content}"
        )

    json_content = content[start:end + 1]

    return json.loads(json_content)


if __name__ == "__main__":
    question = "Why is the profit margin in Europe 12.69%?"

    print("Question:", question)

    result = plan_query(question)

    print("Planned query:", result)