
"use client";

import { useState } from "react";
import DynamicChart from "../../components/DynamicChart";
import type { ChartConfig } from "../../components/chartTypes";
import { sampleChartResponse } from "../../components/sampleChartResponse";
import { apiRequest } from "../../lib/api";

type Insight = {
    label: string;
    value: string;
};

type AIResponse = {
    answer: string;
    insights: Insight[];
    chart: ChartConfig;
};

type ChatMessage = {
    id: number;
    question: string;
    response: AIResponse;
    timestamp: string;
};

type ChatAPIResponse = {
    answer?: string;
    response?: string;
    message?: string;
    insights?: {
    label?: string;
    value?: string | number | null;
    }[];
    chart?: Partial<ChartConfig>;
    sql?: string;
    data_source?: string;
};

const defaultQuestion = "Why did European margins drop last quarter?";

function formatMoney(value: number): string {
    return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    });
}

function buildResponse(
    data: ChatAPIResponse,
    question: string
): AIResponse {
    const answerValue = data.answer ?? data.response ?? data.message;

    const answer =
    typeof answerValue === "string" && answerValue.trim()
        ? answerValue
        : "The backend returned data, but no answer text was provided.";

    const rawChart = data.chart;

    const chart: ChartConfig = {
    ...sampleChartResponse,
    ...(rawChart ?? {}),
    chart_type:
        rawChart?.chart_type === "line" || rawChart?.chart_type === "bar"
        ? rawChart.chart_type
        : sampleChartResponse.chart_type,
    title:
    typeof rawChart?.title === "string" && rawChart.title.trim()
        ? rawChart.title
        : sampleChartResponse.title,
    x_axis:
        typeof rawChart?.x_axis === "string" && rawChart.x_axis.trim()
        ? rawChart.x_axis
        : sampleChartResponse.x_axis,
    metrics:
        Array.isArray(rawChart?.metrics) && rawChart.metrics.length > 0
        ? rawChart.metrics
        : sampleChartResponse.metrics,
    data:
        Array.isArray(rawChart?.data) && rawChart.data.length > 0
        ? rawChart.data
        : sampleChartResponse.data,
    };

    const questionLower = question.toLowerCase();
    const isCategoryQuestion = questionLower.includes("categor");
    const isRegionQuestion =
    questionLower.includes("region") ||
    questionLower.includes("country") ||
    questionLower.includes("european");

    const xKey = chart.x_axis.toLowerCase();

    const isGroupedChart =
    isCategoryQuestion || isRegionQuestion
        ? chart.data.some((row) =>
            Object.keys(row).some(
            (key) =>
                key.toLowerCase() ===
                (isCategoryQuestion ? "category" : "region")
            )
        )
        : false;

    const groupKey = isCategoryQuestion ? "category" : "region";

    const matchingGroup = isGroupedChart
    ? chart.data.find((row) => {
        const groupValue = row[groupKey];
        return (
            typeof groupValue === "string" &&
            answer.toLowerCase().includes(groupValue.toLowerCase())
        );
        })
    : undefined;

    const backendInsights = Array.isArray(data.insights)
    ? data.insights
    : [];

    function getMetric(label: string): string {
    const key = label.toLowerCase();

    if (matchingGroup) {
        const value = matchingGroup[key];

        if (typeof value === "number") {
        return formatMoney(value);
        }

        if (typeof value === "string" && value.trim()) {
        return value;
        }
    }

    const insight = backendInsights.find((item) =>
        item.label?.toLowerCase().includes(key)
    );

    if (insight?.value !== null && insight?.value !== undefined) {
        const value = insight.value;

        if (typeof value === "number") {
        return formatMoney(value);
        }

        return String(value);
    }

    // Do not invent a group-specific value when the API did not provide it.
    if (isGroupedChart && (key === "revenue" || key === "profit")) {
        return "See chart";
    }

    const matchingValues = chart.data
        .map((row) => row[key])
        .filter((value): value is number => typeof value === "number");

    if (matchingValues.length > 0) {
        const total = matchingValues.reduce((sum, value) => sum + value, 0);
        return formatMoney(total);
    }

    return "Not available";
    }

    const insights: Insight[] = [
    {
        label: matchingGroup
        ? `${String(matchingGroup[groupKey])} Revenue`
        : "Revenue",
        value: getMetric("revenue"),
    },
    {
        label: matchingGroup
        ? `${String(matchingGroup[groupKey])} Profit`
        : "Profit",
        value: getMetric("profit"),
    },
    {
        label: "Data Source",
        value: data.data_source ?? "Backend",
    },
    ];

  // Avoid an unused variable while keeping chart-axis matching explicit.
    void xKey;

    return { answer, insights, chart };
}

export default function AIAssistantPage() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showSQL, setShowSQL] = useState<number | null>(null);
    const [showAPI, setShowAPI] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [chartTypes, setChartTypes] = useState<
    Record<number, "line" | "bar">
    >({});
    const [sqlResponses, setSqlResponses] = useState<Record<number, string>>({});

    async function handleAsk() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");
    setQuestion("");

    try {
        const data = await apiRequest<ChatAPIResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question: trimmedQuestion }),
        });

        const response = buildResponse(data, trimmedQuestion);
        const messageId = Date.now();

        const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        });

        setMessages((previous) => [
        ...previous,
        {
            id: messageId,
            question: trimmedQuestion,
            response,
            timestamp,
        },
    ]);

        setChartTypes((previous) => ({
        ...previous,
        [messageId]: response.chart.chart_type,
        }));

        setSqlResponses((previous) => {
        if (typeof data.sql === "string" && data.sql.trim()) {
            return { ...previous, [messageId]: data.sql };
        }

        return previous;
        });

        setShowSQL(null);
        setShowAPI(null);
    } catch (err) {
        setError(
        err instanceof Error
            ? `Could not load the backend response: ${err.message}`
            : "Could not contact the backend. Check that it is running."
        );
        setQuestion(trimmedQuestion);
    } finally {
        setLoading(false);
    }
    }

    function handleClearChat() {
    setMessages([]);
    setShowSQL(null);
    setShowAPI(null);
    setChartTypes({});
    setSqlResponses({});
    setError("");
    }

    return (
    <div className="ai-assistant-page">
        <div className="ai-assistant-header">
        <div>
            <h1>AI Assistant</h1>
            <p>Ask questions about your business data in natural language.</p>
        </div>

        {messages.length > 0 && (
            <button
            className="chat-clear-button"
            onClick={handleClearChat}
            >
            Clear conversation
            </button>
        )}
        </div>

        <div className="ai-chat-container">
        <div className="ai-welcome">
            <div className="ai-icon">✦</div>
            <h2>Ask MetricMind</h2>
            <p>
            Ask a business question and explore insights and visualizations
            from the backend.
            </p>

            <div className="example-questions">
            {[
                defaultQuestion,
                "Which category generated the highest profit?",
                "What were our top performing regions?",
            ].map((example) => (
                <button
                key={example}
                onClick={() => setQuestion(example)}
                >
                {example}
                </button>
            ))}
            </div>
        </div>

        {messages.length > 0 && (
            <div className="conversation-summary">
            Conversation history: {messages.length}{" "}
            {messages.length === 1 ? "question" : "questions"}
            </div>
        )}

        <div className="chat-history">
            {messages.map((message, index) => {
            const chartType =
                chartTypes[message.id] ?? message.response.chart.chart_type;

            const chartConfig: ChartConfig = {
                ...message.response.chart,
                chart_type: chartType,
            };

            return (
                <div className="ai-response" key={message.id}>
                <div className="user-question">
                    <div className="chat-message-heading">
                    <span className="chat-avatar user-avatar">You</span>

                    <div>
                        <strong>You</strong>
                        <span className="chat-timestamp">
                        {message.timestamp}
                        </span>
                    </div>

                    <span className="question-number">
                        Question {index + 1}
                    </span>
                    </div>

                    <p>{message.question}</p>
                </div>

                <div className="ai-answer">
                    <div className="chat-message-heading">
                    <span className="chat-avatar ai-avatar">✦</span>

                    <div>
                        <strong>MetricMind</strong>
                        <span className="chat-timestamp">
                        {message.timestamp}
                        </span>
                    </div>

                    <span className="demo-label">Backend response</span>
                    </div>

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
                        className={
                            chartType === "line"
                            ? "chart-button active"
                            : "chart-button"
                        }
                        onClick={() =>
                            setChartTypes((previous) => ({
                            ...previous,
                            [message.id]: "line",
                            }))
                        }
                        >
                        Line Chart
                        </button>

                        <button
                        className={
                            chartType === "bar"
                            ? "chart-button active"
                            : "chart-button"
                        }
                        onClick={() =>
                            setChartTypes((previous) => ({
                            ...previous,
                            [message.id]: "bar",
                            }))
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
                        {showAPI === message.id
                        ? "Hide API Call"
                        : "View API Call"}
                    </button>
                    </div>

                    {showSQL === message.id && (
                    <div className="sql-preview">
                        <h3>SQL Preview</h3>
                        <pre>
                        {sqlResponses[message.id] ??
                            "The backend did not return SQL for this response."}
                        </pre>
                    </div>
                    )}

                    {showAPI === message.id && (
                    <div className="api-preview">
                        <h3>API Request</h3>
                        <pre>
                        {JSON.stringify(
                            {
                            method: "POST",
                            endpoint: "/api/chat",
                            body: { question: message.question },
                            },
                            null,
                            2
                        )}
                        </pre>
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        {error && <p role="alert">{error}</p>}

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
                void handleAsk();
                }
            }}
            placeholder="Ask a question about your business data..."
            rows={3}
            disabled={loading}
            />

            <button
            onClick={() => void handleAsk()}
            disabled={!question.trim() || loading}
            >
            {loading ? "Loading..." : "Ask MetricMind"}
            </button>

            <p className="chat-input-hint">
            Press Enter to ask · Shift + Enter for a new line
            </p>
        </div>
        </div>
    </div>
    );
}