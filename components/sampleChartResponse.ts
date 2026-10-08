import type { ChartConfig } from "./chartTypes";

export const sampleChartResponse: ChartConfig = {
    chart_type: "bar",
    title: "Revenue & Profit by Month",
    x_axis: "month",
    metrics: ["revenue", "profit"],
    data: [
    {
        month: "Jan",
        revenue: 42000,
        profit: 8500,
    },
    {
        month: "Feb",
        revenue: 48000,
        profit: 10200,
    },
    {
        month: "Mar",
        revenue: 45000,
        profit: 9100,
    },
    {
        month: "Apr",
        revenue: 52000,
        profit: 11800,
    },
    {
        month: "May",
        revenue: 49000,
        profit: 10500,
    },
    {
        month: "Jun",
        revenue: 41000,
        profit: 8200,
    },
    ],
};