
import os

import streamlit as st
import pandas as pd
import requests

st.set_page_config(page_title="MetricMind BI", page_icon="📊", layout="wide")

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")

st.title("📊 MetricMind — Agentic Semantic BI")
st.caption("Sales Analytics Dashboard | Powered by Python, Streamlit, dbt and DuckDB")

st.subheader("🔌 Backend API Status")

try:
    response = requests.get(f"{API_URL}/health", timeout=3)
    if response.ok:
        st.success("Backend API: Connected")
    else:
        st.warning("Backend API: Not responding correctly")
except requests.RequestException:
    st.warning("Backend API is offline. Check the API URL and ensure the backend is running.")

st.subheader("💬 Ask MetricMind")

question = st.text_input(
    "Ask about your sales data",
    placeholder="Example: What is total revenue?"
)

if st.button("Ask"):
    if question.strip():
        try:
            response = requests.get(
                f"{API_URL}/ask",
                params={"question": question},
                timeout=30
            )
            if response.ok:
                result = response.json()
                st.info(str(result.get("answer", result)))
            else:
                try:
                    detail = response.json().get(
                        "detail", "Could not answer that question."
                    )
                except ValueError:
                    detail = "Could not answer that question."
                st.error(str(detail))
        except requests.RequestException:
            st.error("Could not connect to the backend. Check the API URL and server.")
    else:
        st.warning("Please enter a question.")


@st.cache_data
def load_data():
    df = pd.read_csv("seeds/sales.csv")
    df["order_date"] = pd.to_datetime(df["order_date"])
    df["margin"] = df["revenue"] - df["cost"]
    return df


try:
    df = load_data()
except Exception as e:
    st.error(f"Could not load sales data: {e}")
    st.stop()

st.sidebar.header("Dashboard Filters")

countries = st.sidebar.multiselect(
    "Select Country",
    sorted(df["country"].dropna().unique()),
    default=sorted(df["country"].dropna().unique())
)

products = st.sidebar.multiselect(
    "Select Product",
    sorted(df["product"].dropna().unique()),
    default=sorted(df["product"].dropna().unique())
)

filtered = df[
    df["country"].isin(countries) &
    df["product"].isin(products)
]

if filtered.empty:
    st.warning("No records match these filters.")
    st.stop()

revenue = filtered["revenue"].sum()
cost = filtered["cost"].sum()
margin = filtered["margin"].sum()

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Orders", f"{filtered['order_id'].nunique():,}")
c2.metric("Total Revenue", f"₹{revenue:,.0f}")
c3.metric("Total Cost", f"₹{cost:,.0f}")
c4.metric("Total Profit / Margin", f"₹{margin:,.0f}")

st.divider()

left, right = st.columns(2)

with left:
    st.subheader("Revenue by Product")
    product_data = filtered.groupby("product", as_index=False)["revenue"].sum()
    st.bar_chart(product_data, x="product", y="revenue")

with right:
    st.subheader("Revenue by Country")
    country_data = filtered.groupby("country", as_index=False)["revenue"].sum()
    st.bar_chart(country_data, x="country", y="revenue")

st.subheader("Sales Trend")
daily = filtered.groupby("order_date", as_index=False)["revenue"].sum()
st.line_chart(daily, x="order_date", y="revenue")

st.subheader("Sales Data")
st.dataframe(filtered, use_container_width=True, hide_index=True)

st.caption("Data source: seeds/sales.csv | Profit = Revenue − Cost")