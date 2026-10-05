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

Return ONLY one of these governed metrics:
revenue
profit
profit_margin
shipping_cost

Do not return SQL.
Do not invent metrics.
Do not add explanations.

Examples:

User: Show me revenue
Response: revenue

User: What is our profit?
Response: profit

User: What is the profit margin?
Response: profit_margin

User: How much did we spend on shipping?
Response: shipping_cost
"""
        ),
        ("human", user_question),
    ]

    response = llm.invoke(messages)

    return response.content.strip().lower()


if __name__ == "__main__":
    question = "Show me total revenue"
    print("Question:", question)
    print("Planned metric:", plan_query(question))
