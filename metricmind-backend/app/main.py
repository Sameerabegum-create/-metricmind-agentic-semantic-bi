
from pathlib import Path
import os

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ==================================================
# CONFIGURATION
# ==================================================

ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = Path(
    os.getenv("DATA_PATH", str(ROOT / "data" / "sales.csv"))
)

if not DATA_PATH.is_absolute():
    DATA_PATH = ROOT / DATA_PATH

REQUIRED_COLUMNS = {
    "date",
    "region",
    "country",
    "product",
    "category",
    "revenue",
    "cost",
}

app = FastAPI(
    title="MetricMind API",
    description="Sales analytics backend for MetricMind",
    version="1.2.1",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# MODELS AND HELPERS
# ==================================================

class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)


def sales() -> pd.DataFrame:
    """Load and validate sales data from the CSV file."""

    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Sales CSV not found: {DATA_PATH}",
        )

    try:
        df = pd.read_csv(DATA_PATH)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read sales CSV: {exc}",
        ) from exc

    df.columns = df.columns.astype(str).str.strip()

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=(
                "CSV is missing required columns: "
                + ", ".join(sorted(missing))
            ),
        )

    for column in ["region", "country", "product", "category"]:
        df[column] = (
            df[column].fillna("Unknown").astype(str).str.strip()
        )

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["cost"] = pd.to_numeric(df["cost"], errors="coerce")

    df = df.dropna(subset=["date", "revenue", "cost"]).copy()

    if df.empty:
        raise HTTPException(
            status_code=500,
            detail="The sales CSV contains no valid sales records.",
        )

    df["profit"] = df["revenue"] - df["cost"]
    return df


def number(value) -> float:
    """Return a rounded numeric value, never a tuple."""
    return round(float(value), 2)


def make_insight(label, value):
    return {
        "label": str(label),
        "value": str(value),
    }


def grouped_data(df: pd.DataFrame, column: str) -> pd.DataFrame:
    return (
        df.groupby(column, as_index=False)
        .agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
        )
    )


def make_chart(data, x_axis, title, chart_type="bar"):
    return {
        "chart_type": chart_type,
        "title": title,
        "x_axis": x_axis,
        "metrics": ["revenue", "profit"],
        "data": data,
    }


def monthly_data(df: pd.DataFrame):
    grouped = (
        df.assign(month=df["date"].dt.to_period("M").astype(str))
        .groupby("month", as_index=False)
        .agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
        )
        .sort_values("month")
    )

    return grouped.to_dict("records")


# ==================================================
# ROOT AND HEALTH
# ==================================================

@app.get("/")
def root():
    return {
        "name": "MetricMind API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "metricmind-api",
    }


# ==================================================
# DASHBOARD
# ==================================================

@app.get("/api/dashboard")
def dashboard(days: int = Query(default=90, ge=1, le=3650)):
    df = sales()

    latest_date = df["date"].max()
    cutoff = latest_date - pd.Timedelta(days=days - 1)
    period = df[df["date"] >= cutoff].copy()

    if period.empty:
        period = df.copy()

    revenue = float(period["revenue"].sum())
    profit = float(period["profit"].sum())

    trend = (
        period.assign(date=period["date"].dt.strftime("%Y-%m-%d"))
        .groupby("date", as_index=False)
        .agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            orders=("product", "count"),
        )
        .sort_values("date")
    )

    # IMPORTANT: No trailing comma after this calculation.
    profit_margin_pct = (
        number(profit / revenue * 100)
        if revenue != 0
        else 0.0
    )

    return {
        "period_days": days,
        "currency": "USD",
        "kpis": {
            "revenue": number(revenue),
            "profit": number(profit),
            "orders": int(len(period)),
            "customers": int(period["country"].nunique()),
            "profit_margin_pct": profit_margin_pct,
        },
        "trend": trend.to_dict("records"),
        "data_source": "CSV",
    }


# ==================================================
# ANALYTICS
# ==================================================

@app.get("/api/analytics")
def analytics():
    df = sales()

    by_region = grouped_data(df, "region").sort_values(
        "revenue", ascending=False
    )

    by_category = grouped_data(df, "category").sort_values(
        "profit", ascending=False
    )

    return {
        "by_region": by_region.to_dict("records"),
        "by_category": by_category.to_dict("records"),
        "monthly": monthly_data(df),
        "data_source": "CSV",
    }


# ==================================================
# DATA EXPLORER
# ==================================================

@app.get("/api/data")
def data(
    search: str | None = None,
    region: str | None = None,
    category: str | None = None,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    df = sales()

    if search:
        mask = df.astype(str).apply(
            lambda col: col.str.contains(
                search,
                case=False,
                na=False,
                regex=False,
            )
        ).any(axis=1)
        df = df[mask]

    if region:
        df = df[
            df["region"].str.casefold() == region.strip().casefold()
        ]

    if category:
        df = df[
            df["category"].str.casefold()
            == category.strip().casefold()
        ]

    df = df.sort_values("date", ascending=False)

    total = len(df)
    result = df.iloc[offset:offset + limit].copy()
    result["date"] = result["date"].dt.strftime("%Y-%m-%d")

    return {
        "total": int(total),
        "limit": limit,
        "offset": offset,
        "rows": result.to_dict("records"),
        "data_source": "CSV",
    }


# ==================================================
# REPORTS
# ==================================================

@app.get("/api/reports")
def reports():
    df = sales()

    by_region = grouped_data(df, "region").sort_values(
        "revenue", ascending=False
    )

    by_category = grouped_data(df, "category").sort_values(
        "profit", ascending=False
    )

    return {
        "reports": [
            {
                "id": "sales-by-region",
                "title": "Sales by Region",
                "summary": "Revenue and profit grouped by region.",
                "rows": by_region.to_dict("records"),
            },
            {
                "id": "profit-by-category",
                "title": "Profit by Category",
                "summary": "Profit contribution by category.",
                "rows": by_category.to_dict("records"),
            },
        ],
        "data_source": "CSV",
    }


# ==================================================
# AI ASSISTANT
# ==================================================

@app.post("/api/chat")
def chat(payload: ChatRequest):
    df = sales()
    question = payload.question.casefold().strip()

    total_revenue = float(df["revenue"].sum())
    total_profit = float(df["profit"].sum())
    total_margin = (
        total_profit / total_revenue * 100
        if total_revenue
        else 0.0
    )

    default_chart = make_chart(
        monthly_data(df),
        "month",
        "Revenue & Profit by Month",
        "line",
    )

    # European questions must be checked before generic region questions.
    if "europe" in question or "european" in question:
        european = df[
            df["region"].str.casefold().str.contains(
                "europe", na=False, regex=False
            )
        ]

        if european.empty:
            european = df[
                df["country"].str.casefold().isin(
                    ["germany", "france", "spain", "italy"]
                )
            ]

        if european.empty:
            return {
                "answer": (
                    "No European records were found in the loaded CSV. "
                    "Check the region and country values in sales.csv."
                ),
                "insights": [],
                "chart": default_chart,
                "data_source": "CSV",
                "mode": "analytics-rule",
            }

        revenue = float(european["revenue"].sum())
        profit = float(european["profit"].sum())
        margin = profit / revenue * 100 if revenue else 0.0

        return {
            "answer": (
                f"European sales contain ${revenue:,.2f} in revenue "
                f"and ${profit:,.2f} in profit, giving a "
                f"{margin:.1f}% profit margin. A quarterly margin "
                "drop requires comparing the relevant quarters."
            ),
            "insights": [
                make_insight("European Revenue", f"${number(revenue):,.2f}"),
                make_insight("European Profit", f"${number(profit):,.2f}"),
                make_insight("European Margin", f"{margin:.1f}%"),
                make_insight("European Records", len(european)),
            ],
            "chart": make_chart(
                monthly_data(european),
                "month",
                "European Revenue & Profit by Month",
                "line",
            ),
            "data_source": "CSV",
            "mode": "analytics-rule",
        }

    # Category questions.
    if any(
        word in question
        for word in ["category", "categories", "product type"]
    ):
        grouped = grouped_data(df, "category")

        metric = (
            "revenue"
            if any(word in question for word in ["revenue", "sales"])
            and "profit" not in question
            else "profit"
        )

        grouped = grouped.sort_values(metric, ascending=False)

        if grouped.empty:
            return {
                "answer": "No category records were found.",
                "insights": [],
                "chart": default_chart,
                "data_source": "CSV",
                "mode": "analytics-rule",
            }

        winner = grouped.iloc[0]

        return {
            "answer": (
                f"{winner['category']} has the highest {metric}, "
                f"at ${winner[metric]:,.2f}, based on the loaded CSV."
            ),
            "insights": [
                make_insight("Top Category", winner["category"]),
                make_insight(
                    f"Top Category {metric.title()}",
                    f"${number(winner[metric]):,.2f}",
                ),
                make_insight("Total Categories", len(grouped)),
            ],
            "chart": make_chart(
                grouped.to_dict("records"),
                "category",
                f"{metric.title()} by Category",
            ),
            "sql": (
                "SELECT category, SUM(revenue) AS revenue, "
                "SUM(revenue - cost) AS profit FROM sales "
                "GROUP BY category ORDER BY profit DESC;"
            ),
            "data_source": "CSV",
            "mode": "analytics-rule",
        }

    # Region and country questions.
    if "region" in question or "country" in question:
        column = "region" if "region" in question else "country"
        grouped = grouped_data(df, column)

        metric = (
            "profit"
            if any(word in question for word in ["profit", "margin"])
            else "revenue"
        )

        grouped = grouped.sort_values(metric, ascending=False)

        if grouped.empty:
            return {
                "answer": f"No {column} records were found.",
                "insights": [],
                "chart": default_chart,
                "data_source": "CSV",
                "mode": "analytics-rule",
            }

        winner = grouped.iloc[0]

        return {
            "answer": (
                f"{winner[column]} leads by {metric}, "
                f"at ${winner[metric]:,.2f}, based on the loaded CSV."
            ),
            "insights": [
                make_insight(f"Top {column.title()}", winner[column]),
                make_insight(
                    f"Top {metric.title()}",
                    f"${number(winner[metric]):,.2f}",
                ),
                make_insight(f"Total {column.title()}s", len(grouped)),
            ],
            "chart": make_chart(
                grouped.to_dict("records"),
                column,
                f"Revenue & Profit by {column.title()}",
            ),
            "sql": (
                f"SELECT {column}, SUM(revenue) AS revenue, "
                f"SUM(revenue - cost) AS profit FROM sales "
                f"GROUP BY {column} ORDER BY {metric} DESC;"
            ),
            "data_source": "CSV",
            "mode": "analytics-rule",
        }

    # General business questions.
    if any(
        word in question
        for word in [
            "margin", "profit", "revenue", "sales",
            "performance", "summary",
        ]
    ):
        monthly_revenue = (
            df.assign(month=df["date"].dt.to_period("M"))
            .groupby("month")["revenue"]
            .sum()
            .sort_index()
        )

        change_text = ""

        if len(monthly_revenue) >= 2:
            previous = float(monthly_revenue.iloc[-2])
            current = float(monthly_revenue.iloc[-1])

            if previous != 0:
                change = (current - previous) / previous * 100
                change_text = (
                    f" Revenue changed {change:+.1f}% compared with "
                    "the previous month in the available data."
                )

        return {
            "answer": (
                f"Across {len(df)} sales records, total revenue is "
                f"${total_revenue:,.2f}, total profit is "
                f"${total_profit:,.2f}, and profit margin is "
                f"{total_margin:.1f}%.{change_text}"
            ),
            "insights": [
                make_insight("Total Revenue", f"${number(total_revenue):,.2f}"),
                make_insight("Total Profit", f"${number(total_profit):,.2f}"),
                make_insight("Profit Margin", f"{total_margin:.1f}%"),
                make_insight("Sales Records", len(df)),
            ],
            "chart": default_chart,
            "sql": (
                "SELECT date, SUM(revenue) AS revenue, "
                "SUM(revenue - cost) AS profit FROM sales "
                "GROUP BY date ORDER BY date;"
            ),
            "data_source": "CSV",
            "mode": "analytics-rule",
        }

    # Default help response.
    return {
        "answer": (
            "I can answer questions about sales, revenue, profit, "
            "margins, categories, regions, and countries using the "
            "loaded CSV. Try asking which category generated the "
            "highest profit."
        ),
        "insights": [
            make_insight("Data Source", "CSV"),
            make_insight("Sales Records", len(df)),
        ],
        "chart": default_chart,
        "data_source": "CSV",
        "mode": "help",
    }