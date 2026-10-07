"use client";

const reports = [
    {
    name: "Sales Performance Report",
    description:
        "Overview of revenue, sales trends and sales performance.",
    type: "Sales",
    updated: "Today",
    },
    {
    name: "Profit Analysis Report",
    description:
        "Detailed analysis of profit, profit margin and performance.",
    type: "Finance",
    updated: "Today",
    },
    {
    name: "Regional Performance Report",
    description:
        "Compare revenue and profit across different regions.",
    type: "Regional",
    updated: "Yesterday",
    },
    {
    name: "Category Performance Report",
    description:
        "Analyze product category revenue and profitability.",
    type: "Category",
    updated: "Yesterday",
    },
];

export default function ReportsPage() {
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

        <button className="generate-button">
            + Generate Report
        </button>
        </header>

        <section className="reports-summary">
        <div className="report-summary-card">
            <span>Total Reports</span>
            <strong>12</strong>
            <small>Available reports</small>
        </div>

        <div className="report-summary-card">
            <span>Sales Reports</span>
            <strong>4</strong>
            <small>Sales performance</small>
        </div>

        <div className="report-summary-card">
            <span>Finance Reports</span>
            <strong>3</strong>
            <small>Profit and revenue</small>
        </div>

        <div className="report-summary-card">
            <span>Recent Reports</span>
            <strong>5</strong>
            <small>Updated recently</small>
        </div>
        </section>

        <section className="reports-panel">
        <div className="reports-panel-header">
            <div>
            <h2>Available Reports</h2>

            <p>
                Select a report to view its business insights.
            </p>
            </div>

            <select className="report-filter">
            <option>All Reports</option>
            <option>Sales</option>
            <option>Finance</option>
            <option>Regional</option>
            <option>Category</option>
            </select>
        </div>

        <div className="reports-list">
            {reports.map((report) => (
            <div className="report-row" key={report.name}>
                <div className="report-icon">
                📊
                </div>

                <div className="report-info">
                <h3>{report.name}</h3>

                <p>{report.description}</p>
                </div>

                <div className="report-type">
                {report.type}
                </div>

                <div className="report-updated">
                {report.updated}
                </div>

                <button className="view-report-button">
                View Report
                </button>
            </div>
            ))}
        </div>
        </section>

        <section className="quick-reports">
        <div className="quick-report-card">
            <div className="quick-icon">📈</div>

            <h3>Sales Report</h3>

            <p>
            Review sales trends and revenue performance.
            </p>

            <button>Open Report</button>
        </div>

        <div className="quick-report-card">
            <div className="quick-icon">💰</div>

            <h3>Profit Report</h3>

            <p>
            Analyze profit and profit margin performance.
            </p>

            <button>Open Report</button>
        </div>

        <div className="quick-report-card">
            <div className="quick-icon">🌎</div>

            <h3>Regional Report</h3>

        <p>
            Compare business performance across regions.
            </p>

            <button>Open Report</button>
        </div>
        </section>
    </main>
    );
}