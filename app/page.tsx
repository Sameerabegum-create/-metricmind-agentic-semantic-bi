"use client";
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

const salesData = [
  { month: "Jan", sales: 12000 },
  { month: "Feb", sales: 18000 },
  { month: "Mar", sales: 15000 },
  { month: "Apr", sales: 22000 },
  { month: "May", sales: 28000 },
  { month: "Jun", sales: 32000 },
  { month: "Jul", sales: 30000 },
  { month: "Aug", sales: 38000 },
  { month: "Sep", sales: 42000 },
  { month: "Oct", sales: 39000 },
  { month: "Nov", sales: 47000 },
  { month: "Dec", sales: 52000 },
];

const profitData = [
  { category: "Technology", profit: 18500 },
  { category: "Furniture", profit: 12500 },
  { category: "Office", profit: 9200 },
  { category: "Supplies", profit: 6800 },
  { category: "Accessories", profit: 11200 },
];

export default function Home() {
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

          <div className="menu-item active">
            Dashboard
          </div>

          <Link href="/analytics" className="menu-item">
            Analytics
          </Link>

          <div className="menu-item">
            AI Assistant
          </div>

          <Link href="/reports" className="menu-item">
          Reports
        </Link>
        </div>

        <div className="menu-section system">
          <p className="menu-title">SYSTEM</p>

          <div className="menu-item">
            Settings
          </div>
        </div>

        <div className="profile">
          N
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="content">

        {/* HEADER */}
        <header className="header">
          <div>
            <h2>Dashboard</h2>
            <p>Overview of your business performance</p>
          </div>

          <button className="header-button">
            MetricMind
          </button>
        </header>

        {/* KPI CARDS */}
        <section className="cards">

          <div className="card">
            <p>Total Sales</p>
            <h3>$342K</h3>
            <span>+12.5% from last month</span>
          </div>

          <div className="card">
            <p>Total Profit</p>
            <h3>$68.2K</h3>
            <span>+8.4% from last month</span>
          </div>

          <div className="card">
            <p>Orders</p>
            <h3>5,009</h3>
            <span>+6.2% from last month</span>
          </div>

          <div className="card">
            <p>Customers</p>
            <h3>793</h3>
            <span>+4.8% from last month</span>
          </div>

        </section>

        {/* CHARTS */}
        <section className="charts">

          {/* SALES CHART */}
          <div className="chart-card">
            <h2>Sales Overview</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString()}`
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

          {/* PROFIT CHART */}
          <div className="chart-card">
            <h2>Profit Overview</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="category" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString()}`
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
            />

            <button>Ask</button>
          </div>
        </section>

      </section>
    </main>
  );
}