"use client";

import { useState } from "react";
import DynamicChart from "../../components/DynamicChart";
import type { ChartConfig } from "../../components/chartTypes";
import { sampleChartResponse } from "../../components/sampleChartResponse";

type AIResponse = {
    answer: string;
    insights: {
    label: string;
    value: string;
    }[];
    chart: ChartConfig;
};

const responses: Record<string, AIResponse> = {
    "Why did European margins drop last quarter?": {
    answer:
        "European performance declined mainly because revenue and profit decreased during the previous quarter, resulting in a lower profit margin.",
    insights: [
        { label: "Revenue", value: "↓ 8.4%" },
        { label: "Profit", value: "↓ 12.1%" },
        { label: "Profit Margin", value: "↓ 3.7%" },
    ],
    chart: {
        ...sampleChartResponse,
        chart_type: "line",
        title: "European Revenue & Profit Trend",
    },
    },

    "Which category generated the highest profit?": {
    answer:
        "Technology generated the highest profit among the available product categories, outperforming Furniture and Office Supplies.",
    insights: [
        { label: "Top Category", value: "Technology" },
        { label: "Profit", value: "$42K" },
        { label: "Share of Profit", value: "47.8%" },
    ],
    chart: {
        chart_type: "bar",
        title: "Profit by Category",
        x_axis: "category",
        metrics: ["profit"],
        data: [
        { category: "Technology", profit: 42000 },
        { category: "Furniture", profit: 16500 },
        { category: "Office Supplies", profit: 30200 },
        ],
    },
    },

    "What were our top performing regions?": {
    answer:
        "The West region was the strongest performer, followed by the East and Central regions based on overall revenue performance.",
    insights: [
        { label: "Top Region", value: "West" },
        { label: "Revenue", value: "$145K" },
        { label: "Profit", value: "$28.5K" },
    ],
    chart: {
        chart_type: "bar",
        title: "Revenue & Profit by Region",
        x_axis: "region",
        metrics: ["revenue", "profit"],
        data: [
        { region: "West", revenue: 145000, profit: 28500 },
        { region: "East", revenue: 132000, profit: 24800 },
        { region: "Central", revenue: 98000, profit: 17600 },
        { region: "South", revenue: 76000, profit: 13900 },
        ],
    },
    },
};

export default function AIAssistantPage() {
    const [question, setQuestion] = useState("");
    const [submittedQuestion, setSubmittedQuestion] = useState("");
    const [showSQL, setShowSQL] = useState(false);
    const [showAPI, setShowAPI] = useState(false);
    const [chartType, setChartType] = useState<"line" | "bar">("line");

    const selectedResponse =
    responses[submittedQuestion] || responses["Why did European margins drop last quarter?"];

    const chartConfig: ChartConfig = {
    ...selectedResponse.chart,
    chart_type: chartType,
    };

    const handleAsk = () => {
    if (!question.trim()) return;

    setSubmittedQuestion(question);
    setShowSQL(false);
    setShowAPI(false);

    const response =
        responses[question] ||
        responses["Why did European margins drop last quarter?"];

    setChartType(response.chart.chart_type);
    };

    return (
    <div className="ai-assistant-page">
        <div className="ai-assistant-header">
        <div>
            <h1>AI Assistant</h1>
            <p>Ask questions about your business data in natural language.</p>
        </div>
        </div>

        <div className="ai-chat-container">
        <div className="ai-welcome">
            <div className="ai-icon">✦</div>

            <h2>Ask MetricMind</h2>

            <p>
            Ask a business question and MetricMind will help you understand
            your data.
            </p>

            <div className="example-questions">
            <button
                onClick={() =>
                setQuestion("Why did European margins drop last quarter?")
                }
            >
                Why did European margins drop last quarter?
            </button>

            <button
                onClick={() =>
                setQuestion("Which category generated the highest profit?")
                }
            >
                Which category generated the highest profit?
            </button>

            <button
                onClick={() =>
                setQuestion("What were our top performing regions?")
                }
            >
                What were our top performing regions?
            </button>
            </div>
        </div>

        {submittedQuestion && (
            <div className="ai-response">
            <div className="user-question">
                <span>You</span>
                <p>{submittedQuestion}</p>
            </div>

            <div className="ai-answer">
                <span>MetricMind AI</span>

                <p>{selectedResponse.answer}</p>

                <div className="ai-insight-cards">
                {selectedResponse.insights.map((insight) => (
                    <div key={insight.label}>
                    <span>{insight.label}</span>
                    <strong>{insight.value}</strong>
                    </div>
                ))}
                </div>

                <div className="ai-dynamic-chart">
                <div className="chart-controls">
                    <button
                    onClick={() => setChartType("line")}
                    className={
                        chartType === "line"
                        ? "chart-button active"
                        : "chart-button"
                    }
                    >
                    Line Chart
                    </button>

                    <button
                    onClick={() => setChartType("bar")}
                    className={
                        chartType === "bar"
                        ? "chart-button active"
                        : "chart-button"
                    }
                    >
                    Bar Chart
                    </button>
                </div>

                <DynamicChart
                    type={chartConfig.chart_type}
                    data={chartConfig.data}
                    xKey={chartConfig.x_axis}
                    yKeys={chartConfig.metrics}
                    title={chartConfig.title}
                />
                </div>

                <div className="ai-actions">
                <button onClick={() => setShowSQL(!showSQL)}>
                    {showSQL ? "Hide SQL" : "View SQL"}
                </button>

                <button onClick={() => setShowAPI(!showAPI)}>
                    {showAPI ? "Hide API Call" : "View API Call"}
                </button>
                </div>

                {showSQL && (
                <div className="sql-preview">
                    <h3>Generated SQL</h3>

                    <pre>
{`SELECT
    region,
    SUM(sales) AS revenue,
    SUM(profit) AS profit,
    (SUM(profit) / NULLIF(SUM(sales), 0)) * 100 AS profit_margin
FROM sales
WHERE region = 'Europe'
GROUP BY region;`}
                    </pre>
                </div>
                )}

                {showAPI && (
                <div className="api-preview">
                    <h3>API Request</h3>

                    <pre>
{`POST /api/ask

{
    "question": "${submittedQuestion}",
    "metrics": [
    "revenue",
    "profit",
    "profit_margin"
    ]
}`}
                    </pre>
                </div>
                )}
            </div>
            </div>
        )}

        <div className="ai-input-area">
            <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your business data..."
            rows={3}
            />

            <button onClick={handleAsk}>Ask MetricMind</button>
        </div>
        </div>
    </div>
    );
}