import streamlit as st
import pandas as pd

st.set_page_config(page_title="MetricMind BI", page_icon="📊", layout="wide")

st.title("📊 MetricMind — Agentic Semantic BI")
st.caption("Sales Analytics Dashboard | Powered by Python, Streamlit, dbt and DuckDB")

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
    "Select Country", sorted(df["country"].dropna().unique()),
    default=sorted(df["country"].dropna().unique())
)
products = st.sidebar.multiselect(
    "Select Product", sorted(df["product"].dropna().unique()),
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
