
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
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

type AnalyticsResponse = {
    by_region: {
        region: string;
        revenue: number;
        profit: number;
    }[];
    by_category: {
        category: string;
        revenue: number;
        profit: number;
    }[];
    monthly: {
        month?: string;
        revenue: number;
        profit: number;
    }[];
    data_source?: string;
};

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

const money = (value: number) =>
    "$" + value.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });

export default function AnalyticsPage() {
    const [analytics, setAnalytics] =
        useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest<AnalyticsResponse>("/api/analytics")
            .then((data) => {
                setAnalytics(data);
                setError("");
            })
            .catch(() => {
                setError(
                    "Could not load analytics. Check whether the backend is running."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const regions = analytics?.by_region ?? [];
    const categories = analytics?.by_category ?? [];
    const months = (analytics?.monthly ?? []).map((item, index) => ({
        ...item,
        month: item.month ?? `Month ${index + 1}`,
    }));

    const totalRevenue = categories.reduce(
        (sum, item) => sum + item.revenue,
        0
    );
    const totalProfit = categories.reduce(
        (sum, item) => sum + item.profit,
        0
    );
    const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
        <main className="analytics-page">
            <div className="analytics-header">
                <div>
                    <p className="analytics-brand">MetricMind</p>
                    <h1>Analytics</h1>
                    <p>
                        Analyze revenue, profit, regions and product categories.
                    </p>
                </div>
                <button className="date-button">Live Data</button>
            </div>

            <div className="analytics-filters">
                <div className="analytics-filter">
                    <label>Year</label>
                    <select defaultValue="all">
                        <option value="all">All Years</option>
                    </select>
                </div>

                <div className="analytics-filter">
                    <label>Region</label>
                    <select defaultValue="all">
                        <option value="all">All Regions</option>
                        {regions.map((item) => (
                            <option key={item.region} value={item.region}>
                                {item.region}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="analytics-filter">
                    <label>Category</label>
                    <select defaultValue="all">
                        <option value="all">All Categories</option>
                        {categories.map((item) => (
                            <option key={item.category} value={item.category}>
                                {item.category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="analytics-filter">
                    <label>&nbsp;</label>
                    <button onClick={() => window.location.reload()}>
                        Refresh Data
                    </button>
                </div>
            </div>

            {loading && <p>Loading analytics from backend...</p>}
            {error && <p role="alert">{error}</p>}

            <div className="analytics-cards">
                <div className="analytics-card">
                    <span>Revenue</span>
                    <strong>
                        {analytics ? money(totalRevenue) : "—"}
                    </strong>
                    <small>From backend data</small>
                </div>

                <div className="analytics-card">
                    <span>Profit</span>
                    <strong>
                        {analytics ? money(totalProfit) : "—"}
                    </strong>
                    <small>From backend data</small>
                </div>

                <div className="analytics-card">
                    <span>Profit Margin</span>
                    <strong>
                        {analytics ? `${profitMargin.toFixed(1)}%` : "—"}
                    </strong>
                    <small>Profit as a share of revenue</small>
                </div>

                <div className="analytics-card">
                    <span>Regions</span>
                    <strong>{analytics ? regions.length : "—"}</strong>
                    <small>Regions in the returned data</small>
                </div>
            </div>

            <div className="analytics-panel">
                <div className="panel-header">
                    <h2>Revenue &amp; Profit Trend</h2>
                    <p>Monthly performance analysis</p>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={months}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => money(Number(value))} />
                            <Legend />
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

            <div className="analytics-grid">
                <div className="analytics-panel">
                    <div className="panel-header">
                        <h2>Regional Performance</h2>
                        <p>Revenue and profit by region</p>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="region" />
                                <YAxis />
                                <Tooltip formatter={(value) => money(Number(value))} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
                                <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-panel">
                    <div className="panel-header">
                        <h2>Category Distribution</h2>
                        <p>Revenue contribution by category</p>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="revenue"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={105}
                                    label
                                >
                                    {categories.map((item, index) => (
                                        <Cell
                                            key={item.category}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => money(Number(value))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="analytics-panel region-panel">
                <div className="panel-header">
                    <h2>Category Performance</h2>
                    <p>Revenue and profit by product category</p>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categories}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip formatter={(value) => money(Number(value))} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
                            <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
}
