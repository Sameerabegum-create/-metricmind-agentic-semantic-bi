from pathlib import Path
import os

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai

load_dotenv()

app = FastAPI(
    title="MetricMind API",
    description="Sales analytics API with Gemini-powered question answering",
    version="2.0.0",
)

DATA_FILE = Path(__file__).parent / "seeds" / "sales.csv"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def load_sales():
    if not DATA_FILE.exists():
        raise HTTPException(status_code=500, detail="Sales CSV file not found.")

    df = pd.read_csv(DATA_FILE)

    required = {"order_id", "product", "country", "revenue", "cost"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Sales CSV is missing columns: {', '.join(sorted(missing))}",
        )

    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["cost"] = pd.to_numeric(df["cost"], errors="coerce")
    df = df.dropna(subset=["revenue", "cost"])
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
    if not question.strip():
        raise HTTPException(status_code=400, detail="Please enter a question.")

    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Gemini is not configured. Set GEMINI_API_KEY in your .env file.",
        )

    df = load_sales()

    # Give the model aggregated facts from the real dataset.
    metrics_data = {
        "total_records": int(len(df)),
        "total_orders": int(df["order_id"].nunique()),
        "total_revenue": round(float(df["revenue"].sum()), 2),
        "total_cost": round(float(df["cost"].sum()), 2),
        "total_profit": round(float(df["margin"].sum()), 2),
        "revenue_by_product": {
            str(k): round(float(v), 2)
            for k, v in df.groupby("product")["revenue"].sum().items()
        },
        "profit_by_product": {
            str(k): round(float(v), 2)
            for k, v in df.groupby("product")["margin"].sum().items()
        },
        "revenue_by_country": {
            str(k): round(float(v), 2)
            for k, v in df.groupby("country")["revenue"].sum().items()
        },
    }

    prompt = f"""
You are MetricMind, a sales analytics assistant.
Answer the user's question using only the verified dataset facts below.
Do not invent figures or claim to have data that is not provided.
If the question cannot be answered from these facts, explain the limitation.
Keep the answer clear and concise.
Use Indian rupees (₹) for currency values when appropriate.

Verified dataset facts:
{metrics_data}

User question:
{question}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )
        answer = (response.text or "").strip()
        if not answer:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response. Please try again.",
            )

        return {
            "question": question,
            "answer": answer,
            "source": "sales.csv",
            "powered_by": "Google Gemini",
        }
    except HTTPException:
        raise

    except Exception as exc:
        print(f"Gemini error ({type(exc).__name__}): {exc}")
        raise HTTPException(
            status_code=502,
            detail="Gemini request failed. Check the backend terminal for details.",
        )

