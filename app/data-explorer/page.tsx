"use client";

import { useState } from "react";

const sampleData = [
    {
    orderId: "CA-2019-100001",
    customer: "John Smith",
    country: "United States",
    region: "West",
    category: "Technology",
    product: "Laptop",
    sales: 1250,
    profit: 280,
    },
    {
    orderId: "CA-2019-100002",
    customer: "Sarah Johnson",
    country: "United States",
    region: "East",
    category: "Furniture",
    product: "Office Chair",
    sales: 680,
    profit: 120,
    },
    {
    orderId: "CA-2019-100003",
    customer: "Michael Brown",
    country: "Canada",
    region: "Central",
    category: "Office Supplies",
    product: "Printer Paper",
    sales: 320,
    profit: 75,
    },
    {
    orderId: "CA-2019-100004",
    customer: "Emily Davis",
    country: "United Kingdom",
    region: "South",
    category: "Technology",
    product: "Monitor",
    sales: 890,
    profit: 190,
    },
    {
    orderId: "CA-2019-100005",
    customer: "David Wilson",
    country: "Australia",
    region: "West",
    category: "Furniture",
    product: "Desk",
    sales: 1450,
    profit: 310,
    },
];

export default function DataExplorer() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [region, setRegion] = useState("All");

    const filteredData = sampleData.filter((item) => {
    const matchesSearch =
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.orderId.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
        category === "All" || item.category === category;

    const matchesRegion =
        region === "All" || item.region === region;

    return matchesSearch && matchesCategory && matchesRegion;
    });

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
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="data-filter">
            <label>Category</label>
            <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            >
            <option>All</option>
            <option>Technology</option>
            <option>Furniture</option>
            <option>Office Supplies</option>
            </select>
        </div>

        <div className="data-filter">
            <label>Region</label>
            <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            >
            <option>All</option>
            <option>West</option>
            <option>East</option>
            <option>Central</option>
            <option>South</option>
            </select>
        </div>
        </section>

        <section className="data-explorer-summary">
        <div>
            <span>Records</span>
            <strong>{filteredData.length}</strong>
        </div>

        <div>
            <span>Total Sales</span>
            <strong>
            $
            {filteredData
                .reduce((total, item) => total + item.sales, 0)
                .toLocaleString()}
            </strong>
        </div>

        <div>
            <span>Total Profit</span>
            <strong>
            $
            {filteredData
                .reduce((total, item) => total + item.profit, 0)
                .toLocaleString()}
            </strong>
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
                <th>Order ID</th>
                <th>Customer</th>
                <th>Country</th>
                <th>Region</th>
                <th>Category</th>
                <th>Product</th>
                <th>Sales</th>
                <th>Profit</th>
                </tr>
            </thead>

            <tbody>
                {filteredData.map((item) => (
                <tr key={item.orderId}>
                    <td>{item.orderId}</td>
                    <td>{item.customer}</td>
                    <td>{item.country}</td>
                    <td>{item.region}</td>
                    <td>{item.category}</td>
                    <td>{item.product}</td>
                    <td>${item.sales.toLocaleString()}</td>
                    <td>${item.profit.toLocaleString()}</td>
                </tr>
        ))}
            </tbody>
            </table>

            {filteredData.length === 0 && (
            <div className="no-data">
                No matching records found.
            </div>
            )}
        </div>
        </section>
    </div>
    );
}