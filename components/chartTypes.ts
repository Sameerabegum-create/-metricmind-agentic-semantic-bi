export type ChartDataPoint = {
  [key: string]: string | number;
};

export type ChartConfig = {
  chart_type: "bar" | "line";
  title: string;
  x_axis: string;
  metrics: string[];
  data: ChartDataPoint[];
};