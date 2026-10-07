"use client";

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
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const regionData = [
    { region: "West", revenue: 145000, profit: 28500 },
    { region: "East", revenue: 132000, profit: 24800 },
    { region: "Central", revenue: 98000, profit: 17600 },
    { region: "South", revenue: 76000, profit: 13900 },
];

const categoryData = [
    { category: "Technology", revenue: 185000, profit: 42000 },
    { category: "Furniture", revenue: 105000, profit: 16500 },
    { category: "Office Supplies", revenue: 161000, profit: 30200 },
];

const monthlyData = [
    { month: "Jan", revenue: 42000, profit: 8200 },
    { month: "Feb", revenue: 38000, profit: 7100 },
    { month: "Mar", revenue: 51000, profit: 9800 },
    { month: "Apr", revenue: 46000, profit: 8700 },
    { month: "May", revenue: 58000, profit: 11200 },
    { month: "Jun", revenue: 62000, profit: 12400 },
    { month: "Jul", revenue: 55000, profit: 10300 },
    { month: "Aug", revenue: 67000, profit: 13500 },
    { month: "Sep", revenue: 59000, profit: 11600 },
    { month: "Oct", revenue: 72000, profit: 14800 },
    { month: "Nov", revenue: 81000, profit: 16900 },
    { month: "Dec", revenue: 88000, profit: 18400 },
];

const categoryShare = [
    { name: "Technology", value: 41 },
    { name: "Furniture", value: 25 },
    { name: "Office Supplies", value: 34 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function AnalyticsPage() {
    return (
    <main className="analytics-page">

      {/* HEADER */}
        <div className="analytics-header">
        <div>
            <p className="analytics-brand">MetricMind</p>

            <h1>Analytics</h1>

            <p>
            Analyze revenue, profit, regions and product categories.
            </p>
        </div>

        <button className="date-button">
            2024
        </button>
        </div>

      {/* FILTERS */}
        <div className="analytics-filters">

        <div className="analytics-filter">
            <label>Year</label>

            <select>
            <option>All Years</option>
            <option>2011</option>
            <option>2012</option>
            <option>2013</option>
            <option>2014</option>
            </select>
        </div>

        <div className="analytics-filter">
            <label>Region</label>

            <select>
            <option>All Regions</option>
            <option>West</option>
            <option>East</option>
            <option>Central</option>
            <option>South</option>
            </select>
        </div>

        <div className="analytics-filter">
            <label>Category</label>

            <select>
            <option>All Categories</option>
            <option>Technology</option>
            <option>Furniture</option>
            <option>Office Supplies</option>
            </select>
        </div>

        <div className="analytics-filter">
            <label>&nbsp;</label>

            <button>
            Apply Filters
            </button>
        </div>

        </div>

      {/* KPI CARDS */}
        <div className="analytics-cards">

        <div className="analytics-card">
            <span>Revenue</span>

            <strong>$551K</strong>

            <small>+12.5% vs previous period</small>
        </div>

        <div className="analytics-card">
            <span>Profit</span>

            <strong>$98.4K</strong>

            <small>+8.7% vs previous period</small>
        </div>

        <div className="analytics-card">
            <span>Profit Margin</span>

            <strong>17.9%</strong>

            <small>Healthy margin</small>
        </div>

        <div className="analytics-card">
            <span>Shipping Cost</span>

            <strong>$31.7K</strong>

            <small>Across all regions</small>
        </div>

        </div>

      {/* REVENUE & PROFIT */}
        <div className="analytics-panel">

        <div className="panel-header">
            <h2>Revenue & Profit Trend</h2>

            <p>
            Monthly performance analysis
            </p>
        </div>

        <div className="chart-container">

            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                name="Revenue"
                />

                <Line
                type="monotone"
                dataKey="profit"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
                name="Profit"
                />

            </LineChart>
            </ResponsiveContainer>

        </div>

        </div>

      {/* REGION + CATEGORY */}
        <div className="analytics-grid">

        {/* REGIONAL PERFORMANCE */}
        <div className="analytics-panel">

            <div className="panel-header">
            <h2>Regional Performance</h2>

            <p>
                Revenue and profit by region
            </p>
            </div>

            <div className="chart-container">

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="region" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    name="Revenue"
                />

                <Bar
                    dataKey="profit"
                    fill="#22c55e"
                    name="Profit"
                />

                </BarChart>
            </ResponsiveContainer>

            </div>

        </div>

        {/* CATEGORY DISTRIBUTION */}
        <div className="analytics-panel">

            <div className="panel-header">
            <h2>Category Distribution</h2>

            <p>
                Revenue contribution by category
            </p>
            </div>

            <div className="chart-container">

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                <Pie
                    data={categoryShare}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                >
                    {categoryShare.map((entry, index) => (
                    <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                    />
                    ))}
                </Pie>

                <Tooltip />

                <Legend />

                </PieChart>
            </ResponsiveContainer>

            </div>

        </div>

        </div>

      {/* CATEGORY PERFORMANCE */}
        <div className="analytics-panel region-panel">

        <div className="panel-header">
            <h2>Category Performance</h2>

            <p>
            Revenue and profit by product category
            </p>
        </div>

        <div className="chart-container">

            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="category" />

                <YAxis />

                <Tooltip />

                    <Legend />

                <Bar
                dataKey="revenue"
                fill="#6366f1"
                name="Revenue"
                />

                <Bar
                dataKey="profit"
                fill="#22c55e"
                name="Profit"
                />

            </BarChart>
            </ResponsiveContainer>

        </div>

        </div>

    </main>
    );
}