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

Your job is to identify the governed metric and optional geography filter.

Return ONLY valid JSON.

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

Examples:

User: Show me total revenue
Response:
{"metric": "revenue", "market": null}

User: Show me European sales
Response:
{"metric": "revenue", "market": "EU"}

User: What is the profit in Europe?
Response:
{"metric": "profit", "market": "EU"}

User: What is the profit margin for Europe?
Response:
{"metric": "profit_margin", "market": "EU"}

User: Show me shipping cost
Response:
{"metric": "shipping_cost", "market": null}
"""
        ),
        ("human", user_question),
    ]

    response = llm.invoke(messages)

    content = response.content.strip()

    return json.loads(content)


if __name__ == "__main__":
    question = "Show me European sales"

    print("Question:", question)

    result = plan_query(question)

    print("Planned query:", result)
