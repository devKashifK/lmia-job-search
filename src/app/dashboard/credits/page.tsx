"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  History,
  CreditCard,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import LoadingScreen from "@/components/ui/loading-screen";
import { useCreditData } from "@/hooks/use-credits";

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

  const lineChartOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#f97316",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#18181b",
        fontSize: 12,
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
      data: [],
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: "#e4e4e7" },
      },
      axisTick: { show: false },
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
    },
    series: [
      {
        name: "Credits Used",
        type: "line",
        data: creditData.creditRemaining,
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
      borderColor: "#f97316",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#18181b",
        fontSize: 12,
      },
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: { color: "#71717a" },
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-xl shadow-sm">
          <CreditCard className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Credits & Usage
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitor your credit usage and history
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Coins className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100/50 px-2.5 py-0.5 rounded-full">
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

        <Card className="overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-red-50 to-white">
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

        <Card className="overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-green-50 to-white">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
            <h3 className="text-sm font-medium text-zinc-900">
              Credit Distribution
            </h3>
            <div className="p-1.5 bg-zinc-100 rounded-md">
              <History className="w-4 h-4 text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ReactECharts
                option={pieChartOption}
                style={{ height: "100%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
            <h3 className="text-sm font-medium text-zinc-900">Usage Trends</h3>
            <div className="p-1.5 bg-zinc-100 rounded-md">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ReactECharts
                option={lineChartOption}
                style={{ height: "100%" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-sm font-medium text-zinc-900">
              Usage Overview
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Current billing period</p>
          </div>
          <span className="text-sm font-medium text-zinc-900">
            {usagePercentage.toFixed(1)}%
          </span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Progress value={usagePercentage} className="h-2 bg-zinc-100" />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0 credits</span>
              <span>{creditData.total_credit || 0} credits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
