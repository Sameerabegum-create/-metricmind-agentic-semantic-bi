"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";

interface ApiResponse {
  question: string;
  answer: string;
  plan: {
    analysis_type: string;
    metric: string;
    market: string | null;
  };
  sql: string;
  api_call: {
    method: string;
    endpoint: string;
    request_body: {
      question: string;
    };
  };
  columns: string[];
  rows: number[][];
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askMetricMind() {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setAnswer(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data: ApiResponse = await response.json();

      setAnswer(data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to MetricMind backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function useSuggestion(text: string) {
    setQuestion(text);
  }

  function getChartOption() {
    if (!answer || !answer.rows.length) {
      return {};
    }

    const row = answer.rows[0];
    const columns = answer.columns;

    // -----------------------------------------
    // COST ANALYSIS BAR CHART
    // -----------------------------------------

    if (answer.plan.analysis_type === "cost_analysis") {
      const values: number[] = [];
      const names: string[] = [];

      columns.forEach((column, index) => {
        const value = row[index];

        if (
          column === "REVENUE" ||
          column === "PROFIT" ||
          column === "SHIPPING_COST"
        ) {
          names.push(
            column
              .replace("_", " ")
              .toLowerCase()
              .replace(/\b\w/g, (letter) => letter.toUpperCase())
          );

          values.push(Number(value));
        }
      });

      return {
        backgroundColor: "transparent",

        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: any) => {
            const item = params[0];

            return `${item.name}: $${Number(item.value).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
          },
        },

        grid: {
          left: "8%",
          right: "5%",
          bottom: "12%",
          top: "12%",
          containLabel: true,
        },

        xAxis: {
          type: "category",
          data: names,

          axisLabel: {
            color: "#94a3b8",
          },

          axisLine: {
            lineStyle: {
              color: "#334155",
            },
          },
        },

        yAxis: {
          type: "value",

          axisLabel: {
            color: "#94a3b8",

            formatter: (value: number) =>
              "$" +
              Number(value).toLocaleString("en-US"),
          },

          splitLine: {
            lineStyle: {
              color: "#1e293b",
            },
          },
        },

        series: [
          {
            name: "Amount",
            type: "bar",
            data: values,
            barMaxWidth: 70,

            itemStyle: {
              borderRadius: [8, 8, 0, 0],
            },
          },
        ],
      };
    }

    // -----------------------------------------
    // MARGIN ANALYSIS BAR CHART
    // -----------------------------------------

    if (answer.plan.analysis_type === "margin_analysis") {
      const revenueIndex = columns.indexOf("REVENUE");
      const profitIndex = columns.indexOf("PROFIT");

      const revenue =
        revenueIndex >= 0 ? Number(row[revenueIndex]) : 0;

      const profit =
        profitIndex >= 0 ? Number(row[profitIndex]) : 0;

      return {
        backgroundColor: "transparent",

        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },

          formatter: (params: any) => {
            const item = params[0];

            return `${item.name}: $${Number(item.value).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
          },
        },

        grid: {
          left: "8%",
          right: "5%",
          bottom: "12%",
          top: "12%",
          containLabel: true,
        },

        xAxis: {
          type: "category",
          data: ["Revenue", "Profit"],

          axisLabel: {
            color: "#94a3b8",
          },

          axisLine: {
            lineStyle: {
              color: "#334155",
            },
          },
        },

        yAxis: {
          type: "value",

          axisLabel: {
            color: "#94a3b8",

            formatter: (value: number) =>
              "$" +
              Number(value).toLocaleString("en-US"),
          },

          splitLine: {
            lineStyle: {
              color: "#1e293b",
            },
          },
        },

        series: [
          {
            type: "bar",
            data: [revenue, profit],
            barMaxWidth: 80,

            itemStyle: {
              borderRadius: [8, 8, 0, 0],
            },
          },
        ],
      };
    }

    // -----------------------------------------
    // NORMAL METRIC GAUGE
    // -----------------------------------------

    const value = Number(row[0]);

    const isProfitMargin =
      answer.plan.metric === "profit_margin";

    return {
      backgroundColor: "transparent",

      series: [
        {
          type: "gauge",

          min: 0,

          max: isProfitMargin
            ? 100
            : Math.max(value * 1.2, 100),

          progress: {
            show: true,
            width: 18,
          },

          axisLine: {
            lineStyle: {
              width: 18,
            },
          },

          // Hide small tick marks
          axisTick: {
            show: false,
          },

          // Hide gauge split lines
          splitLine: {
            show: false,
          },

          // FIX:
          // Hide the overlapping numeric labels
          axisLabel: {
            show: false,
          },

          pointer: {
            itemStyle: {
              color: "#22d3ee",
            },
          },

          detail: {
            valueAnimation: true,

            fontSize: 28,

            color: "#ffffff",

            formatter: (value: number) => {
              if (isProfitMargin) {
                return `${value.toFixed(2)}%`;
              }

              return `$${value.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}`;
            },
          },

          data: [
            {
              value: value,

              name: isProfitMargin
                ? "PROFIT MARGIN"
                : answer.plan.metric
                    .replace("_", " ")
                    .toUpperCase(),
            },
          ],
        },
      ],
    };
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950/95">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Metric<span className="text-cyan-400">Mind</span>
            </h1>

            <p className="text-sm text-slate-400">
              Agentic Semantic BI
            </p>
          </div>

          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            ● Backend Connected
          </div>

        </div>

      </header>

      {/* MAIN */}

      <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl flex-col px-6 py-10">

        <div className="mx-auto w-full max-w-4xl">

          {/* HERO */}

          <div className="mb-10 text-center">

            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
              Conversational Business Intelligence
            </p>

            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ask your data anything.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Ask business questions in natural language and get governed,
              data-driven answers from MetricMind.
            </p>

          </div>

          {/* QUESTION BOX */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">

            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Example question
              </p>

              <p className="text-slate-200">
                Show me European sales
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    askMetricMind();
                  }
                }}

                placeholder="Ask MetricMind..."

                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />

              <button
                onClick={askMetricMind}
                disabled={loading}

                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Thinking..."
                  : "Ask MetricMind"}
              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {/* ANSWER */}

          {answer && (

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-6">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                MetricMind Answer
              </p>

              <h3 className="text-2xl font-bold text-white">
                {answer.answer}
              </h3>

              {/* METADATA */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs uppercase text-slate-500">
                    Metric
                  </p>

                  <p className="mt-2 font-semibold">
                    {answer.plan.metric}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs uppercase text-slate-500">
                    Analysis
                  </p>

                  <p className="mt-2 font-semibold">
                    {answer.plan.analysis_type}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs uppercase text-slate-500">
                    Market
                  </p>

                  <p className="mt-2 font-semibold">
                    {answer.plan.market ?? "All"}
                  </p>

                </div>

              </div>

              {/* DATA VISUALIZATION */}

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="mb-4 text-sm font-semibold text-slate-300">
                  Data Visualization
                </p>

                <ReactECharts
                  option={getChartOption()}
                  style={{
                    height: "380px",
                    width: "100%",
                  }}
                  theme="dark"
                />

              </div>

              {/* SQL */}

              <details className="mt-6">

                <summary className="cursor-pointer font-semibold text-cyan-400">
                  View SQL
                </summary>

                <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  {answer.sql}
                </pre>

              </details>

              {/* API CALL */}

              <details className="mt-4">

                <summary className="cursor-pointer font-semibold text-cyan-400">
                  View API Call
                </summary>

                <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  {JSON.stringify(
                    answer.api_call,
                    null,
                    2
                  )}
                </pre>

              </details>

            </div>
          )}

          {/* SUGGESTIONS */}

          <div className="mt-6 grid gap-3 md:grid-cols-3">

            <button
              onClick={() =>
                useSuggestion("Show me total revenue")
              }

              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-400"
            >

              <p className="text-sm font-medium">
                Revenue
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Show me total revenue
              </p>

            </button>

            <button
              onClick={() =>
                useSuggestion(
                  "What is the profit margin for Europe?"
                )
              }

              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-400"
            >

              <p className="text-sm font-medium">
                Profit Margin
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Profit margin for Europe
              </p>

            </button>

            <button
              onClick={() =>
                useSuggestion(
                  "Break down the costs in Europe"
                )
              }

              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-400"
            >

              <p className="text-sm font-medium">
                Cost Analysis
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Break down costs in Europe
              </p>

            </button>

          </div>

        </div>

      </section>

    </main>
  );
}