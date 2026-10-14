
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent.query_planner import plan_query
from agent.query_executor import (
    execute_metric,
    execute_margin_analysis,
    execute_cost_analysis,
    execute_sales_by_country,
    execute_sales_by_category,
    execute_sales_by_region,
    execute_monthly_sales,
    execute_top_country,
    execute_top_products,
    execute_kpis,
)


app = FastAPI(
    title="MetricMind API",
    description="Agentic Semantic BI Backend",
    version="1.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


@app.get("/")
def root():
    return {"message": "MetricMind API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


def _ranked_metrics(columns, rows, analysis_type):
    if not rows:
        return {"revenue": None, "profit": None, "profit_margin": None, "shipping_cost": None}

    column_indexes = {name.upper(): index for index, name in enumerate(columns)}
    if analysis_type == "top_products":
        selected_rows = rows
        revenue_column = "TOTAL_REVENUE"
        profit_column = "TOTAL_PROFIT"
        shipping_column = "TOTAL_SHIPPING_COST"
    else:
        selected_rows = rows[:1]
        revenue_column = "TOTAL_REVENUE"
        profit_column = "TOTAL_PROFIT"
        shipping_column = "TOTAL_SHIPPING_COST"

    def total(column):
        index = column_indexes.get(column)
        if index is None:
            return None
        return sum(float(row[index]) for row in selected_rows if row[index] is not None)

    revenue = total(revenue_column)
    profit = total(profit_column)
    shipping_cost = total(shipping_column)
    return {
        "revenue": revenue,
        "profit": profit,
        "profit_margin": 100.0 * profit / revenue if revenue else None,
        "shipping_cost": shipping_cost,
    }


@app.post("/ask")
def ask_metricmind(request: QuestionRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    try:
        # 1. Understand the question
        plan = plan_query(question)

        analysis_type = plan["analysis_type"]
        metric = plan.get("metric")
        market = plan.get("market")

        # 2. Execute the selected governed query
        if analysis_type == "sales_by_country":
            result = execute_sales_by_country()

        elif analysis_type == "sales_by_region":
            result = execute_sales_by_region(market)

        elif analysis_type == "sales_by_category":
            result = execute_sales_by_category(market)

        elif analysis_type == "monthly_trend":
            result = execute_monthly_sales(market)

        elif analysis_type == "top_country":
            result = execute_top_country()

        elif analysis_type == "top_products":
            result = execute_top_products(plan.get("limit", 10), market)

        elif analysis_type == "margin_analysis":
            result = execute_margin_analysis(market)

        elif analysis_type == "cost_analysis":
            result = execute_cost_analysis(market)

        elif analysis_type == "metric":
            result = execute_metric(metric, market)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported analysis type: {analysis_type}",
            )

        rows = result.get("rows", [])
        columns = result.get("columns", [])

        # 3. Build the answer
        if not rows:
            answer = "No matching data was found."

        elif analysis_type in {"sales_by_country", "sales_by_region", "sales_by_category", "monthly_trend"}:
            result_lines = []

            for row in rows:
                label = row[0]
                sales = row[1]
                result_lines.append(f"{label}: ${float(sales):,.2f}")

            dimension = {
                "sales_by_country": "Sales by country",
                "sales_by_region": "Sales by region",
                "sales_by_category": "Sales by category",
                "monthly_trend": "Monthly sales",
            }[analysis_type]
            answer = dimension + ":\n" + "\n".join(result_lines)

        elif analysis_type == "top_products":
            answer_lines = [
                f"{row[0]}: ${float(row[1]):,.2f}"
                for row in rows
            ]
            answer = "Top products by revenue:\n" + "\n".join(answer_lines)

        elif analysis_type == "top_country":
            country = rows[0][0]
            sales = float(rows[0][1])

            answer = (
                f"{country} generates the highest revenue, "
                f"with total revenue of ${sales:,.2f}."
            )

        elif analysis_type == "cost_analysis":
            revenue, profit, shipping_cost, margin, shipping_percent = (
                float(value) if value is not None else 0.0
                for value in rows[0]
            )

            location = (
                "European "
                if market == "EU"
                else f"{market} " if market else "Overall "
            )

            answer = (
                f"{location}cost analysis: "
                f"Revenue is ${revenue:,.2f}, "
                f"profit is ${profit:,.2f}, "
                f"shipping cost is ${shipping_cost:,.2f}, "
                f"profit margin is {margin:.2f}%, "
                f"and shipping cost is {shipping_percent:.2f}% "
                f"of revenue. Material cost is not available "
                f"in the dataset."
            )

        elif analysis_type == "margin_analysis":
            revenue, profit, margin = (
                float(value) if value is not None else 0.0
                for value in rows[0]
            )

            location = (
                "European "
                if market == "EU"
                else f"{market} " if market else "Overall "
            )

            answer = (
                f"{location}profit margin is {margin:.2f}%. "
                f"Revenue is ${revenue:,.2f} and "
                f"profit is ${profit:,.2f}."
            )

        else:
            value = rows[0][0]
            value = float(value) if value is not None else 0.0

            labels = {
                "revenue": "revenue",
                "profit": "profit",
                "profit_margin": "profit margin",
                "shipping_cost": "shipping cost",
            }

            label = labels.get(metric, metric or "value")

            location = (
                "European "
                if market == "EU"
                else f"{market} " if market else "Total "
            )

            if metric == "profit_margin":
                answer = f"{location}{label} is {value:.2f}%."
            else:
                answer = f"{location}{label} is ${value:,.2f}."

        # Ranking KPIs summarize the returned rows; other requests use the
        # same governed aggregate definitions and market filter.
        kpi_error = None
        if analysis_type in {"top_products", "top_country"}:
            metrics = _ranked_metrics(columns, rows, analysis_type)
            kpi_sql = result["query"]
            metric_scope = (
                f"Top {len(rows)} products"
                if analysis_type == "top_products"
                else "Highest-revenue country"
            )
        else:
            try:
                kpi_result = execute_kpis(market)
                kpi_sql = kpi_result["query"]
                kpi_values = {}
                if kpi_result.get("rows"):
                    kpi_values = dict(zip(kpi_result["columns"], kpi_result["rows"][0]))
                metrics = {
                    "revenue": kpi_values.get("REVENUE"),
                    "profit": kpi_values.get("PROFIT"),
                    "profit_margin": kpi_values.get("PROFIT_MARGIN"),
                    "shipping_cost": kpi_values.get("SHIPPING_COST"),
                }
                metric_scope = f"Filtered to {market}" if market else "All markets"
            except Exception as exc:
                print(f"MetricMind KPI query failed: {exc}")
                kpi_sql = None
                kpi_error = "KPI aggregates could not be loaded from Snowflake."
                metrics = {"revenue": None, "profit": None, "profit_margin": None, "shipping_cost": None}
                metric_scope = "KPI query unavailable"

        chart_data = [dict(zip(columns, row)) for row in rows]

        # 4. Return response for the frontend
        return {
            "question": question,
            "answer": answer,
            "plan": plan,
            "sql": result["query"],
            "kpi_sql": kpi_sql,
            "kpi_error": kpi_error,
            "metric_scope": metric_scope,
            "metrics": metrics,
            "api_call": {
                "method": "POST",
                "endpoint": "/ask",
                "request_body": {"question": question},
            },
            "columns": columns,
            "rows": rows,
            "chart_data": chart_data,
        }

    except HTTPException:
        raise

    except Exception as exc:
        # Keep details in the backend terminal for debugging.
        print(f"MetricMind request failed: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Unable to process the question. "
                   "Check the backend terminal for details.",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "agent.api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
