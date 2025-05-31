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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AttributeName } from "@/helpers/attribute";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

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

interface UseAiSummarizeParams {
  table: string;
  groupCols: string[];
  selectedMetric: string;
  metricCol: string;
  yearsBack: number;
  data: ChartDataInput[];
}

interface UseAiSummarizeResult {
  summary: string | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAiSummarize({
  table,
  groupCols,
  selectedMetric,
  metricCol,
  yearsBack,
  data,
}: UseAiSummarizeParams): UseAiSummarizeResult {
  // 1) Derive metricExpr from METRICS + metricCol
  const metricCfg = METRICS.find((m) => m.label === selectedMetric);
  if (!metricCfg) {
    throw new Error(`useAiSummarize: Unknown metric "${selectedMetric}"`);
  }
  const metricExpr = metricCfg.requiresCol
    ? `${metricCfg.expr}(${metricCol.trim()})`
    : metricCfg.expr;

  // 2) Build a human‐readable "grouping" description
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

  // 3) Use React Query for data fetching
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "ai-summarize",
      table,
      groupCols.join("|"),
      metricExpr,
      yearsBack,
      JSON.stringify(data),
    ],
    queryFn: async (): Promise<string> => {
      let topFiveDescriptor;
      if (groupCols.length === 1) {
        topFiveDescriptor = `top 5 ${groupCols[0]} values`;
      } else {
        const combo = groupCols.join(" + ");
        topFiveDescriptor = `top 5 combinations of (${combo})`;
      }
      // Build the prompt for the API
      const prompt = `
You are a data‐analysis AI. Below is an aggregation for table "${table}"
over the last ${yearsBack} year${yearsBack > 1 ? "s" : ""}, ${groupingDesc},
where "value" = ${metricExpr}. Each JSON entry has ${groupCols
        .map((c) => `"group_keys.${c}"`)
        .join(groupCols.length > 1 ? " and " : "")} plus its numeric "value".

Please produce a thorough, detailed summary that includes:
  1. A listing of the ${topFiveDescriptor} by ${metricExpr}, showing each item's raw count and its percentage of the total. Provide enough context so a reader understands how you computed those percentages.
  2. A discussion of the overall distribution shape (e.g. whether it's long‐tailed, how quickly counts drop off, any clustering). Provide concrete numbers/illustrations from the data where helpful.
  3. Identification of any entries (single values or combined group‐keys) that deviate significantly from the general pattern, with an explanation of why they stand out ("<Entity> is unusually high/low compared to its peers").
  4. A count of how many distinct ${groupCols.join(
    ", "
  )} entries fall into the following buckets:
     • High bucket (value ≥ 500)  
     • Mid bucket (100 ≤ value < 500)  
     • Low bucket (value < 100) 
     List the names of the entries in the high, mid, and low buckets.

Respond with plain text only—no business/marketing advice, no JSON, no extraneous commentary—just factual observations about the data.

JSON data:
${JSON.stringify(data, null, 2)}
`.trim();

      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          table,
          groupCols,
          metricExpr,
          yearsBack,
          data,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unknown API error");
      }
      return payload.summary as string;
    },
  });

  return {
    summary,
    isLoading,
    error: error as Error | null,
  };
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
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          Slice &amp; dice your data in real time
        </p>
      </header>

      {/* Summary Cards */}
      <div className="px-6 py-2 bg-gray-50">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Selected Metric</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {selectedMetric}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Groups</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {groupCols.map((col) => (
                <AttributeName key={col} name={col} />
              ))}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total {selectedMetric}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{total}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-2 rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-4 gap-2 h-full">
          {/* Controls Panel */}
          <aside className="col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Settings className="h-4 w-4" />
                Configuration
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
              {/* Table */}
              <div className="space-y-2">
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
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Filters
                  </label>
                  <button
                    className="text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1.5 text-sm font-medium"
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
                          <SelectTrigger className="w-full bg-white border-brand-50">
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
                          <SelectTrigger className="w-full bg-white border-brand-50">
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
                        <Input
                          className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 bg-white"
                          placeholder="Enter value"
                          value={f.value}
                          onChange={(e) =>
                            setFilters((fs) =>
                              fs.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Break down by
                </Label>
                <Select
                  value={groupCols[0]}
                  onValueChange={(value) => setGroupCols([value.trim()])}
                >
                  <SelectTrigger className="w-full bg-white border-brand-50">
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
                <Label className="text-sm font-medium text-gray-700">
                  Range
                </Label>
                <Select
                  value={range.toString()}
                  onValueChange={(value) => setRange(parseInt(value))}
                >
                  <SelectTrigger className="w-full bg-white border-brand-50">
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
                <label className="text-sm font-medium text-gray-700">
                  Metric
                </label>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-full bg-white border-brand-50">
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
                      <SelectTrigger className="w-full bg-white border-brand-50">
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

            {/* Run Analysis Button - Fixed at bottom */}
            <div className="px-6 py-2 bg-white border-t border-gray-100">
              <button
                className="w-full bg-brand-600 text-white py-2.5 px-4 rounded-md hover:bg-brand-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={runQuery}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Run Analysis"
                )}
              </button>
            </div>
          </aside>

          {/* Chart Panel */}
          <main className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Chart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Visualization
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  {CHART_TYPES.map((type) => {
                    const Icon = CHART_ICONS[type as keyof typeof CHART_ICONS];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setChartType(type);
                          setView("chart");
                        }}
                        className={cn(
                          "px-2 py-1 rounded-md transition-colors duration-200",
                          "hover:bg-gray-200/60",
                          "flex items-center gap-2 h-7",
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
                  className="relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 px-4 py-1.5 h-9 rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 group overflow-hidden"
                  onClick={() => setView("summary")}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] animate-shimmer"></span>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                        className="stroke-white/80"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8V16M8 12H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-medium">AI Summarize</span>
                  </div>
                </Button>
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

const SummaryView = ({
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100 border-opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin"></div>
          </div>
          <p className="text-gray-500 animate-pulse">Analyzing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white/50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Analysis Error</h3>
              <p className="text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[300px] bg-white/50">
      <div className="h-full max-w-full mx-auto px-4 py-2">
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header - Fixed height */}
          <div className="flex-none px-6 py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  AI Summary
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Analysis of {groupCols.join(", ")} data over {yearsBack} year
                  {yearsBack > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <article className="prose prose-indigo max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-600 leading-relaxed mb-4 hover:text-gray-900 transition-colors duration-200">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 mb-6 ml-4">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start space-x-2 group">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 mt-2.5 flex-shrink-0 group-hover:bg-brand-600 transition-colors duration-200"></span>
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                          {children}
                        </span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-brand-700 hover:text-brand-800 transition-colors duration-200 bg-brand-50 px-1 py-0.5 rounded">
                        {children}
                      </strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-brand-200 pl-4 my-4 italic bg-brand-50 py-2 pr-4 rounded-r-lg hover:bg-gray-100 transition-colors duration-200">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded font-mono text-sm hover:bg-gray-200 transition-colors duration-200">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {summary || ""}
                </ReactMarkdown>
              </article>
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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading data...</p>
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

  const chartConfig = {
    value: {
      label: "Value",
      color: "var(--chart-1)",
    },
    name: {
      label: "Name",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-full">
      {chartType === "bar" && <BarChartContainer chartData={chartData} />}
      {chartType === "line" && <LineChartContainer chartData={chartData} />}
      {chartType === "pie" && (
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              innerRadius={100}
              paddingAngle={4}
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
          </PieChart>
        </ChartContainer>
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
