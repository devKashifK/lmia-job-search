import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#ca8a04",
  "#dc2626",
  "#e11d48",
  "#9333ea",
];

export type ChartData = {
  label: string;
  value: number;
  percentage?: number;
};

export type TimeSeriesData = {
  year: string;
  count: number;
};

export type ChartType = "pie" | "bar" | "line" | "auto";

interface ChartProps {
  type: ChartType;
  data: ChartData[] | TimeSeriesData[];
  title: string;
  description?: string;
  height?: number;
  className?: string;
  minDataPoints?: number;
  isLoading?: boolean;
}

type ChartRequirements = {
  minDataPoints: number;
  maxDataPoints: number;
  requiresPercentages?: boolean;
  requiresTimeData?: boolean;
};

const CHART_REQUIREMENTS: Record<
  Exclude<ChartType, "auto">,
  ChartRequirements
> = {
  pie: {
    minDataPoints: 2,
    maxDataPoints: 10,
    requiresPercentages: true,
  },
  bar: {
    minDataPoints: 1,
    maxDataPoints: 15,
  },
  line: {
    minDataPoints: 3,
    maxDataPoints: 50,
    requiresTimeData: true,
  },
};

function isTimeSeriesData(data: unknown[]): data is TimeSeriesData[] {
  if (data.length === 0) return false;
  const firstItem = data[0] as Record<string, unknown>;
  return "year" in firstItem && "count" in firstItem;
}

function hasPercentages(data: ChartData[]): boolean {
  return data.every((item) => typeof item.percentage === "number");
}

function hasValidValues(data: ChartData[] | TimeSeriesData[]): boolean {
  if (isTimeSeriesData(data)) {
    return data.every(
      (item) => typeof item.count === "number" && item.count >= 0
    );
  }
  return (data as ChartData[]).every(
    (item) => typeof item.value === "number" && item.value >= 0
  );
}

function determineBestChartType(
  data: ChartData[] | TimeSeriesData[]
): Exclude<ChartType, "auto"> {
  if (!data || data.length === 0) return "bar";

  // Check if it's time series data
  if (isTimeSeriesData(data)) {
    if (data.length >= CHART_REQUIREMENTS.line.minDataPoints) {
      return "line";
    }
    return "bar";
  }

  const chartData = data as ChartData[];

  // For single value, use bar chart
  if (chartData.length === 1) {
    return "bar";
  }

  // For categorical data with percentages
  if (
    chartData.length <= CHART_REQUIREMENTS.pie.maxDataPoints &&
    hasPercentages(chartData)
  ) {
    return "pie";
  }

  // Default to bar chart
  return "bar";
}

interface TooltipPayload {
  payload?: {
    percentage?: number;
    label?: string;
    year?: string;
    count?: number;
  };
}

type TooltipFormatterFn = (
  value: number,
  name: string,
  props: TooltipPayload
) => [string, string];

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-pulse">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-200" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-500">Loading data...</p>
    </div>
  );
}

function TableView({ data }: { data: ChartData[] | TimeSeriesData[] }) {
  if (isTimeSeriesData(data)) {
    return (
      <div className="overflow-auto max-h-[250px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[250px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Label
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            {(data as ChartData[])[0]?.percentage !== undefined && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {(data as ChartData[]).map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.label}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.value}
              </td>
              {item.percentage !== undefined && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(item.percentage)}%
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface JobRecord {
  RecordID: number;
  state: string;
  city: string;
  date_of_job_posting: string;
  noc_code: string;
  noc_priority: string;
  job_title: string;
  operating_name: string;
  year: string;
  occupation_title: string;
  job_status: string;
  employer_type: string;
}

export function processJobData(data: JobRecord[]) {
  // Process state distribution
  const stateDistribution = data.reduce((acc, job) => {
    acc[job.state] = (acc[job.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateChartData: ChartData[] = Object.entries(stateDistribution)
    .map(([state, count]) => ({
      label: state,
      value: count,
      percentage: (count / data.length) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  // Process yearly trend
  const yearlyTrend = data.reduce((acc, job) => {
    acc[job.year] = (acc[job.year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const yearlyChartData: TimeSeriesData[] = Object.entries(yearlyTrend)
    .map(([year, count]) => ({
      year,
      count,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  // Process city distribution for top state
  const topState = stateChartData[0].label;
  const cityDistribution = data
    .filter((job) => job.state === topState)
    .reduce((acc, job) => {
      acc[job.city] = (acc[job.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const cityChartData: ChartData[] = Object.entries(cityDistribution)
    .map(([city, count]) => ({
      label: city,
      value: count,
      percentage:
        (count / data.filter((j) => j.state === topState).length) * 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 cities

  return {
    stateDistribution: stateChartData,
    yearlyTrend: yearlyChartData,
    cityDistribution: cityChartData,
  };
}

export function Chart({
  type = "auto",
  data,
  title,
  description,
  height = 250,
  className = "",
  minDataPoints = 2,
  isLoading = false,
}: ChartProps) {
  if (isLoading) {
    return (
      <div
        className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}
        style={{ height: `${height}px` }}
      >
        <LoadingState />
      </div>
    );
  }

  // Early validation of data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div
        className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}
        style={{ height: `${height}px` }}
      >
        <NoDataState />
      </div>
    );
  }

  // Validate data values
  if (!hasValidValues(data)) {
    return (
      <div className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}>
        <TableView data={data} />
      </div>
    );
  }

  // Determine the actual chart type to render
  const actualChartType = type === "auto" ? determineBestChartType(data) : type;

  // Get requirements for the actual chart type
  const requirements = CHART_REQUIREMENTS[actualChartType];

  // Validate data against requirements
  const isValidData = () => {
    if (data.length < requirements.minDataPoints) {
      return false;
    }

    if (data.length > requirements.maxDataPoints) {
      return false;
    }

    if (requirements.requiresTimeData && !isTimeSeriesData(data)) {
      return false;
    }

    if (
      requirements.requiresPercentages &&
      !hasPercentages(data as ChartData[])
    ) {
      return false;
    }

    return true;
  };

  // If data doesn't meet requirements for the specified chart type,
  // try to find a better chart type
  if (type !== "auto" && !isValidData()) {
    const bestType = determineBestChartType(data);
    if (bestType !== type) {
      return (
        <Chart
          type={bestType}
          data={data}
          title={title}
          description={description}
          height={height}
          className={className}
          minDataPoints={minDataPoints}
        />
      );
    }

    // If no suitable chart type is found, show table view
    return (
      <div className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Showing data in table format as it cannot be visualized as a {type}{" "}
            chart
          </p>
        </div>
        <TableView data={data} />
      </div>
    );
  }

  const formatTooltip: TooltipFormatterFn = (value, name, props) => {
    if (!props || !props.payload) {
      return [value.toString(), name];
    }

    const payload = props.payload;
    if ("count" in payload) {
      return [`${payload.count} records`, payload.year || ""];
    }

    return [
      `${value} records${
        payload.percentage ? ` (${Math.round(payload.percentage)}%)` : ""
      }`,
      payload.label || name,
    ];
  };

  const renderChart = (): React.ReactElement => {
    switch (actualChartType) {
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data as ChartData[]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {(data as ChartData[]).map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
          </PieChart>
        );

      case "bar":
        return (
          <BarChart data={data as ChartData[]}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="value">
              {(data as ChartData[]).map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data as TimeSeriesData[]}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={formatTooltip} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: "#4f46e5", r: 4 }}
            />
          </LineChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No chart type selected</p>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}>
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        {type !== actualChartType && (
          <p className="text-xs text-gray-400 italic">
            Showing {actualChartType} chart instead of {type} for better data
            visualization
          </p>
        )}
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
