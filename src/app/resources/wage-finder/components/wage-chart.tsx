'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SalaryProspect } from "@/lib/noc-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, DollarSign } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  low: {
    label: "Low",
    color: "#fbbf24", // amber-400
  },
  median: {
    label: "Median",
    color: "#10b981", // emerald-500
  },
  high: {
    label: "High",
    color: "#059669", // emerald-600
  },
} satisfies ChartConfig;

interface WageChartProps {
  data: SalaryProspect[];
  title: string;
  isAnnual?: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function WageChart({ data, title, isAnnual = false, onToggle }: WageChartProps) {
  const multiplier = isAnnual ? 2080 : 1;
  const unit = isAnnual ? "/yr" : "/hr";

  // Prep data for Recharts (convert strings to numbers and apply multiplier)
  const chartData = data.map((d) => ({
    region: d.region.replace(" (Overall)", ""),
    low: (parseFloat(d.low) || 0) * multiplier,
    median: (parseFloat(d.median) || 0) * multiplier,
    high: (parseFloat(d.high) || 0) * multiplier,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
        <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No Salary Data Available</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-2">
          We couldn't find detailed wage information for this classification in our records.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: isAnnual ? 0 : 2,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-emerald-100/50">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-emerald-950">{title}</CardTitle>
              <CardDescription className="text-emerald-600/70 font-medium">Inter-provincial {isAnnual ? 'Annual Income' : 'Wage Distribution'} (CAD{unit})</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Tabs defaultValue={isAnnual ? "annual" : "hourly"} className="w-[180px]" onValueChange={(val) => onToggle(val === 'annual')}>
                <TabsList className="grid w-full grid-cols-2 bg-emerald-50 border border-emerald-100 rounded-xl h-10 p-1">
                  <TabsTrigger value="hourly" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider">Hourly</TabsTrigger>
                  <TabsTrigger value="annual" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider">Annual</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{isAnnual ? 'Est. 2,080h' : 'Market Rates'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-[400px] w-full mt-8">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="region"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => isAnnual ? `$${(val / 1000)}k` : `$${val}`}
                  width={60}
                />
                <ChartTooltip 
                    content={<ChartTooltipContent formatter={(val) => formatCurrency(Number(val))} />} 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} 
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}
                />
                <Bar
                  dataKey="low"
                  fill="var(--color-low)"
                  radius={[4, 4, 0, 0]}
                  barSize={isAnnual ? 30 : 24}
                />
                <Bar
                  dataKey="median"
                  fill="var(--color-median)"
                  radius={[4, 4, 0, 0]}
                  barSize={isAnnual ? 30 : 24}
                />
                <Bar
                  dataKey="high"
                  fill="var(--color-high)"
                  radius={[4, 4, 0, 0]}
                  barSize={isAnnual ? 30 : 24}
                />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h4 className="text-lg font-black text-emerald-950">Detailed Regional Breakdown ({isAnnual ? 'Annual' : 'Hourly'})</h4>
            </div>
            <div className="rounded-3xl border border-emerald-50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-emerald-50/50">
                        <TableRow className="hover:bg-transparent border-emerald-100">
                            <TableHead className="font-black text-emerald-900 px-6 py-4">Region</TableHead>
                            <TableHead className="font-black text-amber-600 px-6 py-4">Low ({unit})</TableHead>
                            <TableHead className="font-black text-emerald-600 px-6 py-4 text-center bg-emerald-100/30">Median ({unit})</TableHead>
                            <TableHead className="font-black text-emerald-800 px-6 py-4 text-right">High ({unit})</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chartData.map((row, i) => (
                            <TableRow key={i} className="hover:bg-emerald-50/30 transition-colors border-emerald-50">
                                <TableCell className="font-bold text-emerald-950 px-6 py-4">{row.region}</TableCell>
                                <TableCell className="font-medium text-gray-500 px-6 py-4 italic">{formatCurrency(row.low)}</TableCell>
                                <TableCell className="font-black text-emerald-700 px-6 py-4 text-center bg-emerald-50/20 underline decoration-emerald-200">{formatCurrency(row.median)}</TableCell>
                                <TableCell className="font-bold text-emerald-900 px-6 py-4 text-right">{formatCurrency(row.high)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
