from fastapi import FastAPI
from pydantic import BaseModel

from agent.query_planner import plan_query
from agent.query_executor import (
    execute_metric,
    execute_margin_analysis,
    execute_cost_analysis,
)


app = FastAPI(
    title="MetricMind API",
    description="Agentic Semantic BI Backend",
    version="1.0.0",
)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {
        "message": "MetricMind API is running"
    }


@app.post("/ask")
def ask_metricmind(request: QuestionRequest):

    question = request.question

    # 1. Understand the business question
    plan = plan_query(question)

    analysis_type = plan["analysis_type"]
    metric = plan["metric"]
    market = plan["market"]

    # 2. Execute governed analysis
    if analysis_type == "margin_analysis":
        result = execute_margin_analysis(market)

    elif analysis_type == "cost_analysis":
        result = execute_cost_analysis(market)

    else:
        result = execute_metric(metric, market)

    # 3. Extract result
    value = result["rows"][0][0]

    # 4. Create human-readable answer
    if metric == "revenue":
        answer = (
            f"European revenue is ."
            if market == "EU"
            else f"Total revenue is ."
        )

    elif metric == "profit":
        answer = (
            f"European profit is ."
            if market == "EU"
            else f"Total profit is ."
        )

    elif metric == "profit_margin":
        answer = (
            f"European profit margin is {value:.2f}%."
            if market == "EU"
            else f"Profit margin is {value:.2f}%."
        )

    elif metric == "shipping_cost":
        answer = (
            f"European shipping cost is ."
            if market == "EU"
            else f"Total shipping cost is ."
        )

    else:
        answer = f"The calculated value is {value}."

    # 5. Return complete API response
    return {
        "question": question,
        "answer": answer,
        "plan": plan,
        "sql": result["query"],
        "api_call": {
            "method": "POST",
            "endpoint": "/ask",
            "request_body": {
                "question": question
            }
        },
        "columns": result["columns"],
        "rows": result["rows"],
    }


if __name__ == "__main__":
    print("MetricMind API")
