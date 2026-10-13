
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../lib/api";

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

type TrendItem = {
  date?: string;
  month?: string;
  period?: string;
  revenue?: number;
  sales?: number;
  profit?: number;
  orders?: number;
};

type DashboardResponse = {
  period_days: number;
  currency: string;
  kpis: {
    revenue: number;
    profit: number;
    orders: number;
    customers: number;
    profit_margin_pct: number;
  };
  trend: TrendItem[];
  data_source: string;
};

type AnalyticsResponse = {
  by_category: {
    category: string;
    revenue: number;
    profit: number;
  }[];
};

const rangeConfig: Record<DateRange, { label: string }> = {
  "7": { label: "Last 7 Days" },
  "30": { label: "Last 30 Days" },
  "90": { label: "Last 90 Days" },
};

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>("90");
  const [backendData, setBackendData] =
    useState<DashboardResponse | null>(null);
  const [profitData, setProfitData] = useState<
    AnalyticsResponse["by_category"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setBackendError("");

      try {
        const [dashboard, analytics] = await Promise.all([
          apiRequest<DashboardResponse>(
            `/api/dashboard?days=${dateRange}`
          ),
          apiRequest<AnalyticsResponse>("/api/analytics"),
        ]);

        if (!cancelled) {
          setBackendData(dashboard);
          setProfitData(
            Array.isArray(analytics.by_category)
              ? analytics.by_category
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setBackendError(
            error instanceof Error
              ? error.message
              : "Could not connect to the backend."
          );
          setBackendData(null);
          setProfitData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const currency = (value: number) =>
    `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;

  const totals = backendData?.kpis;

  // Build chart labels even when the API omits a date field.
  const salesChartData = (backendData?.trend ?? []).map(
    (item, index) => {
      const label =
        item.date ??
        item.month ??
        item.period ??
        `Record ${index + 1}`;

      return {
        date: label,
        sales:
          typeof item.revenue === "number"
            ? item.revenue
            : typeof item.sales === "number"
              ? item.sales
              : 0,
      };
    }
  );

  return (
    <main className="dashboard">
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

      <section className="content">
        <header className="header">
          <div>
            <h2>Dashboard</h2>
            <p>Overview of your business performance</p>
          </div>

          <button className="header-button">MetricMind</button>
        </header>

        <section className="dashboard-filter">
          <div>
            <h3>Performance Overview</h3>
            <p>Select a period to load sales data from the backend.</p>
          </div>

          <div
            className="date-range-options"
            aria-label="Dashboard date range"
          >
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

        {backendError && (
          <p role="alert" className="error-message">
            Backend connection failed: {backendError}
          </p>
        )}

        {loading && (
          <p role="status">Loading dashboard data...</p>
        )}

        {!loading && !backendError && salesChartData.length === 0 && (
          <p role="status">
            No sales trend data was returned for this period.
          </p>
        )}

        <section className="cards">
          <div className="card">
            <p>Total Sales</p>
            <h3>{totals ? currency(totals.revenue) : "—"}</h3>
            <span>
              {rangeConfig[dateRange].label} ·{" "}
              {backendData ? "Backend data" : "Waiting for data"}
            </span>
          </div>

          <div className="card">
            <p>Total Profit</p>
            <h3>{totals ? currency(totals.profit) : "—"}</h3>
            <span>
              {rangeConfig[dateRange].label} ·{" "}
              {backendData ? "Backend data" : "Waiting for data"}
            </span>
          </div>

          <div className="card">
            <p>Orders</p>
            <h3>
              {totals ? totals.orders.toLocaleString("en-US") : "—"}
            </h3>
            <span>
              {rangeConfig[dateRange].label} ·{" "}
              {backendData ? "Backend data" : "Waiting for data"}
            </span>
          </div>

          <div className="card">
            <p>Customers</p>
            <h3>
              {totals ? totals.customers.toLocaleString("en-US") : "—"}
            </h3>
            <span>
              {rangeConfig[dateRange].label} ·{" "}
              {backendData ? "Backend data" : "Waiting for data"}
            </span>
          </div>
        </section>

        <section className="charts">
          <div className="chart-card">
            <h2>Sales Overview</h2>

            <div className="chart-container">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => currency(Number(value))}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Sales"
                      stroke="#2867e8"
                      strokeWidth={4}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No sales data available for this period.</p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h2>Profit Overview</h2>

            <div className="chart-container">
              {profitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => currency(Number(value))}
                    />
                    <Bar
                      dataKey="profit"
                      name="Profit"
                      fill="#117d78"
                      radius={[7, 7, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No profit data available.</p>
              )}
            </div>
          </div>
        </section>

        <section className="ask-card">
          <h2>Ask MetricMind</h2>
          <p>
            Ask questions about your business data using natural language.
          </p>

          <div className="ask-input">
            <input
              type="text"
              placeholder="Ask about sales, profit, categories, or regions..."
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
