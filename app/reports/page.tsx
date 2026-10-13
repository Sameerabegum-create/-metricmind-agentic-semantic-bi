
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

type Report = {
    id: string;
    title: string;
    summary: string;
    rows: Record<string, string | number>[];
};

type ReportsResponse = {
    reports: Report[];
    data_source?: string;
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All Reports");
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        apiRequest<ReportsResponse>("/api/reports")
            .then((response) => {
                setReports(response.reports ?? []);
                setError("");
            })
            .catch(() => {
                setError(
                    "Could not load reports. Check whether the backend is running."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const getReportType = (report: Report) => {
        if (report.id.includes("region")) return "Regional";
        if (report.id.includes("category")) return "Category";
        if (report.id.includes("profit")) return "Finance";
        return "Sales";
    };

    const visibleReports =
        filter === "All Reports"
            ? reports
            : reports.filter((report) => getReportType(report) === filter);

    const salesCount = reports.filter(
        (report) => getReportType(report) === "Sales"
    ).length;

    const financeCount = reports.filter(
        (report) => getReportType(report) === "Finance"
    ).length;

    return (
        <main className="reports-page">
            <header className="reports-header">
                <div>
                    <p className="reports-brand">MetricMind</p>
                    <h1>Reports</h1>
                    <p>
                        Generate, view and manage your business intelligence reports.
                    </p>
                </div>

                <button
                    className="generate-button"
                    onClick={() => {
                        if (reports.length > 0) {
                            setSelectedReport(reports[0]);
                        }
                    }}
                >
                    + Generate Report
                </button>
            </header>

            {loading && <p>Loading reports from backend...</p>}
            {error && <p role="alert">{error}</p>}

            <section className="reports-summary">
                <div className="report-summary-card">
                    <span>Total Reports</span>
                    <strong>{reports.length}</strong>
                    <small>Available reports</small>
                </div>

                <div className="report-summary-card">
                    <span>Sales Reports</span>
                    <strong>{salesCount}</strong>
                    <small>Sales performance</small>
                </div>

                <div className="report-summary-card">
                    <span>Finance Reports</span>
                    <strong>{financeCount}</strong>
                    <small>Profit and revenue</small>
                </div>

                <div className="report-summary-card">
                    <span>Recent Reports</span>
                    <strong>{reports.length}</strong>
                    <small>Available from backend</small>
                </div>
            </section>

            <section className="reports-panel">
                <div className="reports-panel-header">
                    <div>
                        <h2>Available Reports</h2>
                        <p>Select a report to view its business insights.</p>
                    </div>

                    <select
                        className="report-filter"
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                    >
                        <option>All Reports</option>
                        <option>Sales</option>
                        <option>Finance</option>
                        <option>Regional</option>
                        <option>Category</option>
                    </select>
                </div>

                <div className="reports-list">
                    {visibleReports.map((report) => (
                        <div className="report-row" key={report.id}>
                            <div className="report-icon">📊</div>

                            <div className="report-info">
                                <h3>{report.title}</h3>
                                <p>{report.summary}</p>
                            </div>

                            <div className="report-type">
                                {getReportType(report)}
                            </div>

                            <div className="report-updated">Backend data</div>

                            <button
                                className="view-report-button"
                                onClick={() => setSelectedReport(report)}
                            >
                                View Report
                            </button>
                        </div>
                    ))}

                    {!loading && !error && visibleReports.length === 0 && (
                        <div className="no-data">No reports found.</div>
                    )}
                </div>
            </section>

            <section className="quick-reports">
                {[
                    {
                        icon: "📈",
                        name: "Sales Report",
                        description: "Review sales trends and revenue performance.",
                        type: "Sales",
                    },
                    {
                        icon: "💰",
                        name: "Profit Report",
                        description: "Analyze profit and profit margin performance.",
                        type: "Finance",
                    },
                    {
                        icon: "🌎",
                        name: "Regional Report",
                        description: "Compare business performance across regions.",
                        type: "Regional",
                    },
                ].map((item) => (
                    <div className="quick-report-card" key={item.name}>
                        <div className="quick-icon">{item.icon}</div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>

                        <button
                            onClick={() => {
                                const match = reports.find(
                                    (report) => getReportType(report) === item.type
                                );

                                if (match) setSelectedReport(match);
                            }}
                        >
                            Open Report
                        </button>
                    </div>
                ))}
            </section>

            {selectedReport && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedReport.title}
                    className="reports-panel"
                >
                    <div className="reports-panel-header">
                        <div>
                            <h2>{selectedReport.title}</h2>
                            <p>{selectedReport.summary}</p>
                            <p>
                                Report type: {getReportType(selectedReport)}
                            </p>
                        </div>

                        <button onClick={() => setSelectedReport(null)}>
                            Close
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {selectedReport.rows.length > 0 &&
                                        Object.keys(selectedReport.rows[0]).map(
                                            (column) => (
                                                <th key={column}>{column}</th>
                                            )
                                        )}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReport.rows.map((row, index) => (
                                    <tr key={index}>
                                        {Object.entries(row).map(([key, value]) => (
                                            <td key={key}>
                                                {typeof value === "number"
                                                    ? value.toLocaleString()
                                                    : value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {selectedReport.rows.length === 0 && (
                            <p>No rows available for this report.</p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
