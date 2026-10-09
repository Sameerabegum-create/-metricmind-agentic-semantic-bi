
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

type ChatMessage = {
    id: number;
    question: string;
    response: AIResponse;
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
        "Technology generated the highest profit among the available product categories in this sample response.",
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
        "West is the leading region in this sample response, followed by East, Central, and South based on revenue.",
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

const defaultQuestion = "Why did European margins drop last quarter?";

function getResponse(question: string): AIResponse {
    const exactMatch = responses[question];

    if (exactMatch) {
    return exactMatch;
    }

    return {
    answer:
        "This is a frontend demonstration. I can currently show sample insights for the three example questions above. A real answer to other questions requires connecting the interface to the project’s AI service later.",
    insights: [
        { label: "Response Type", value: "Demo" },
        { label: "Data Source", value: "Sample Data" },
        { label: "Backend", value: "Not Connected" },
    ],
    chart: {
        ...sampleChartResponse,
        title: "Sample Revenue & Profit Trend",
    },
    };
}

export default function AIAssistantPage() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showSQL, setShowSQL] = useState<number | null>(null);
    const [showAPI, setShowAPI] = useState<number | null>(null);
    const [chartTypes, setChartTypes] = useState<Record<number, "line" | "bar">>(
    {}
    );

    const handleAsk = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    const response = getResponse(trimmedQuestion);
    const messageId = Date.now();

    setMessages((previous) => [
        ...previous,
        {
        id: messageId,
        question: trimmedQuestion,
        response,
        },
    ]);

    setChartTypes((previous) => ({
        ...previous,
        [messageId]: response.chart.chart_type,
    }));

    setQuestion("");
    setShowSQL(null);
    setShowAPI(null);
    };

    const handleClearChat = () => {
    setMessages([]);
    setShowSQL(null);
    setShowAPI(null);
    setChartTypes({});
    };

    return (
    <div className="ai-assistant-page">
        <div className="ai-assistant-header">
        <div>
            <h1>AI Assistant</h1>
            <p>Ask questions about your business data in natural language.</p>
        </div>

        {messages.length > 0 && (
            <button className="chat-clear-button" onClick={handleClearChat}>
            Clear conversation
            </button>
        )}
        </div>

        <div className="ai-chat-container">
        <div className="ai-welcome">
            <div className="ai-icon">✦</div>

            <h2>Ask MetricMind</h2>

            <p>
            Ask a business question and explore sample insights and
            visualizations.
            </p>

            <div className="example-questions">
            <button onClick={() => setQuestion(defaultQuestion)}>
                {defaultQuestion}
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

        {messages.length > 0 && (
            <div className="conversation-summary">
            <span>
                Conversation history: {messages.length}{" "}
                {messages.length === 1 ? "question" : "questions"}
            </span>
            </div>
        )}

        {messages.map((message, index) => {
            const chartType =
            chartTypes[message.id] || message.response.chart.chart_type;

            const chartConfig: ChartConfig = {
            ...message.response.chart,
            chart_type: chartType,
            };

            return (
            <div className="ai-response" key={message.id}>
                <div className="user-question">
                <span>You · Question {index + 1}</span>
                <p>{message.question}</p>
                </div>

                <div className="ai-answer">
                <span>MetricMind AI · Sample Response</span>
                <p>{message.response.answer}</p>

                <div className="ai-insight-cards">
                    {message.response.insights.map((insight) => (
                    <div key={insight.label}>
                        <span>{insight.label}</span>
                        <strong>{insight.value}</strong>
                    </div>
                    ))}
                </div>

                <div className="ai-dynamic-chart">
                    <div className="chart-controls">
                    <button
                        onClick={() =>
                        setChartTypes((previous) => ({
                            ...previous,
                            [message.id]: "line",
                        }))
                        }
                        className={
                        chartType === "line"
                            ? "chart-button active"
                            : "chart-button"
                        }
                    >
                        Line Chart
                    </button>

                    <button
                        onClick={() =>
                        setChartTypes((previous) => ({
                            ...previous,
                            [message.id]: "bar",
                        }))
                        }
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
                    <button
                    onClick={() =>
                        setShowSQL((current) =>
                        current === message.id ? null : message.id
                        )
                    }
                    >
                    {showSQL === message.id ? "Hide SQL" : "View SQL"}
                    </button>

                    <button
                    onClick={() =>
                        setShowAPI((current) =>
                        current === message.id ? null : message.id
                        )
                    }
                    >
                    {showAPI === message.id ? "Hide API Call" : "View API Call"}
                    </button>
                </div>

                {showSQL === message.id && (
                    <div className="sql-preview">
                    <h3>Sample SQL Preview</h3>
                    <pre>
{`SELECT
    region,
    SUM(sales) AS revenue,
    SUM(profit) AS profit
FROM sales
GROUP BY region
ORDER BY revenue DESC;`}
                    </pre>
                    </div>
                )}

                {showAPI === message.id && (
                    <div className="api-preview">
                    <h3>Illustrative API Request</h3>
                    <pre>
{JSON.stringify(
    {
    question: message.question,
    demo: true,
    metrics: message.response.chart.metrics,
    },
    null,
    2
)}
                    </pre>
                    <p>
                        This is a frontend preview only. No API request is sent.
                    </p>
                    </div>
                )}
                </div>
            </div>
            );
        })}

        <div className="ai-input-area">
            <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
                if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
                ) {
                event.preventDefault();
                handleAsk();
                }
            }}
            placeholder="Ask a question about your business data..."
            rows={3}
            />

            <button onClick={handleAsk} disabled={!question.trim()}>
            Ask MetricMind
            </button>

            <p className="chat-input-hint">
            Press Enter to ask · Shift + Enter for a new line
            </p>
        </div>
        </div>
    </div>
    );
}