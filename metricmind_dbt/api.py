from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException

app = FastAPI(
    title="MetricMind API",
    description="Sales analytics API for MetricMind Semantic BI",
    version="1.0.0",
)

DATA_FILE = Path(__file__).parent / "seeds" / "sales.csv"


def load_sales():
    if not DATA_FILE.exists():
        raise HTTPException(status_code=500, detail="Sales CSV file not found.")

    df = pd.read_csv(DATA_FILE)
    df["margin"] = df["revenue"] - df["cost"]
    return df


@app.get("/")
def home():
    return {
        "project": "MetricMind",
        "message": "Sales analytics API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/metrics")
def metrics():
    df = load_sales()
    return {
        "total_records": int(len(df)),
        "total_orders": int(df["order_id"].nunique()),
        "total_revenue": float(df["revenue"].sum()),
        "total_cost": float(df["cost"].sum()),
        "total_profit": float(df["margin"].sum()),
    }


@app.get("/sales/by-product")
def sales_by_product():
    df = load_sales()
    result = (
        df.groupby("product", as_index=False)
        .agg(
            total_revenue=("revenue", "sum"),
            total_cost=("cost", "sum"),
            total_profit=("margin", "sum"),
            total_orders=("order_id", "nunique"),
        )
        .sort_values("total_revenue", ascending=False)
    )
    return result.to_dict(orient="records")


@app.get("/sales/by-country")
def sales_by_country():
    df = load_sales()
    result = (
        df.groupby("country", as_index=False)
        .agg(
            total_revenue=("revenue", "sum"),
            total_cost=("cost", "sum"),
            total_profit=("margin", "sum"),
            total_orders=("order_id", "nunique"),
        )
        .sort_values("total_revenue", ascending=False)
    )
    return result.to_dict(orient="records")



@app.get("/ask")
def ask(question: str):
    df = load_sales()
    q = question.lower().strip()

    if not q:
        raise HTTPException(status_code=400, detail="Please enter a question.")

    if "highest" in q or "most" in q:
        if "profit" in q or "margin" in q:
            result = df.groupby("product")["margin"].sum()
            product = result.idxmax()
            return {
                "question": question,
                "answer": f"{product} has the highest profit: {result.max():,.2f}.",
                "source": "sales.csv",
            }
        if "revenue" in q:
            result = df.groupby("product")["revenue"].sum()
            product = result.idxmax()
            return {
                "question": question,
                "answer": f"{product} has the highest revenue: {result.max():,.2f}.",
                "source": "sales.csv",
            }

    if "country" in q and "revenue" in q:
        result = df.groupby("country")["revenue"].sum().to_dict()
        return {"question": question, "answer": result, "source": "sales.csv"}

    if "revenue" in q:
        return {
            "question": question,
            "answer": f"Total revenue is {df['revenue'].sum():,.2f}.",
            "source": "sales.csv",
        }

    if "profit" in q or "margin" in q:
        return {
            "question": question,
            "answer": f"Total profit is {df['margin'].sum():,.2f}.",
            "source": "sales.csv",
        }

    if "cost" in q:
        return {
            "question": question,
            "answer": f"Total cost is {df['cost'].sum():,.2f}.",
            "source": "sales.csv",
        }

    if "order" in q:
        return {
            "question": question,
            "answer": f"Total unique orders: {df['order_id'].nunique()}.",
            "source": "sales.csv",
        }

    raise HTTPException(
        status_code=400,
        detail="Try asking about revenue, profit, cost, orders, or highest-revenue/profit product.",
    )
