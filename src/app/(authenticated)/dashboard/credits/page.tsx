"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("@/components/charts/lazy-echarts"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg" />,
});
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Activity, Calendar, Sparkles, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { useCreditData } from "@/hooks/use-credits";
import { getUsageHistoryList } from "@/lib/api/searches";
import { subDays, format, startOfDay, eachDayOfInterval, isSameDay } from "date-fns";
import LoadingScreen from "@/components/ui/loading-screen";

export default function CreditsPage() {
  const { session } = useSession();
  const { creditData, creditRemaining, isLoading: isCreditsLoading } = useCreditData();
  const [usageHistory, setUsageHistory] = useState<{ date: string; count: number }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch usage history (searches)
  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.id) return;

      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30); // Last 30 days

        const data = await getUsageHistoryList(session.user.id, startDate, endDate);

        // Process data for chart
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const history = days.map((day) => {
          const count = data.filter((item) =>
            isSameDay(new Date(item.created_at), day)
          ).length;
          return {
            date: format(day, "MMM d"),
            count,
            fullDate: day,
          };
        });

        setUsageHistory(history);
      } catch (error) {
        console.error("Error fetching usage history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [session?.user?.id]);

  // Statistics Calculations
  const stats = useMemo(() => {
    if (!usageHistory.length) return {
      usageThisMonth: 0,
      dailyAverage: 0,
      trend: 0,
      runoutDays: null
    };

    const usageThisMonth = usageHistory.reduce((acc, curr) => acc + curr.count, 0);
    const dailyAverage = usageThisMonth / 30;

    // Calculate trend (last 7 days vs previous 7 days)
    const last7Days = usageHistory.slice(-7).reduce((acc, curr) => acc + curr.count, 0);
    const prev7Days = usageHistory.slice(-14, -7).reduce((acc, curr) => acc + curr.count, 0);
    const trend = prev7Days > 0 ? ((last7Days - prev7Days) / prev7Days) * 100 : 0;

    const runoutDays = dailyAverage > 0 ? Math.floor((creditRemaining || 0) / dailyAverage) : null;

    return { usageThisMonth, dailyAverage, trend, runoutDays };
  }, [usageHistory, creditRemaining]);


  const lineChartOption = {
    color: ["#4ade80"],
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#e5e7eb",
      textStyle: { color: "#1f2937", fontSize: 12 },
      padding: [10, 15],
    },
    grid: { top: "15%", left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: usageHistory.map((d) => d.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6b7280", margin: 15 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: "#f3f4f6" } },
      axisLabel: { color: "#6b7280" },
    },
    series: [
      {
        name: "Credits Used",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#4ade80", borderWidth: 2, borderColor: "#fff" },
        lineStyle: { width: 3, shadowColor: "rgba(74, 222, 128, 0.3)", shadowBlur: 10, shadowOffsetY: 5 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(74, 222, 128, 0.2)" },
              { offset: 1, color: "rgba(74, 222, 128, 0)" },
            ],
          },
        },
        data: usageHistory.map((d) => d.count),
      },
    ],
  };

  const pieChartOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    legend: { bottom: "0%", left: "center", icon: "circle" },
    series: [
      {
        name: "Usage by Category",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        data: [
          { name: "Search Queries", value: stats.usageThisMonth, itemStyle: { color: "#4ade80" } },
          // Placeholder for other types if they existed
        ],
      },
    ],
  };

  if (isCreditsLoading || isLoadingHistory) {
    return <LoadingScreen className="h-[50vh]" />;
  }

  return (
    <div className="max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Credits & Usage
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Track your credit balance and usage history.
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10">
            <Calendar className="h-4 w-4" />
            Billing Cycle: {format(new Date(), "MMM 1")} - {format(new Date(), "MMM 30")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-brand-500 to-brand-600 text-white relative">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 translate-y-[-10%] opacity-10">
              <CreditCard className="h-full w-full" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brand-50">
                Available Credits
              </CardTitle>
              <CreditCard className="h-4 w-4 text-brand-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{creditRemaining}</div>
              <p className="text-xs text-brand-100 mt-1">
                Total: {creditData?.total_credit}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Usage this Month
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.usageThisMonth}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${stats.trend > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {stats.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stats.trend).toFixed(1)}% vs last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Daily Average
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.dailyAverage.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Credits per day
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Estimated Run-out
              </CardTitle>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.runoutDays === null || stats.runoutDays > 365 ? "∞" : `${stats.runoutDays} Days`}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on current usage
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="md:col-span-4"
        >
          <Card className="h-full border border-gray-100 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Usage Trend</CardTitle>
                  <p className="text-sm text-gray-500">Daily credit consumption over last 30 days</p>
                </div>
                <div className="p-2 bg-brand-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pl-0">
              <ReactECharts
                option={lineChartOption}
                style={{ height: "300px" }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="md:col-span-3"
        >
          <Card className="h-full border border-gray-100 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Usage Distribution</CardTitle>
                  <p className="text-sm text-gray-500">Credits used by feature</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-6">
              <ReactECharts
                option={pieChartOption}
                style={{ height: "300px", width: "100%" }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
