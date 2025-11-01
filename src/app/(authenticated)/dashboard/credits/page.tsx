"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart2,
  PieChart,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import LoadingScreen from "@/components/ui/loading-screen";
import { useCreditData } from "@/hooks/use-credits";
import { motion } from "framer-motion";

interface EChartsParams {
  axisValue: string;
  value: number;
}

interface PieChartParams {
  value: number;
  percent: number;
  name: string;
}

export default function Credits() {
  const { creditData, creditError, creditRemaining } = useCreditData();

  if (!creditData) {
    return <LoadingScreen className="h-[93vh] relative" />;
  }

  if (creditError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 font-medium">Error loading credits data</p>
        <p className="mt-2 text-sm text-zinc-500">{creditError.message}</p>
      </div>
    );
  }

  const usagePercentage =
    ((creditData.used_credits || 0) / (creditData.total_credits || 1)) * 100;

  // Generate default data for the last 7 days if creditRemaining is not available
  const defaultCreditData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.max(0, (creditRemaining || 0) - i * 2),
  }));

  const lineChartOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#4ade80",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#18181b",
        fontSize: 12,
      },
      formatter: (params: EChartsParams[]) => {
        const date = params[0].axisValue;
        const value = params[0].value;
        return `<div class="text-xs font-medium">${date}</div>
                <div class="text-sm text-brand-600">${value} credits</div>`;
      },
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: defaultCreditData.map((item) => item.day),
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: "#e4e4e7" },
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#71717a",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      name: "Credits",
      nameTextStyle: { color: "#71717a" },
      axisLine: {
        lineStyle: { color: "#e4e4e7" },
      },
      splitLine: {
        lineStyle: { color: "#f4f4f5" },
      },
      axisLabel: {
        color: "#71717a",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "Credits Used",
        type: "line",
        data: defaultCreditData.map((item) => item.value),
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: {
          color: "#f97316",
          width: 3,
        },
        itemStyle: {
          color: "#f97316",
          borderWidth: 2,
          borderColor: "#fff",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(249, 115, 22, 0.2)",
              },
              {
                offset: 1,
                color: "rgba(249, 115, 22, 0)",
              },
            ],
          },
        },
      },
    ],
  };

  const pieChartOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#4ade80",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#18181b",
        fontSize: 12,
      },
      formatter: (params: PieChartParams) => {
        const value = params.value;
        const percent = params.percent;
        return `<div class="text-xs font-medium">${params.name}</div>
                <div class="text-sm text-brand-600">${value} credits (${percent}%)</div>`;
      },
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      itemGap: 20,
      itemWidth: 8,
      itemHeight: 8,
      formatter: (name: string) => {
        return `{a|${name}}`;
      },
      textStyle: {
        rich: {
          a: {
            fontSize: 12,
            color: "#71717a",
            padding: [0, 0, 0, 8],
          },
        },
      },
    },
    series: [
      {
        name: "Credits",
        type: "pie",
        radius: ["60%", "85%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        data: [
          {
            value: creditData.used_credit || 0,
            name: "Used Credits",
            itemStyle: { color: "#f97316" },
          },
          {
            value: creditRemaining || 0,
            name: "Remaining Credits",
            itemStyle: { color: "#22c55e" },
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-2.5 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-xl shadow-sm">
          <CreditCard className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Credits & Usage
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitor your credit usage and history
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="p-6 bg-gradient-to-br from-brand-50/90 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Coins className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-xs font-medium text-brand-600 bg-brand-100/50 px-2.5 py-0.5 rounded-full">
                  Total
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {creditData.total_credit || 0}
                </h2>
                <p className="text-xs text-zinc-500">Available credits</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="p-6 bg-gradient-to-br from-red-50/90 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-100/50 px-2.5 py-0.5 rounded-full">
                  Used
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {creditData.used_credit || 0}
                </h2>
                <p className="text-xs text-zinc-500">Credits spent</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="p-6 bg-gradient-to-br from-green-50/90 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100/50 px-2.5 py-0.5 rounded-full">
                  Remaining
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {creditRemaining || 0}
                </h2>
                <p className="text-xs text-zinc-500">Credits available</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-6 bg-gradient-to-r from-brand-50/90 via-brand-50/80 to-white border-b shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-lg shadow-md">
                  <BarChart2 className="w-4 h-4 text-brand-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Usage Trends
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Track your credit usage over time
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
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
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-6 bg-gradient-to-r from-brand-50/90 via-brand-50/80 to-white border-b shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-lg shadow-md">
                  <PieChart className="w-4 h-4 text-brand-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Credit Distribution
                  </h3>
                  <p className="text-xs text-zinc-500">
                    View your credit allocation
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ReactECharts
                option={pieChartOption}
                style={{ height: "300px" }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="p-6 bg-gradient-to-r from-brand-50/90 via-brand-50/80 to-white border-b shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-lg shadow-md">
                <TrendingUp className="w-4 h-4 text-brand-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-900">
                  Usage Overview
                </h3>
                <p className="text-xs text-zinc-500">
                  Current billing period summary
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-700">
                    Credit Usage
                  </span>
                  <span className="text-sm font-medium text-brand-600">
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2 bg-zinc-100" />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>0 credits</span>
                  <span>{creditData.total_credit || 0} credits</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-100 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">
                      Credits Used
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-900">
                    {creditData.used_credit || 0}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Total credits consumed this period
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <TrendingDown className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">
                      Remaining Credits
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-900">
                    {creditRemaining || 0}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Available for future searches
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
