
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DateRange = "7" | "30" | "90";

const salesData = [
  { month: "Jan", sales: 12000, profit: 2400, orders: 180, customers: 95 },
  { month: "Feb", sales: 18000, profit: 3600, orders: 220, customers: 120 },
  { month: "Mar", sales: 15000, profit: 2900, orders: 205, customers: 110 },
  { month: "Apr", sales: 22000, profit: 4300, orders: 260, customers: 145 },
  { month: "May", sales: 28000, profit: 5600, orders: 310, customers: 170 },
  { month: "Jun", sales: 32000, profit: 6400, orders: 350, customers: 190 },
  { month: "Jul", sales: 30000, profit: 5900, orders: 330, customers: 180 },
  { month: "Aug", sales: 38000, profit: 7600, orders: 390, customers: 215 },
  { month: "Sep", sales: 42000, profit: 8400, orders: 420, customers: 235 },
  { month: "Oct", sales: 39000, profit: 7800, orders: 405, customers: 220 },
  { month: "Nov", sales: 47000, profit: 9400, orders: 470, customers: 260 },
  { month: "Dec", sales: 52000, profit: 10400, orders: 510, customers: 290 },
];

const profitData = [
  { category: "Technology", profit: 18500 },
  { category: "Furniture", profit: 12500 },
  { category: "Office", profit: 9200 },
  { category: "Supplies", profit: 6800 },
  { category: "Accessories", profit: 11200 },
];

const rangeConfig: Record<
  DateRange,
  { label: string; months: number; factor: number }
> = {
  "7": { label: "Last 7 Days", months: 3, factor: 0.08 },
  "30": { label: "Last 30 Days", months: 6, factor: 0.25 },
  "90": { label: "Last 90 Days", months: 12, factor: 1 },
};

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>("90");

  const filteredSales = useMemo(() => {
    const config = rangeConfig[dateRange];
    return salesData.slice(-config.months);
  }, [dateRange]);

  const filteredProfit = useMemo(() => {
    const factor = rangeConfig[dateRange].factor;
    return profitData.map((item) => ({
      ...item,
      profit: Math.round(item.profit * factor),
    }));
  }, [dateRange]);

  const totals = useMemo(() => {
    const factor = rangeConfig[dateRange].factor;
    const sales = Math.round(342000 * factor);
    const profit = Math.round(68200 * factor);
    const orders = Math.round(5009 * factor);
    const customers = Math.round(793 * factor);

    return { sales, profit, orders, customers };
  }, [dateRange]);

  const currency = (value: number) =>
    `$${value.toLocaleString("en-US")}`;

  return (
    <main className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <h1>MetricMind</h1>
          <p>Business Intelligence</p>
        </div>

        <div className="menu-section">
          <p className="menu-title">MAIN MENU</p>

          <div className="menu-item active">Dashboard</div>

          <Link href="/analytics" className="menu-item">
            Analytics
          </Link>

          <Link href="/ai-assistant" className="menu-item">
            AI Assistant
          </Link>

          <Link href="/reports" className="menu-item">
            Reports
          </Link>

          <Link href="/data-explorer" className="menu-item">
            Data Explorer
          </Link>
        </div>

        <div className="menu-section system">
          <p className="menu-title">SYSTEM</p>
          <div className="menu-item">Settings</div>
        </div>

        <div className="profile">N</div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="content">
        {/* HEADER */}
        <header className="header">
          <div>
            <h2>Dashboard</h2>
            <p>Overview of your business performance</p>
          </div>

          <button className="header-button">MetricMind</button>
        </header>

        {/* DATE RANGE FILTER */}
        <section className="dashboard-filter">
          <div>
            <h3>Performance Overview</h3>
            <p>Choose a period to update the dashboard sample data.</p>
          </div>

          <div className="date-range-options" aria-label="Dashboard date range">
            {(["7", "30", "90"] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={
                  dateRange === range
                    ? "date-range-button active"
                    : "date-range-button"
                }
                aria-pressed={dateRange === range}
              >
                {rangeConfig[range].label}
              </button>
            ))}
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="cards">
          <div className="card">
            <p>Total Sales</p>
            <h3>{currency(totals.sales)}</h3>
            <span>{rangeConfig[dateRange].label} · Sample data</span>
          </div>

          <div className="card">
            <p>Total Profit</p>
            <h3>{currency(totals.profit)}</h3>
            <span>{rangeConfig[dateRange].label} · Sample data</span>
          </div>

          <div className="card">
            <p>Orders</p>
            <h3>{totals.orders.toLocaleString("en-US")}</h3>
            <span>{rangeConfig[dateRange].label} · Sample data</span>
          </div>

          <div className="card">
            <p>Customers</p>
            <h3>{totals.customers.toLocaleString("en-US")}</h3>
            <span>{rangeConfig[dateRange].label} · Sample data</span>
          </div>
        </section>

        {/* CHARTS */}
        <section className="charts">
          <div className="chart-card">
            <h2>Sales Overview</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      currency(Number(value))
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2867e8"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      fill: "#ffffff",
                      stroke: "#2867e8",
                      strokeWidth: 3,
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Profit Overview</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredProfit}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      currency(Number(value))
                    }
                  />
                  <Bar
                    dataKey="profit"
                    fill="#117d78"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ASK METRICMIND */}
        <section className="ask-card">
          <h2>Ask MetricMind</h2>

          <p>
            Ask questions about your business data using natural language.
          </p>

          <div className="ask-input">
            <input
              type="text"
              placeholder="Ask something like: What were our best selling products?"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  window.location.href = "/ai-assistant";
                }
              }}
            />

            <button
              type="button"
              onClick={() => {
                window.location.href = "/ai-assistant";
              }}
            >
              Ask
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}