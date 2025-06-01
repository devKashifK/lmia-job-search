"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import db from "@/db/index";
import { useTableStore } from "@/context/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  VariableIcon,
  Filter,
  Calendar,
  Calculator,
  Sparkles,
  RefreshCw,
  Layers,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { AttributeName } from "@/helpers/attribute";
import { Label } from "./label";
import { Button } from "./button";
import { useQuery } from "@tanstack/react-query";
import { useFilterColumnAttributes } from "./new-filterpanel";

const TABLES = ["hot_leads_new", "lmia"];
const METRICS = [
  { label: "Number of records", expr: "count", requiresCol: true },
  { label: "Total salary", expr: "sum", requiresCol: true },
  { label: "Average salary", expr: "avg", requiresCol: true },
];
const CHART_TYPES = ["bar", "pie", "line"];
const OPERATORS = [
  { label: "Equals", value: "ilike" },
  { label: "Not equals", value: "!=" },
  { label: "Less than", value: "<" },
  { label: "Greater than", value: ">" },
  { label: "Less than or equal", value: "<=" },
  { label: "Greater than or equal", value: ">=" },
];

const yearRange = [
  { label: "5 years", value: 5 },
  { label: "4 years", value: 4 },
  { label: "3 years", value: 3 },
  { label: "2 years", value: 2 },
  { label: "1 year", value: 1 },
];

const hotLeadsColumns = [
  "state",
  "city",
  "noc_code",
  "noc_priority",
  "operating_name",
  "job_title",
  "year",
];

const lmiaColumns = [
  "territory",
  "program",
  "city",
  "lmia_year",
  "job_title",
  "operating_name",
  "noc_code",
];

const CHART_ICONS = {
  bar: BarChartIcon,
  pie: PieChartIcon,
  line: LineChartIcon,
};

interface Filter {
  column: string;
  operator: string;
  value: string;
}

interface ChartDataInput {
  group_keys: Record<string, string>;
  value: number;
}

interface ChartDataOutput {
  name: string;
  value: number;
}

interface ChartProps {
  chartType: string;
  data: ChartDataInput[];
}

const chartConfig = {
  value: {
    label: "Value",
  },
  name: {
    label: "Name",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export interface AiSummary {
  topFive: Array<{
    label: string;
    value: number;
    pctOfTotal: number;
  }>;
  distribution: {
    shapeDescription: string;
    median: number;
    q1: number;
    q3: number;
  };
  cumulativeShareTop3: number;
  outliers: string[];
  buckets: {
    high: { count: number; entries: string[] };
    mid: { count: number; entries: string[] };
    low: { count: number; entries: string[] };
  };
}

export function useAiSummarize({
  table,
  groupCols,
  selectedMetric,
  metricCol,
  yearsBack,
  data,
}: {
  table: string;
  groupCols: string[];
  selectedMetric: string;
  metricCol: string;
  yearsBack: number;
  data: Array<{ group_keys: Record<string, string>; value: number }>;
}) {
  // Build the metric expression from your METRICS list:
  const metricCfg = METRICS.find((m) => m.label === selectedMetric)!;
  const metricExpr = metricCfg.requiresCol
    ? `${metricCfg.expr}(${metricCol.trim()})`
    : metricCfg.expr;

  // Same groupingDesc logic we used in the API:
  let groupingDesc: string;
  if (groupCols.length === 0) {
    groupingDesc = "no grouping (entire table)";
  } else if (groupCols.length === 1) {
    groupingDesc = `grouped by ${groupCols[0]}`;
  } else {
    const allButLast = groupCols.slice(0, -1).join(", ");
    const last = groupCols[groupCols.length - 1];
    groupingDesc = `grouped by ${allButLast} and ${last}`;
  }

  const {
    data: summary,
    isLoading,
    error,
  } = useQuery<AiSummary>({
    queryKey: [
      "ai-summarize",
      table,
      groupCols.join("|"),
      metricExpr,
      yearsBack,
      JSON.stringify(data),
    ],
    queryFn: async (): Promise<AiSummary> => {
      const prompt = `
        You are a data‐analysis AI. Below is an aggregation for table "${table}"
        over the last ${yearsBack} year${
        yearsBack > 1 ? "s" : ""
      }, ${groupingDesc},
        where "value" = ${metricExpr}. Each JSON entry has ${groupCols
        .map((c) => `"group_keys.${c}"`)
        .join(groupCols.length > 1 ? " and " : "")} plus its numeric "value".
        
        Please produce a thorough, structured summary that includes:
          1. Top 5 ${groupCols.join(
            " + "
          )} by ${metricExpr}, with raw counts and percentage of total.
          2. Overall distribution shape (long‐tail, drop‐off, any clustering). 
          3. Median, 25th percentile, and 75th percentile values of "value".  
          4. Cumulative share of the top 3 entries (e.g. "Top 3 account for X% of the total").  
          5. Any entries that deviate significantly from the pattern ("City X is unusually high/low").  
          6. Buckets: high (≥ 500), mid (100–499), low (< 100) – list the cities in each bucket.
        
        Respond with **a single JSON object** following this expanded schema:
        
        \`\`\`json
        {
          "topFive": [
            { "label": string, "value": number, "pctOfTotal": number }
          ],
          "distribution": {
            "shapeDescription": string,
            "median": number,
            "q1": number,
            "q3": number
          },
          "cumulativeShareTop3": number,   // e.g. 0.45 means 45%
          "outliers": string[],           // labels of any "significant deviance"
          "buckets": {
            "high": { "count": number, "entries": string[] },
            "mid":  { "count": number, "entries": string[] },
            "low":  { "count": number, "entries": string[] }
          }
        }
        \`\`\`
        
        JSON data:
        \`\`\`json
        ${JSON.stringify(data, null, 2)}
        \`\`\`
          `.trim();

      // We already built "prompt" in the API; here we only need to POST:
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          groupCols,
          metricExpr,
          yearsBack,
          data,
          prompt,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unknown API error");
      }
      // Now payload is already shaped like AiSummary
      return JSON.parse(payload.summary) as AiSummary;
    },
  });

  return { summary, isLoading, error: error as Error | null };
}

export default function AnalyticsExplorer({
  selectedValue,
}: {
  selectedValue: any;
}) {
  const [schema, setSchema] = useState<Record<string, string[]>>({});
  const [table, setTable] = useState<string>(TABLES[0]);
  const { dataConfig } = useTableStore.getState();
  const columns =
    dataConfig.type === "hot_leads" ? hotLeadsColumns : lmiaColumns;
  const [filters, setFilters] = useState<Filter[]>([
    { column: "job_title", operator: "ilike", value: "cook" },
  ]);
  const [groupCols, setGroupCols] = useState<string[]>(["city"]);
  const [selectedMetric, setSelectedMetric] = useState<string>(
    METRICS[0].label
  );

  const [view, setView] = useState<"chart" | "summary">("chart");

  const [range, setRange] = useState<number>(yearRange[3].value);
  const [metricCol, setMetricCol] = useState<string>("job_title");
  const [chartType, setChartType] = useState<string>(CHART_TYPES[0]);
  const [data, setData] = useState<ChartDataInput[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch schema
  useEffect(() => {
    if (schema[table]?.length) {
      setGroupCols([schema[table][0]]);
      setMetricCol(
        schema[table].includes("job_title") ? "job_title" : schema[table][0]
      );
      setFilters([]);
    }
  }, [schema, table]);

  async function runQuery() {
    setLoading(true);
    const metricCfg = METRICS.find((m) => m.label === selectedMetric)!;
    const measureExpr = metricCfg.requiresCol
      ? `${metricCfg.expr}(${metricCol.trim()})`
      : metricCfg.expr;

    const { data: res, error } = await db.rpc("dynamic_analytics", {
      table_name: table,
      filters_json: filters,
      group_cols: groupCols.map((col) => col.trim()),
      measure_expr: measureExpr,
      date_column: "date_of_job_posting",
      years_back: range,
    });
    if (res) {
      const parsed = (res as any[]).map((r) => ({
        group_keys: r.group_keys,
        value: r.value,
      }));
      setData(parsed);
    }
    if (error) console.error(error);
    setLoading(false);
  }

  useEffect(() => {
    runQuery();
  }, [selectedValue]);

  // Calculate summary metric for UI cards
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-screen w-full bg-gray-50 overflow-hidden rounded-lg">
      {/* Header */}
      <header className="px-6 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50">
            <BarChartIcon className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Slice &amp; dice your data in real time
            </p>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="px-6 py-2 bg-gray-50">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-500">Selected Metric</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {selectedMetric}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-500">Groups</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {groupCols.map((col) => (
                <AttributeName key={col} name={col} />
              ))}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-500">Total {selectedMetric}</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">{total}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-2 rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-4 gap-2 h-full">
          {/* Controls Panel */}
          <aside className="col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-50">
                  <Settings className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Configuration
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
              {/* Table */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Table
                </label>
                <Select value={table} onValueChange={setTable}>
                  <SelectTrigger className="w-full bg-white border-brand-50">
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {TABLES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Filters
                    </label>
                  </div>
                  <button
                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium"
                    onClick={() =>
                      setFilters([
                        ...filters,
                        {
                          column: columns[0].trim(),
                          operator: "Equals",
                          value: "",
                        },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add filter</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {filters.map((f, i) => (
                    <div
                      key={i}
                      className="space-y-2 p-3 bg-gray-50 rounded-lg relative group"
                    >
                      <button
                        onClick={() =>
                          setFilters(filters.filter((_, index) => index !== i))
                        }
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Field</label>
                        <Select
                          value={f.column}
                          onValueChange={(value) =>
                            setFilters((fs) =>
                              fs.map((x, j) =>
                                j === i ? { ...x, column: value.trim() } : x
                              )
                            )
                          }
                        >
                          <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((c) => (
                              <SelectItem key={c.trim()} value={c.trim()}>
                                <AttributeName name={c.trim()} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">
                          Operator
                        </label>
                        <Select
                          value={f.operator}
                          onValueChange={(value) =>
                            setFilters((fs) =>
                              fs.map((x, j) =>
                                j === i ? { ...x, operator: value } : x
                              )
                            )
                          }
                        >
                          <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                <AttributeName name={o.label} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Value</Label>
                        <FilterBy
                          columnName={f.column}
                          setFilters={setFilters}
                          index={i}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group By */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    Break down by
                  </Label>
                </div>
                <Select
                  value={groupCols[0]}
                  onValueChange={(value) => setGroupCols([value.trim()])}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                    <SelectValue placeholder="Select grouping field" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => {
                      const trimmedCol = c.trim();
                      return (
                        <SelectItem key={trimmedCol} value={trimmedCol}>
                          <AttributeName name={trimmedCol} />
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Range */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    Range
                  </Label>
                </div>
                <Select
                  value={range.toString()}
                  onValueChange={(value) => setRange(parseInt(value))}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                    <SelectValue placeholder="Select grouping field" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRange.map((c) => {
                      const trimmedCol = c.value.toString();
                      return (
                        <SelectItem key={trimmedCol} value={trimmedCol}>
                          <AttributeName name={c.label} />
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Metric */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Metric
                  </label>
                </div>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                    <SelectValue placeholder="Choose metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((m) => (
                      <SelectItem key={m.label} value={m.label}>
                        <AttributeName name={m.label} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {METRICS.find((m) => m.label === selectedMetric)
                  ?.requiresCol && (
                  <div className="mt-2">
                    <Select
                      value={metricCol}
                      onValueChange={(value) => setMetricCol(value.trim())}
                    >
                      <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
                        <SelectValue placeholder="Select metric field" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((c) => {
                          const trimmedCol = c.trim();
                          return (
                            <SelectItem key={trimmedCol} value={trimmedCol}>
                              <AttributeName name={trimmedCol} />
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Run Analysis Button */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
              <button
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 px-4 rounded-lg hover:from-brand-700 hover:to-brand-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
                onClick={runQuery}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Chart Panel */}
          <main className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-50">
                    <TrendingUp className="h-5 w-5 text-brand-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Data Visualization
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg backdrop-blur-sm">
                    {CHART_TYPES.map((type) => {
                      const Icon =
                        CHART_ICONS[type as keyof typeof CHART_ICONS];
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setChartType(type);
                            setView("chart");
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-md transition-all duration-200",
                            "hover:bg-white/80 hover:shadow-sm",
                            "flex items-center gap-2",
                            chartType === type
                              ? "bg-white text-brand-600 shadow-sm"
                              : "text-gray-600"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium capitalize">
                            {type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    size="default"
                    className="relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 px-4 py-2 h-9 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/25 group overflow-hidden"
                    onClick={() => setView("summary")}
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] animate-shimmer"></span>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium">AI Summarize</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {view === "chart" && (
              <ChartView loading={loading} chartType={chartType} data={data} />
            )}
            {view === "summary" && (
              <SummaryView
                table={table}
                groupCols={groupCols}
                selectedMetric={selectedMetric}
                metricCol={metricCol}
                yearsBack={range}
                data={data}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

interface FilterByProps {
  columnName: string;
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  index: number;
}

const FilterBy: React.FC<FilterByProps> = ({
  columnName,
  setFilters,
  index,
}) => {
  const { data, isLoading, error } = useFilterColumnAttributes(columnName);

  return (
    <div>
      <Select
        onValueChange={(value) =>
          setFilters((prevFilters) =>
            prevFilters.map((filter, i) =>
              i === index ? { ...filter, value } : filter
            )
          )
        }
      >
        <SelectTrigger className="w-full bg-white border-gray-200 hover:border-brand-200 focus:border-brand-300 focus:ring-brand-200 transition-colors rounded-lg">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {data?.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const SummaryView = ({
  table,
  groupCols,
  selectedMetric,
  metricCol,
  yearsBack,
  data,
}: {
  table: string;
  groupCols: string[];
  selectedMetric: string;
  metricCol: string;
  yearsBack: number;
  data: ChartDataInput[];
}) => {
  const { summary, isLoading, error } = useAiSummarize({
    table,
    groupCols,
    selectedMetric,
    metricCol,
    yearsBack,
    data,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white/50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-xl border-4 border-t-indigo-600 border-r-indigo-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-gray-800 font-medium">AI Analysis in Progress</p>
            <p className="text-sm text-gray-500">
              Our AI is analyzing your data patterns...
            </p>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white/50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Analysis Error</h3>
              <p className="text-red-600 mt-1">
                {error?.message ?? "Unknown error."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    topFive,
    distribution: { shapeDescription, median, q1, q3 },
    cumulativeShareTop3,
    outliers,
    buckets: { high, mid, low },
  } = summary!;

  return (
    <div className="flex-1 h-full bg-gray-50/50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Summary
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Analysis of {groupCols.join(", ")} over the last {yearsBack}{" "}
                year{yearsBack > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Five Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Top 5 {groupCols.join(" + ")}
              </h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {groupCols.join(" + ")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topFive.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {item.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(item.pctOfTotal * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-50">
                <BarChartIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Distribution Analysis
              </h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {shapeDescription}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-medium mb-1">
                  Median
                </p>
                <p className="text-lg font-semibold text-purple-900">
                  {median.toLocaleString()}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-indigo-600 font-medium mb-1">
                  25th Percentile
                </p>
                <p className="text-lg font-semibold text-indigo-900">
                  {q1.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  75th Percentile
                </p>
                <p className="text-lg font-semibold text-blue-900">
                  {q3.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Cumulative Share Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-50">
                <PieChartIcon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Cumulative Share
              </h3>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                The top 3 {groupCols.join(" + ")} account for{" "}
                <span className="font-semibold">
                  {(cumulativeShareTop3 * 100).toFixed(1)}%
                </span>{" "}
                of the total.
              </p>
            </div>
          </div>

          {/* Outliers Section */}
          {outliers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Notable Outliers
                </h3>
              </div>
              <ul className="space-y-2">
                {outliers.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buckets Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-rose-50">
                <Layers className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Value Distribution
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* High Bucket */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    High Values
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ≥ 500
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {high.entries.map((e) => (
                    <div
                      key={e}
                      className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {e}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mid Bucket */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Mid Values
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    100-499
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {mid.entries.map((e) => (
                    <div
                      key={e}
                      className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {e}
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Bucket */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Low Values
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {"< 100"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {low.entries.map((e) => (
                    <div
                      key={e}
                      className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChartView = ({
  loading,
  chartType,
  data,
}: {
  loading: boolean;
  chartType: string;
  data: ChartDataInput[];
}) => {
  return (
    <div className="flex-1 px-6 py-2 min-h-[500px] overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-600 border-r-brand-400 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {chartType === "bar" && (
                  <BarChartIcon className="h-6 w-6 text-brand-600" />
                )}
                {chartType === "pie" && (
                  <PieChartIcon className="h-6 w-6 text-brand-600" />
                )}
                {chartType === "line" && (
                  <LineChartIcon className="h-6 w-6 text-brand-600" />
                )}
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-gray-800 font-medium">Analyzing Data</p>
              <p className="text-sm text-gray-500">
                Please wait while we process your request...
              </p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce"></div>
            </div>
          </div>
        </div>
      ) : (
        <Charts chartType={chartType} data={data} />
      )}
    </div>
  );
};

const Charts = ({ chartType, data }: ChartProps) => {
  const chartData: ChartDataOutput[] = data.map((d) => {
    const groupKeys = d.group_keys || {};
    const keys = Object.keys(groupKeys);
    const label =
      keys.length > 0 ? keys.map((k) => groupKeys[k]).join(" · ") : "Unknown";
    return { name: label, value: d.value };
  });

  return (
    <div className="w-full h-full">
      {chartType === "bar" && <BarChartContainer chartData={chartData} />}
      {chartType === "line" && <LineChartContainer chartData={chartData} />}
      {chartType === "pie" && (
        <div className="w-full h-[500px] flex items-center justify-center">
          <PieChart width={800} height={500}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx={300}
              cy={250}
              outerRadius={160}
              innerRadius={100}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`var(--chart-${(index % 5) + 1})`}
                  strokeWidth={2}
                  stroke="var(--background)"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col justify-between">
                        <span className="font-bold text-gray-600">
                          {payload[0].name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {payload[0].value?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                right: 0,
                paddingLeft: "40px",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            />
          </PieChart>
        </div>
      )}
    </div>
  );
};

export const BarChartContainer = ({
  chartData,
}: {
  chartData: ChartDataOutput[];
}) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[400px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => value}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-col justify-between">
                    <span className="font-bold text-muted-foreground">
                      {payload[0].payload.name}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {payload[0].value?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};

export const LineChartContainer = ({
  chartData,
}: {
  chartData: ChartDataOutput[];
}) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[400px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => value}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-col justify-between">
                    <span className="font-bold text-muted-foreground">
                      {payload[0].payload.name}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {payload[0].value?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
};
