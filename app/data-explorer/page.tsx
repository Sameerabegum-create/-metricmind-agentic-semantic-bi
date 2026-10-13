
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";

type DataRecord = {
    date?: string;
    orderId?: string;
    order_id?: string;
    customer?: string;
    customer_name?: string;
    country?: string;
    region?: string;
    category?: string;
    product?: string;
    revenue?: number | string;
    sales?: number | string;
    cost?: number | string;
    profit?: number | string;
};

type DataResponse = {
    data?: DataRecord[];
    records?: DataRecord[];
    rows?: DataRecord[];
    data_source?: string;
};

function amount(value: number | string | undefined): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
    return "$" + value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });
}

export default function DataExplorer() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [region, setRegion] = useState("All");
    const [records, setRecords] = useState<DataRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest<DataResponse | DataRecord[]>("/api/data")
            .then((response) => {
                const rows = Array.isArray(response)
                    ? response
                    : response.data ?? response.records ?? response.rows ?? [];

                setRecords(rows);
                setError("");
            })
            .catch(() => {
                setError(
                    "Could not load data. Check that the backend is running."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(
        () => [...new Set(records.map((item) => item.category).filter(
            (value): value is string => Boolean(value)
        ))],
        [records]
    );

    const regions = useMemo(
        () => [...new Set(records.map((item) => item.region).filter(
            (value): value is string => Boolean(value)
        ))],
        [records]
    );

    const filteredData = records.filter((item) => {
        const orderId = String(item.orderId ?? item.order_id ?? "");
        const customer = String(
            item.customer ?? item.customer_name ?? ""
        );
        const product = String(item.product ?? "");
        const searchText = search.toLowerCase();

        const matchesSearch = [
            orderId,
            customer,
            product,
            item.country ?? "",
            item.category ?? "",
            item.region ?? "",
        ].some((value) => String(value).toLowerCase().includes(searchText));

        const matchesCategory =
            category === "All" || item.category === category;

        const matchesRegion =
            region === "All" || item.region === region;

        return matchesSearch && matchesCategory && matchesRegion;
    });

    const totalSales = filteredData.reduce(
        (total, item) => total + amount(item.revenue ?? item.sales),
        0
    );

    const totalCost = filteredData.reduce(
        (total, item) => total + amount(item.cost),
        0
    );

    const totalProfit = filteredData.reduce(
        (total, item) =>
            total +
            (item.profit !== undefined
                ? amount(item.profit)
                : amount(item.revenue ?? item.sales) - amount(item.cost)),
        0
    );

    return (
        <div className="data-explorer-page">
            <header className="data-explorer-header">
                <div>
                    <h1>Data Explorer</h1>
                    <p>Explore and filter your business data</p>
                </div>
            </header>

            <section className="data-explorer-filters">
                <div className="data-search">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search customer, product or order..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="data-filter">
                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="All">All</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className="data-filter">
                    <label>Region</label>
                    <select
                        value={region}
                        onChange={(event) => setRegion(event.target.value)}
                    >
                        <option value="All">All</option>
                        {regions.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            </section>

            {loading && <p>Loading business data from backend...</p>}
            {error && <p role="alert">{error}</p>}

            <section className="data-explorer-summary">
                <div>
                    <span>Records</span>
                    <strong>{loading ? "—" : filteredData.length}</strong>
                </div>

                <div>
                    <span>Total Sales</span>
                    <strong>{loading ? "—" : money(totalSales)}</strong>
                </div>

                <div>
                    <span>Total Profit</span>
                    <strong>{loading ? "—" : money(totalProfit)}</strong>
                </div>
            </section>

            <section className="data-table-panel">
                <div className="data-table-header">
                    <h2>Business Data</h2>
                    <span>{filteredData.length} records</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Country</th>
                                <th>Region</th>
                                <th>Category</th>
                                <th>Product</th>
                                <th>Sales</th>
                                <th>Cost</th>
                                <th>Profit</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((item, index) => {
                                const sales = amount(item.revenue ?? item.sales);
                                const cost = amount(item.cost);
                                const profit =
                                    item.profit !== undefined
                                        ? amount(item.profit)
                                        : sales - cost;

                                return (
                                    <tr
                                        key={`${item.orderId ?? item.order_id ?? "record"}-${index}`}
                                    >
                                        <td>{item.date ?? "—"}</td>
                                        <td>{item.orderId ?? item.order_id ?? "—"}</td>
                                        <td>{item.customer ?? item.customer_name ?? "—"}</td>
                                        <td>{item.country ?? "—"}</td>
                                        <td>{item.region ?? "—"}</td>
                                        <td>{item.category ?? "—"}</td>
                                        <td>{item.product ?? "—"}</td>
                                        <td>{money(sales)}</td>
                                        <td>{money(cost)}</td>
                                        <td>{money(profit)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {!loading && filteredData.length === 0 && (
                        <div className="no-data">
                            {error
                                ? "Data could not be loaded."
                                : "No matching records found."}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
