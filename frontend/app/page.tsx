
"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

type MetricMindResponse = {
  question?: string;
  answer?: string;
  sql?: string;
  kpi_sql?: string;
  kpi_error?: string | null;
  metric_scope?: string;
  api_call?: unknown;
  api_url?: string;
  api_method?: string;
  plan?: {
    metric?: string | null;
    analysis_type?: string;
    market?: string | null;
  };
  columns?: string[];
  rows?: unknown[][];
  chart_data?: Record<string, unknown>[];
  metrics?: {
    revenue?: number | string | null;
    profit?: number | string | null;
    profit_margin?: number | string | null;
    shipping_cost?: number | string | null;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/ask";
const API_HEALTH_URL = new URL("/health", API_URL).toString();

const suggestions = [
  { icon: "↗", title: "Show me total revenue", subtitle: "View your revenue KPI" },
  { icon: "◉", title: "What is the profit margin for Europe?", subtitle: "Analyze Europe performance" },
  { icon: "▥", title: "Break down the costs in Europe", subtitle: "Explore cost analysis" },
];

const money = (value: unknown) =>
  typeof value === "number" || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value))
    : "Not returned by backend";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<MetricMindResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [showAPI, setShowAPI] = useState(false);
  const [lastRequest, setLastRequest] = useState<unknown>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    let active = true;

    async function checkBackend() {
      try {
        const response = await fetch(API_HEALTH_URL, { cache: "no-store" });
        const health: { status?: string } = await response.json();
        if (active) {
          setBackendStatus(response.ok && health.status === "ok" ? "connected" : "disconnected");
        }
      } catch {
        if (active) setBackendStatus("disconnected");
      }
    }

    void checkBackend();
    const interval = window.setInterval(() => void checkBackend(), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function askMetricMind(value = question) {
    const q = value.trim();
    if (!q || loading) return;

    setQuestion(q);
    setLoading(true);
    setError("");
    setResult(null);
    setShowSQL(false);
    setShowAPI(false);

    const requestBody = { question: q };
    setLastRequest(requestBody);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setBackendStatus("connected");
    } catch (err) {
      setBackendStatus("disconnected");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the MetricMind backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const chartData = result?.chart_data ?? [];
  const columns = result?.columns ?? (chartData[0] ? Object.keys(chartData[0]) : []);
  const rows = chartData.length > 0
    ? chartData.map((record) => columns.map((column) => record[column]))
    : result?.rows ?? [];
  const dimensionIndex = columns.findIndex((column) =>
    ["COUNTRY", "CATEGORY", "MONTH", "REGION", "DATE", "PRODUCT_NAME"].includes(column.toUpperCase())
  );
  const valueIndex = columns.findIndex((column, index) =>
    index !== dimensionIndex && rows.some((row) => {
      const value = row[index];
      return typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)));
    })
  );
  const chartLabels = rows.map((row, index) =>
    dimensionIndex >= 0
      ? String(row[dimensionIndex] ?? `Item ${index + 1}`)
      : columns[valueIndex] ?? `Item ${index + 1}`
  );
  const chartValues = rows.map((row) => {
    const value = valueIndex >= 0 ? row[valueIndex] : null;
    return typeof value === "number" ? value : typeof value === "string" ? Number(value) : null;
  });
  const chartType = result?.plan?.analysis_type === "monthly_trend" ||
    (dimensionIndex >= 0 && ["MONTH", "DATE"].includes(columns[dimensionIndex]?.toUpperCase()))
    ? "line"
    : "bar";
  const horizontalChart = result?.plan?.analysis_type === "top_products";

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: horizontalChart
      ? { left: 230, right: 24, top: 20, bottom: 36 }
      : { left: 48, right: 20, top: 25, bottom: 55 },
    xAxis: horizontalChart
      ? {
          type: "value",
          axisLabel: { color: "#91A4C4" },
          splitLine: { lineStyle: { color: "#202C43" } },
        }
      : {
          type: "category",
          data: chartLabels,
          axisLabel: { color: "#91A4C4", rotate: 20 },
          axisLine: { lineStyle: { color: "#263754" } },
        },
    yAxis: horizontalChart
      ? {
          type: "category",
          data: chartLabels,
          inverse: true,
          axisLabel: { color: "#91A4C4", width: 210, overflow: "truncate" },
          axisLine: { lineStyle: { color: "#263754" } },
        }
      : {
          type: "value",
          axisLabel: { color: "#91A4C4" },
          splitLine: { lineStyle: { color: "#202C43" } },
        },
    series: [
      {
        name: valueIndex >= 0 ? columns[valueIndex] : "Value",
        type: chartType,
        data: chartValues,
        barMaxWidth: 34,
        itemStyle: {
          borderRadius: horizontalChart ? [0, 6, 6, 0] : [6, 6, 0, 0],
          color: "#42D8F5",
        },
        ...(chartType === "line" ? { smooth: true, symbolSize: 8, areaStyle: { opacity: 0.12 } } : {}),
      },
    ],
  };

  const metricColumnAliases = {
    revenue: ["REVENUE", "SALES"],
    profit: ["PROFIT"],
    profit_margin: ["PROFIT_MARGIN", "MARGIN"],
    shipping_cost: ["SHIPPING_COST", "SHIPPING.COST"],
  } as const;
  const getMetricValue = (metricKey: keyof typeof metricColumnAliases) => {
    const metricValue = result?.metrics?.[metricKey];
    if (metricValue != null) return metricValue;

    const normalizeColumn = (column: string) => column.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const aliases = metricColumnAliases[metricKey].map(normalizeColumn);
    const columnIndex = columns.findIndex((column) => aliases.includes(normalizeColumn(column)));
    return columnIndex >= 0 ? rows[0]?.[columnIndex] : undefined;
  };

  return (
    <main className="min-h-screen bg-[#080D1B] text-white">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080D1B]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 text-xl font-black text-[#07101F] shadow-lg shadow-cyan-500/20">
              M
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">
                Metric<span className="text-cyan-300">Mind</span>
              </div>
              <div className="text-[9px] tracking-[0.17em] text-slate-500">
                AGENTIC SEMANTIC BI
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            <a href="#" className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-cyan-200">Home</a>
            <a href="#analytics" className="text-slate-400 hover:text-white">Analytics</a>
            <a href="#data" className="text-slate-400 hover:text-white">Data</a>
            <a href="#governance" className="text-slate-400 hover:text-white">Governance</a>
            <a href="#about" className="text-slate-400 hover:text-white">About</a>
          </nav>

          <div className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${backendStatus === "disconnected" ? "bg-rose-400" : backendStatus === "connected" ? "bg-emerald-400" : "bg-amber-300"}`} />
            <span className={`hidden sm:inline ${backendStatus === "disconnected" ? "text-rose-200" : backendStatus === "connected" ? "text-emerald-200" : "text-slate-300"}`}>
              {backendStatus === "disconnected" ? "Backend disconnected" : backendStatus === "connected" ? "Backend connected" : "Checking backend"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1720px] gap-6 px-4 pb-14 pt-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1">
              {[
                ["⌂", "Home", "#"],
                ["▥", "Analytics", "#analytics"],
                ["▤", "Data Explorer", "#data"],
                ["◷", "Query History", "#history"],
                ["◇", "Governance", "#governance"],
                ["⚙", "Settings", "#about"],
              ].map(([icon, label, href], i) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    i === 0
                      ? "border border-cyan-300/15 bg-cyan-300/10 text-cyan-200"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center">{icon}</span>
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-10 rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-[#102747] to-[#111329] p-4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-2xl text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                ✧
              </div>
              <p className="font-semibold">Powered by AI</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Governed metrics. Explainable answers. Business intelligence.
              </p>
              <div className="mt-4 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-cyan-200">
                Semantic Intelligence
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[28px] border border-indigo-300/20 bg-gradient-to-br from-[#111B3C] via-[#11142D] to-[#0D2038] px-5 py-9 sm:px-9 sm:py-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-600/20 blur-[90px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-64 rounded-full bg-violet-500/10 blur-[80px]" />

            {/* Glowing AI orb */}
            <div className="pointer-events-none absolute right-[-15px] top-20 hidden h-48 w-48 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/[0.04] shadow-[0_0_80px_rgba(59,130,246,0.12)] md:flex">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-blue-500/20 to-violet-500/20 shadow-[0_0_55px_rgba(34,211,238,0.2)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/50 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.45)]">
                  <div className="h-5 w-5 rounded-full bg-cyan-200 shadow-[0_0_28px_rgba(103,232,249,0.95)]" />
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-cyan-200 sm:text-xs">
                CONVERSATIONAL BUSINESS INTELLIGENCE
              </div>

              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
                Ask your data{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  anything.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Turn your business questions into natural language and get
                governed insights with the power of Agentic AI.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "✦ Natural Language",
                  "◈ Governed Analytics",
                  "✧ Real-time Insights",
                  "✺ Powered by Llama 3",
                ].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-slate-300">
                    {item}
                  </span>
                ))}
              </div>

              <form
                className="mt-8 flex flex-col gap-2 rounded-2xl border border-cyan-300/30 bg-[#080F22]/85 p-2 shadow-[0_0_45px_rgba(34,211,238,0.07)] sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  void askMetricMind();
                }}
              >
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask MetricMind... e.g. Show me European sales"
                  aria-label="Ask MetricMind a question"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-6 py-4 text-sm font-bold text-[#07101F] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "➤ Ask MetricMind"}
                </button>
              </form>
            </div>
          </div>

          {/* Error and loading */}
          {(error || backendStatus === "disconnected") && (
            <div role="alert" className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
              <strong>Unable to connect to MetricMind backend.</strong>
              <p className="mt-2">{error || "The backend health check failed. Check that FastAPI is running and reachable."}</p>
              <p className="mt-2 break-all text-xs text-rose-200/70">
                Endpoint: {API_URL}
              </p>
            </div>
          )}

          {loading && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#10182A] p-6 text-sm text-slate-300">
              <span className="mr-3 inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
              Analyzing your question...
            </div>
          )}

          {/* Suggested questions */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold sm:text-lg">Suggested Questions</h2>
              <span className="text-xs text-slate-500">Explore your data</span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {suggestions.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => void askMetricMind(item.title)}
                  disabled={loading}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#13203A] to-[#10162A] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-950/20 disabled:opacity-50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-lg text-cyan-200">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.subtitle}</p>
                  <div className="mt-4 text-xs text-cyan-300 transition group-hover:translate-x-1">
                    Ask question →
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Results */}
          {result && (
            <section className="mt-8 space-y-5">
              <div className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-[#101E38] to-[#11152A] p-6">
                <p className="text-[10px] font-bold tracking-[0.18em] text-cyan-300">
                  METRICMIND ANSWER
                </p>
                <h2 className="mt-3 text-xl font-bold leading-relaxed sm:text-2xl">
                  {result.answer || "The backend returned no answer text."}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.plan?.metric && (
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                      Metric: {result.plan.metric}
                    </span>
                  )}
                  {result.plan?.analysis_type && (
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                      Analysis: {result.plan.analysis_type}
                    </span>
                  )}
                  {result.plan?.market && (
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                      Market: {result.plan.market}
                    </span>
                  )}
                </div>
              </div>

              {/* KPI cards only show actual supplied metrics */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Revenue", "revenue"],
                  ["Profit", "profit"],
                  ["Profit Margin", "profit_margin"],
                  ["Shipping Cost", "shipping_cost"],
                ].map(([label, metricKey]) => {
                  const value = getMetricValue(metricKey as keyof typeof metricColumnAliases);
                  return (
                    <div key={label} className="rounded-2xl border border-white/10 bg-[#10182A] p-5">
                      <p className="text-sm text-slate-400">{label}</p>
                      <p className="mt-3 break-words text-xl font-bold text-white">
                        {value == null
                          ? "Not returned by backend"
                          : metricKey === "profit_margin"
                            ? `${Number(value).toFixed(2)}%`
                            : money(value)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {value == null
                          ? result.kpi_error || "No aggregate value was returned"
                          : result.metric_scope || `Filtered to ${result.plan?.market || "all markets"}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Analytics chart */}
              <div id="analytics" className="scroll-mt-24 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                <div className="rounded-2xl border border-white/10 bg-[#10182A] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Data Visualization</h3>
                      <p className="mt-1 text-xs text-slate-500">Backend result data</p>
                    </div>
                    <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cyan-200">
                      ECharts
                    </span>
                  </div>

                  {rows.length > 0 && valueIndex >= 0 ? (
                    <ReactECharts
                      option={chartOption}
                      style={{ height: horizontalChart ? 380 : 320, width: "100%" }}
                      notMerge
                      lazyUpdate
                    />
                  ) : rows.length === 0 ? (
                    <div className="mt-5 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                      No result rows were returned, so there is no chart to display.
                    </div>
                  ) : (
                    <div className="mt-5 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                      The returned rows do not contain a numeric measure to chart.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#10182A] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-xl text-violet-300">
                      ✧
                    </div>
                    <div>
                      <h3 className="font-bold">AI Insights</h3>
                      <p className="mt-1 text-xs text-slate-500">Response summary</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    {result.answer || "No explanation was returned."}
                  </p>
                  <div className="mt-5 rounded-xl border border-violet-300/15 bg-violet-300/[0.04] p-4">
                    <p className="text-xs font-semibold text-violet-200">Query context</p>
                    <p className="mt-2 text-xs leading-6 text-slate-400">
                      {result.plan?.analysis_type || "Analysis type not provided"}
                      {result.plan?.metric ? ` · ${result.plan.metric}` : ""}
                      {result.plan?.market ? ` · ${result.plan.market}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* SQL/API transparency */}
              <div id="governance" className="scroll-mt-24 grid gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]">
                  <button
                    type="button"
                    onClick={() => setShowSQL(!showSQL)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-semibold">View SQL</p>
                      <p className="mt-1 text-xs text-slate-500">Inspect the query returned by the backend</p>
                    </div>
                    <span className="text-xl text-cyan-300">{showSQL ? "−" : "+"}</span>
                  </button>
                  {showSQL && (
                    <div className="border-t border-white/10 p-4">
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#080D19] p-4 text-xs leading-6 text-cyan-200">
                        {result.sql || "No SQL was returned by the backend."}
                      </pre>
                      {result.kpi_sql && (
                        <>
                          <p className="mb-2 mt-4 text-xs font-semibold text-slate-400">KPI aggregate SQL</p>
                          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#080D19] p-4 text-xs leading-6 text-cyan-200">
                            {result.kpi_sql}
                          </pre>
                        </>
                      )}
                      {result.sql && (
                        <button
                          type="button"
                          onClick={() => void navigator.clipboard.writeText(result.sql!)}
                          className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
                        >
                          Copy SQL
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]">
                  <button
                    type="button"
                    onClick={() => setShowAPI(!showAPI)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-semibold">View API Call</p>
                      <p className="mt-1 text-xs text-slate-500">Inspect request and response details</p>
                    </div>
                    <span className="text-xl text-cyan-300">{showAPI ? "−" : "+"}</span>
                  </button>
                  {showAPI && (
                    <div className="space-y-3 border-t border-white/10 p-4 text-xs">
                      <div className="rounded-lg bg-[#080D19] p-3">
                        <p className="text-slate-500">Endpoint</p>
                        <p className="mt-2 break-all text-cyan-200">{result.api_url || API_URL}</p>
                      </div>
                      <div className="rounded-lg bg-[#080D19] p-3">
                        <p className="text-slate-500">HTTP method</p>
                        <p className="mt-2 text-emerald-300">{result.api_method || "POST"}</p>
                      </div>
                      <div className="rounded-lg bg-[#080D19] p-3">
                        <p className="text-slate-500">Request payload</p>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-slate-300">
                          {JSON.stringify(lastRequest, null, 2)}
                        </pre>
                      </div>
                      <div className="rounded-lg bg-[#080D19] p-3">
                        <p className="text-slate-500">Backend API details</p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-slate-300">
                          {result.api_call === undefined
                            ? "No api_call field was returned by the backend."
                            : JSON.stringify(result.api_call, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <footer id="about" className="mt-12 border-t border-white/[0.08] py-6 text-center text-xs text-slate-500">
            MetricMind · Agentic Semantic BI Engine · Governed Business Intelligence
          </footer>
        </section>
      </div>
    </main>
  );
}
