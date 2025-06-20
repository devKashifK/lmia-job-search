"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import db from "@/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Skeleton } from "./skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
dayjs.extend(localizedFormat);
// No large icons, keep it clean

type SelectedValue = {
  filter_val: string;
  operating_name: string;
};

export function PremiumDialog({
  open,
  onOpenChange,
  selectedValue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedValue: SelectedValue;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[98%] max-w-[98%] p-0 h-[94vh] flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <DialogTitle className="sr-only">Analytics</DialogTitle>
        <PremiumDialogContent selectedValue={selectedValue} />
      </DialogContent>
    </Dialog>
  );
}

export function PremiumDialogContent({
  selectedValue,
}: {
  selectedValue: SelectedValue;
}) {
  // Pie slice hover state (must be at the top, before any early returns)
  const [activeIndexState, setActiveIndexState] = React.useState<number | undefined>(undefined);
  const [activeIndexIndustry, setActiveIndexIndustry] = React.useState<number | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnterState = (_: any, idx: number) => setActiveIndexState(idx);
  const onPieLeaveState = () => setActiveIndexState(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnterIndustry = (_: any, idx: number) => setActiveIndexIndustry(idx);
  const onPieLeaveIndustry = () => setActiveIndexIndustry(undefined);

  const { data: dashboardData } = useQuery<Snapshot>({
    queryKey: ["filter-availability", selectedValue.operating_name],
    queryFn: async () => {
      const { data, error } = await db.rpc("get_dashboard_data", {
        filter_col: "operating_name",
        filter_val: selectedValue.operating_name,
      });

      if (error) throw error;
      return data;
    },
  });

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  const { by_year, by_state, by_city, by_occupation_title, total_count } =
    dashboardData;

  // Modern pastel/material color palette
  const chartColors = [
    '#6366F1', // indigo
    '#10B981', // emerald
    '#F59E42', // orange
    '#F87171', // red
    '#34D399', // green
    '#60A5FA', // blue
    '#FBBF24', // yellow
    '#A78BFA', // purple
    '#F472B6', // pink
    '#FCD34D', // gold
    '#6EE7B7', // teal
    '#818CF8', // violet
    '#FCA5A5', // rose
    '#FDE68A', // light yellow
    '#C4B5FD', // light purple
  ];

  // Tab and filter options (static for now)
  const tabs = [
    "Hot Leads",
    "LMIA",
    "RCIP",
    "FCIP",
    "Home Care Worker Pilot",
    "Alberta Rural",
    "Ontario REDI",
    "Manitoba Rural West-Cen...",
    "In-demand Jobs",
  ];
  

  // Helper to get top N + 'Other' for pie charts
  function getTopNWithOther(data: Breakdown[], n = 8) {
    if (!Array.isArray(data)) return [];
    if (data.length <= n) return data;
    const sorted = [...data].sort((a, b) => b.cnt - a.cnt);
    const top = sorted.slice(0, n);
    const other = sorted.slice(n);
    const otherSum = other.reduce(
      (acc, cur) => ({
        cnt: acc.cnt + cur.cnt,
        pct: acc.pct + cur.pct,
      }),
      { cnt: 0, pct: 0 }
    );
    if (otherSum.cnt > 0) {
      top.push({ label: 'Other', cnt: otherSum.cnt, pct: otherSum.pct });
    }
    return top;
  }

  // Helper to truncate labels
  function truncateLabel(label: string, max = 18) {
    return label.length > max ? label.slice(0, max) + '…' : label;
  }

  // Helper to get top N + 'Other' for bar chart
  function getTopNCitiesWithOther(data: Breakdown[], n = 12) {
    if (!Array.isArray(data)) return [];
    if (data.length <= n) return data;
    const sorted = [...data].sort((a, b) => b.cnt - a.cnt);
    const top = sorted.slice(0, n);
    const other = sorted.slice(n);
    const otherSum = other.reduce(
      (acc, cur) => ({
        label: 'Other',
        cnt: acc.cnt + cur.cnt,
        pct: acc.pct + cur.pct,
      }),
      { label: 'Other', cnt: 0, pct: 0 }
    );
    if (otherSum.cnt > 0) {
      top.push(otherSum);
    }
    return top;
  }

  // Prepare data for pie charts
  const by_state_top = getTopNWithOther(by_state, 8);
  const by_occupation_title_top = getTopNWithOther(by_occupation_title, 8);

  const by_city_top = getTopNCitiesWithOther(by_city, 12);

  // Find max value among non-'Other' cities
  const maxNonOther = Math.max(...by_city_top.filter(c => c.label !== 'Other').map(c => c.cnt));
  const xDomainMax = Math.round(maxNonOther * 1.2);

  // Custom legend for both charts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function CustomLegend({ payload }: { payload?: any[] }) {
    return (
      <div className="w-full flex flex-wrap justify-center gap-4 mt-8 py-2">
        {payload && payload.map((entry) => (
          <div
            key={entry.value}
            className="flex items-center space-x-2 text-xs text-gray-700 min-w-[120px]"
            title={entry.value}
          >
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate max-w-[80px] font-semibold" title={entry.value}>
              {truncateLabel(entry.value, 16)}
            </span>
            {entry.payload && entry.payload.pct !== undefined && (
              <span className="text-gray-400">{(entry.payload.pct * 100).toFixed(0)}%</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Custom Bar for coloring top 3 bars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    let color = chartColors[index % chartColors.length];
    if (index === 0) color = '#3B82F6';
    else if (index === 1) color = '#10B981';
    else if (index === 2) color = '#F59E42';
    return <rect x={x} y={y} width={width} height={height} fill={color} rx={6} />;
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          {selectedValue.operating_name}
        </h1>
      </div>
      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none transition-colors duration-200 ${
              tab === "LMIA"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-600 hover:text-blue-600 bg-blue-50"
            }`}
            style={{ minWidth: 120 }}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-blue-50 p-4 rounded-lg mb-8">
        <DialogContentFilters companyName={selectedValue.operating_name} />
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full py-10 pb-20">
        {/* Row 1: Two cards */}
        <div className="bg-white rounded-xl px-8 min-h-[480px] flex flex-col shadow-md border border-gray-100 transition-all duration-300 group overflow-hidden py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Annual Job Hiring Trends</h2>
          <div className="flex-1 flex items-center justify-center py-2">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={by_year}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
                barCategoryGap={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontWeight: 600, fontSize: 15 }}
                  axisLine={{ stroke: '#E0E7EF' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontWeight: 600, fontSize: 15 }}
                  axisLine={{ stroke: '#E0E7EF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E0E7EF',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px -1px rgb(0 0 0 / 0.10)'
                  }}
                  labelStyle={{ fontWeight: 700, color: '#3B82F6' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, _unused: unknown, props: any) => [
                    <span key={props && props.payload ? props.payload.label : 'year'} className="text-blue-600 font-bold">{value} jobs</span>,
                    'Jobs'
                  ]}
                />
                <Bar
                  dataKey="cnt"
                  name="Job Count"
                  radius={[12, 12, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  fill="url(#barGradient)"
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl px-8 min-h-[480px] flex flex-col shadow-md border border-gray-100 transition-all duration-300 group overflow-hidden py-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Hiring by States</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative py-2">
            <ResponsiveContainer width="100%" height={410}>
              <PieChart>
                <Pie
                  data={by_state_top}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="pct"
                  nameKey="label"
                  labelLine={false}
                  stroke="#fff"
                  strokeWidth={3}
                  activeIndex={activeIndexState}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={(props: any) => (
                    <g>
                      <Sector {...props} outerRadius={props.outerRadius + 8} />
                    </g>
                  )}
                  onMouseEnter={onPieEnterState}
                  onMouseLeave={onPieLeaveState}
                >
                  {by_state_top.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
                    />
                  ))}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, _unused: unknown, props: any) => [
                    `${props && props.payload ? props.payload.label : ''}: ${props && props.payload ? props.payload.cnt : ''} (${Number(value).toFixed(2)}%)`,
                    'State',
                  ]}
                />
                <Legend content={CustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Row 2: Full-width card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl px-8 min-h-[480px] flex flex-col shadow-md border border-gray-100 transition-all duration-300 group overflow-hidden py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Monthly Job Hiring Trends</h2>
          <MonthlyJobTrendsChart data={dashboardData.by_date_of_job_posting} />
        </div>
        {/* Row 3: Two cards */}
        <div className="bg-white rounded-xl p-8 min-h-[480px] flex flex-col shadow-md border border-gray-100 transition-all duration-300 group overflow-hidden py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Hiring by Cities</h2>
          <div className="flex-1 flex items-center justify-center py-4">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={by_city_top}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 40,
                  left: 30,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal vertical={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 13 }} axisLine={{ stroke: '#E5E7EB' }} domain={[0, xDomainMax]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: '#6B7280', fontSize: 15, fontWeight: 500 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  width={50}
                  tickFormatter={(label: string) => truncateLabel(label, 14)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(_value: any, _unused: unknown, props: any) => [
                    <span key={props && props.payload ? props.payload.label : 'city'}>
                      <span className="font-semibold">Count</span>: {props && props.payload ? props.payload.cnt : ''} ({props && props.payload ? (props.payload.pct * 100).toFixed(2) : ''}%)
                    </span>,
                    ''
                  ]}
                  labelFormatter={(label: string) => <span className="font-semibold">{label}</span>}
                />
                <Bar
                  dataKey="cnt"
                  radius={[0, 6, 6, 0]}
                  name="Job Count"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => {
                    // Lighter color for 'Other'
                    if (props.payload && props.payload.label === 'Other') {
                      return <rect x={props.x} y={props.y} width={props.width} height={props.height} fill="#FCA5A5" rx={6} />;
                    }
                    return renderCustomBar(props);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-8 min-h-[480px] flex flex-col shadow-md border border-gray-100 transition-all duration-300 group overflow-hidden py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Jobs by Industry</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            <ResponsiveContainer width="100%" height={410}>
              <PieChart>
                <Pie
                  data={by_occupation_title_top}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="pct"
                  nameKey="label"
                  labelLine={false}
                  stroke="#fff"
                  strokeWidth={3}
                  activeIndex={activeIndexIndustry}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={(props: any) => (
                    <g>
                      <Sector {...props} outerRadius={props.outerRadius + 8} />
                    </g>
                  )}
                  onMouseEnter={onPieEnterIndustry}
                  onMouseLeave={onPieLeaveIndustry}
                >
                  {by_occupation_title_top.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
                    />
                  ))}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, _unused: unknown, props: any) => [
                    `${props && props.payload ? props.payload.label : ''}: ${props && props.payload ? props.payload.cnt : ''} (${Number(value).toFixed(2)}%)`,
                    'Industry',
                  ]}
                />
                <Legend content={CustomLegend} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[160px] h-[160px] flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center -mt-14">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {(total_count / 1000).toFixed(2)}K
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Breakdown = { label: string; cnt: number; pct: number };
type Snapshot = {
  by_date_of_job_posting: Breakdown[];
  by_state: Breakdown[];
  by_city: Breakdown[];
  by_occupation_title: Breakdown[];
  by_operating_name: Breakdown[];
  by_year: Breakdown[];
  total_count: number;
};

export function useDashboardData(operatingName: string) {
  return useQuery<Snapshot>({
    queryKey: ["dashboard", operatingName],
    queryFn: async () => {
      const { data, error } = await db.rpc("get_dashboard_data", {
        filter_col: "operating_name",
        filter_val: operatingName,
      });

      if (error) throw error;
      return data;
    },
    enabled: Boolean(operatingName),
    placeholderData: (previousData) => previousData,
  });
}

// --- MonthlyJobTrendsChart component ---
type MonthlyJobTrendsChartProps = {
  data: Breakdown[];
};

function MonthlyJobTrendsChart({ data }: MonthlyJobTrendsChartProps) {
  // Aggregate by month (YYYY-MM)
  const monthlyMap = new Map<string, { cnt: number }>();
  data.forEach((item) => {
    const month = item.label.slice(0, 7); // 'YYYY-MM'
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { cnt: 0 });
    }
    monthlyMap.get(month)!.cnt += item.cnt;
  });
  // Sort by month ascending
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, { cnt }]) => ({
      month,
      cnt,
      label: dayjs(month + '-01').format('MMM YYYY'),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="flex-1 flex items-center justify-center py-2">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontWeight: 600, fontSize: 15 }}
            axisLine={{ stroke: '#E0E7EF' }}
            minTickGap={16}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontWeight: 600, fontSize: 15 }}
            axisLine={{ stroke: '#E0E7EF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E0E7EF',
              borderRadius: '10px',
              boxShadow: '0 4px 12px -1px rgb(0 0 0 / 0.10)'
            }}
            labelStyle={{ fontWeight: 700, color: '#3B82F6' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: unknown, _unused: unknown, props: { payload?: { label?: string } }) => [
              <span key={props && props.payload ? props.payload.label : 'month'} className="text-blue-600 font-bold">{Number(value)} jobs</span>,
              'Jobs'
            ]}
          />
          <Line
            type="monotone"
            dataKey="cnt"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 5, fill: '#fff', stroke: '#3B82F6', strokeWidth: 3 }}
            activeDot={{ r: 7, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


const DialogContentFilters = ({companyName}: {companyName: string}) => {

  const filters = [
    { label: "NOC Code" , name: "noc_code" },
    { label: "Job Category" , name: "job_title" },
    { label: "State"  , name: "state" },
    { label: "City" , name: "city" },
  ];

  return (
    filters.map((filter , idx) => (
      <div key={filter.label + idx} className="flex flex-col min-w-[140px]">
        <label className="text-xs text-gray-500 mb-1 font-medium">
          {filter.label}:
        </label>
       <DialogContentFiltersItem item={filter.name} label={filter.label} companyName={companyName} />
      </div>
    ))
  )
}


const DialogContentFiltersItem = ({item, label, companyName} : {item : string, label: string, companyName: string}) => {

  const {data, isLoading} = useFilterOptions(item, companyName)

  console.log(data , "CheckFilterOptionData")
  if (isLoading) return <Skeleton className="w-full h-10" />
  return (
    <Select >
      <SelectTrigger className="rounded-md w-48 border border-gray-300 px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-200">
        <SelectValue placeholder={`Select ${label}...`} className="text-sm" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((opt , idx) => (
          <SelectItem key={idx} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
  </Select>
  )
}

const useFilterOptions = (item: string, companyName: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["filter-options", item],
    queryFn: async () => {
      const { data, error } = await db.from("hot_leads_new").select(item).eq("operating_name", companyName);
      if (error) throw error;

      const unique = Array.from(new Set(data.map((row) => row[item])));
      return  unique ;
    },
  });
  return {data, isLoading}
}