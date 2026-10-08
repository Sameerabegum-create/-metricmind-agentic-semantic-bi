"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

type ChartData = {
    [key: string]: string | number;
};

type DynamicChartProps = {
    type: "bar" | "line";
    data: ChartData[];
    xKey: string;
    yKeys: string[];
    title?: string;
};

export default function DynamicChart({
    type,
    data,
    xKey,
    yKeys,
    title,
}: DynamicChartProps) {
    return (
    <div className="dynamic-chart">
        {title && <h3>{title}</h3>}

        <div className="dynamic-chart-container">
        <ResponsiveContainer width="100%" height={320}>
            {type === "bar" ? (
            <BarChart
                data={data}
                margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                />

                <YAxis
                tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Legend />

                {yKeys.map((key, index) => (
    <Bar
    key={key}
    dataKey={key}
    name={key}
    fill={index === 0 ? "#4f46e5" : "#16a34a"}
    radius={[6, 6, 0, 0]}
    />
))}
            </BarChart>
            ) : (
            <LineChart
                data={data}
                margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                />

                <YAxis
                tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Legend />
{yKeys.map((key, index) => (
    <Line
    key={key}
    type="monotone"
    dataKey={key}
    name={key}
    stroke={index === 0 ? "#4f46e5" : "#16a34a"}
    strokeWidth={3}
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
    />
))}
            </LineChart>
            )}
        </ResponsiveContainer>
        </div>
    </div>
    );
}