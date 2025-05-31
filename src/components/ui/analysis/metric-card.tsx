import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface MetricCardProps {
  title: string;
  value: number;
  trend: "up" | "down" | "neutral";
  loading?: boolean;
  distribution?: {
    label: string;
    value: number;
    percentage: number;
  }[];
  yearlyTrend?: {
    year: string;
    count: number;
  }[];
  className?: string;
  selectedValue?: string;
}

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

export function MetricCardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg animate-pulse bg-white">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg animate-pulse bg-white">
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6 border rounded-lg animate-pulse bg-white">
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  trend,
  loading,
  distribution,
  yearlyTrend,
  className,
  selectedValue,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />;

  const trendIcon =
    trend === "up" ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : trend === "down" ? (
      <ArrowDown className="w-4 h-4 text-red-500" />
    ) : (
      <Minus className="w-4 h-4 text-gray-500" />
    );

  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-gray-600";

  const trendText =
    trend === "up"
      ? "Increasing trend"
      : trend === "down"
      ? "Decreasing trend"
      : "Stable trend";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="space-y-4">
          {/* Analysis Context */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <h3 className="text-sm font-medium text-gray-600">
              Current Analysis
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Field:</span>
              <span className="font-medium text-gray-900">{title}</span>
            </div>
            {selectedValue && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Selected Value:</span>
                <span className="font-medium text-gray-900">
                  {selectedValue}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              This analysis shows the distribution and trends for the selected
              field across all records in the database
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Records</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            {distribution && distribution[0] && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Most Common Value</p>
                <p className="text-lg font-semibold text-gray-800">
                  {distribution[0].label}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({Math.round(distribution[0].percentage)}%)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Trend Indicator */}
          <div
            className={`flex items-center gap-1 ${trendColor} px-3 py-2 rounded-lg bg-gray-50 w-fit`}
          >
            {trendIcon}
            <span className="text-sm font-medium">{trendText}</span>
          </div>
        </div>
      </div>

      {/* Distribution Section */}
      {distribution && distribution.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Percentage Breakdown
              </h4>
              <p className="text-xs text-gray-500">
                Shows how different {title.toLowerCase()} values are distributed
                across all records
              </p>
              <p className="text-xs text-gray-400 italic">
                Based on {value} total records in the database
              </p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
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
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} records (${Math.round(
                        props.payload.percentage
                      )}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Number of Records
              </h4>
              <p className="text-xs text-gray-500">
                Shows the count of records for each {title.toLowerCase()} value
              </p>
              <p className="text-xs text-gray-400 italic">
                Comparing distribution across different values
              </p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} records (${Math.round(
                        props.payload.percentage
                      )}%)`,
                      title,
                    ]}
                  />
                  <Bar dataKey="value">
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trend Section */}
      {yearlyTrend && yearlyTrend.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Changes Over Time
            </h4>
            <p className="text-xs text-gray-500">
              Shows how the number of records with this {title.toLowerCase()}{" "}
              has changed each year
            </p>
            <p className="text-xs text-gray-400 italic">
              Based on the year field in the records
            </p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyTrend}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} records`, title]} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: "#4f46e5", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
