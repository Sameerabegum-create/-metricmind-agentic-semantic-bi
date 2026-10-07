"use client";

import { useState } from "react";

export default function AIAssistantPage() {
    const [question, setQuestion] = useState("");
    const [submittedQuestion, setSubmittedQuestion] = useState("");
    const [showSQL, setShowSQL] = useState(false);
    const [showAPI, setShowAPI] = useState(false);

    const handleAsk = () => {
    if (!question.trim()) return;

    setSubmittedQuestion(question);
    setShowSQL(false);
    setShowAPI(false);
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

                <p>
                Based on the available business data, the selected region
                experienced a decline in profit margin during the previous
                quarter.
                </p>

                <div className="ai-insight-cards">
                <div>
                    <span>Revenue</span>
                    <strong>↓ 8.4%</strong>
                </div>

                <div>
                    <span>Profit</span>
                    <strong>↓ 12.1%</strong>
                </div>

                <div>
                    <span>Profit Margin</span>
                    <strong>↓ 3.7%</strong>
                </div>
                </div>

                <div className="ai-chart-placeholder">
                <div className="chart-title">Revenue & Profit Trend</div>

                <div className="chart-bars">
                    <div style={{ height: "55%" }}></div>
                    <div style={{ height: "70%" }}></div>
                    <div style={{ height: "45%" }}></div>
                    <div style={{ height: "80%" }}></div>
                    <div style={{ height: "60%" }}></div>
                    <div style={{ height: "38%" }}></div>
                </div>
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
    "question": "Why did European margins drop last quarter?",
    "metrics": [
    "revenue",
    "profit",
    "profit_margin"
    ],
    "filters": {
    "region": "Europe",
    "period": "last_quarter"
    }
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