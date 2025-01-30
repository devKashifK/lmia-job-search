import React, { useState, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from "echarts/components";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ChartLineIcon,
  ChartPieIcon,
  FilterIcon,
  Download,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { saveAs } from "file-saver";

// Register the required components
echarts.use([
  GridComponent,
  TooltipComponent,
  TitleComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer,
]);

const aggregateData = (key, data) => {
  const aggregatedData = data.reduce((acc, item) => {
    const occupation = item[key] || "Unknown";
    if (!acc[occupation]) acc[occupation] = 0;
    acc[occupation] += 1; // Count occurrences
    return acc;
  }, {});

  const filteredData = Object.entries(aggregatedData).map(([name, value]) => ({
    name,
    value,
  }));

  const sortedData = filteredData.sort((a, b) => b.value - a.value);
  const average =
    filteredData.length > 0
      ? filteredData.reduce((acc, item) => acc + item.value, 0) /
        filteredData.length
      : 0;

  const highest = sortedData[0] || { name: "N/A", value: 0 };
  const lowest =
    sortedData.length > 0
      ? sortedData[sortedData.length - 1]
      : { name: "N/A", value: 0 };

  return { sortedData, average, highest, lowest };
};

const DynamicChart = ({ data, keyName, active, theme = "light" }) => {
  const [activeTab, setActiveTab] = useState("highest");
  const [activeChartType, setActiveChartType] = useState(active);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [chartInstance, setChartInstance] = useState(null);
  const { sortedData, average, highest, lowest } = aggregateData(keyName, data);

  const chartTypes = [
    { id: "bar", icon: ChartBarIcon },
    { id: "line", icon: ChartLineIcon },
    { id: "pie", icon: ChartPieIcon },
  ];

  const top10Highest = sortedData.slice(0, 10);
  const top10Lowest = sortedData.slice(-10).reverse();
  const displayData =
    activeTab === "highest"
      ? top10Highest
      : activeTab === "lowest"
      ? top10Lowest
      : sortedData;

  // Custom color themes
  const themes = {
    light: {
      primary: "#f97316",
      secondary: "#fed7aa",
      gradient: ["#f97316", "#fdba74", "#fed7aa"],
      background: "white",
      text: "#334155",
    },
    dark: {
      primary: "#fb923c",
      secondary: "#fed7aa",
      gradient: ["#fb923c", "#fdba74", "#fed7aa"],
      background: "#1f2937",
      text: "#f3f4f6",
    },
  };

  const colors = themes[theme];

  // Chart animation configuration
  const chartAnimationDuration = 1000;
  const chartAnimationEasing = "cubicInOut";

  // Improved export functionality
  const handleExport = (format) => {
    if (!chartInstance) return;

    if (format === "png") {
      const opts = {
        type: "png",
        pixelRatio: 2,
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        excludeComponents: ["toolbox"],
      };

      chartInstance.getDataURL(opts).then((url) => {
        const link = document.createElement("a");
        link.download = `${keyName}-chart-${new Date().getTime()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      const config = chartInstance.getOption();
      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `${keyName}-config-${new Date().getTime()}.json`);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-zinc-200/50"
      >
        <p className="text-xs font-medium text-zinc-600">{label}</p>
        <p className="text-sm font-semibold text-zinc-800">
          {payload[0]?.value}
        </p>
      </motion.div>
    );
  };

  // Chart options with enhanced animations
  const getChartOptions = useCallback(
    (dataset, chartType) => {
      const commonOptions = {
        animation: true,
        animationDuration: chartAnimationDuration,
        animationEasing: chartAnimationEasing,
        animationThreshold: 2000,
        progressiveThreshold: 3000,
        progressive: 200,
        grid: {
          top: 5,
          bottom: 0,
          left: 0,
          right: 0,
          containLabel: true,
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "#fed7aa",
          borderWidth: 1,
          textStyle: {
            color: "#334155",
            fontSize: 10,
          },
          padding: [3, 6],
          formatter: (params) => `${params.name}: ${params.value}`,
          shadowBlur: 8,
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOffsetY: 2,
        },
      };

      if (chartType === "pie") {
        return {
          ...commonOptions,
          series: [
            {
              type: "pie",
              radius: ["30%", "70%"],
              itemStyle: {
                borderRadius: 2,
                borderColor: "#fff",
                borderWidth: 1,
                shadowBlur: 2,
                shadowColor: "rgba(0,0,0,0.1)",
              },
              label: { show: false },
              emphasis: {
                scale: true,
                scaleSize: 5,
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(0,0,0,0.2)",
                },
              },
              data: dataset.map((item) => ({
                name: item.name,
                value: item.value,
                itemStyle: {
                  color:
                    colors.gradient[
                      Math.floor(Math.random() * colors.gradient.length)
                    ],
                },
              })),
            },
          ],
        };
      }

      if (chartType === "bar") {
        return {
          ...commonOptions,
          xAxis: {
            type: "category",
            data: dataset.map((item) => item.name),
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed",
                color: "#e2e8f0",
                width: 0.5,
              },
            },
            axisLabel: { show: false },
          },
          series: [
            {
              type: "bar",
              barWidth: "40%",
              itemStyle: {
                borderRadius: [3, 3, 0, 0],
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "#f97316" },
                    { offset: 1, color: "#fed7aa" },
                  ],
                },
                shadowColor: "rgba(0,0,0,0.05)",
                shadowBlur: 4,
                shadowOffsetY: 2,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(249,115,22,0.2)",
                },
              },
              data: dataset.map((item) => item.value),
            },
          ],
        };
      }

      if (chartType === "line") {
        return {
          ...commonOptions,
          xAxis: {
            type: "category",
            data: dataset.map((item) => item.name),
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed",
                color: "#e2e8f0",
                width: 0.5,
              },
            },
            axisLabel: { show: false },
          },
          series: [
            {
              type: "line",
              smooth: true,
              symbolSize: 4,
              symbol: "circle",
              lineStyle: {
                width: 2,
                color: "#f97316",
                shadowColor: "rgba(249,115,22,0.2)",
                shadowBlur: 4,
              },
              itemStyle: {
                color: "#f97316",
                borderWidth: 2,
                borderColor: "#fff",
                shadowColor: "rgba(249,115,22,0.2)",
                shadowBlur: 4,
              },
              emphasis: {
                scale: true,
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: "rgba(249,115,22,0.4)",
                },
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(249,115,22,0.2)" },
                    { offset: 1, color: "rgba(249,115,22,0.02)" },
                  ],
                },
              },
              data: dataset.map((item) => item.value),
            },
          ],
        };
      }
    },
    [theme, chartAnimationDuration]
  );

  // Mobile responsiveness handler
  const handleResize = useCallback(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }, [chartInstance]);

  React.useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg shadow-sm border border-zinc-200/50 overflow-hidden w-full min-w-[300px] flex-1 backdrop-blur-sm h-[220px] flex flex-col",
        theme === "dark" ? "bg-gray-800" : "bg-white"
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-100 bg-gradient-to-r from-orange-50/50 to-white flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-orange-100 rounded-md">
            <Icon
              icon="material-symbols:area-chart-rounded"
              className="text-orange-500 h-3 w-3"
            />
          </div>
          <div>
            <h2 className="font-medium text-zinc-800 text-[11px]">{keyName}</h2>
            <p className="text-[9px] text-zinc-500">Last 30 days</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Chart Type Controls */}
          {chartTypes.map(({ id, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveChartType(id)}
              className={cn(
                "p-1 rounded transition-all duration-200",
                activeChartType === id
                  ? "text-orange-600 bg-orange-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Icon className="h-2.5 w-2.5" />
            </motion.button>
          ))}

          <div className="w-px h-2.5 bg-zinc-200 mx-0.5" />

          {/* Export Menu - Styled to match other controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded transition-all duration-200  text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <Share2 className="h-2.5 w-2.5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExport("png")}
                className="text-xs flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("json")}
                className="text-xs flex items-center gap-2"
              >
                <Icon icon="vscode-icons:file-type-json" className="h-3 w-3" />
                Export Configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-2.5 bg-zinc-200 mx-0.5" />

          {/* Filter Select */}
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="h-5 w-5 p-0 border-none bg-transparent hover:bg-transparent transition-colors duration-200 shadow-none rounded-none">
              <SelectValue>
                <FilterIcon className="h-2.5 w-2.5 text-zinc-500" />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart with Animation */}
      <div className="flex-1 p-2">
        <ReactECharts
          option={getChartOptions(displayData, activeChartType)}
          style={{ height: "100%", width: "100%" }}
          className="transition-all duration-300"
          onChartReady={(instance) => setChartInstance(instance)}
          theme={theme}
        />
      </div>

      {/* Enhanced Footer */}
      <motion.div
        layout
        className="px-2 py-1.5 border-t border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-white/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">
              Highest:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-medium text-[10px] text-zinc-800">
                {highest.value}
              </span>
              <span className="text-[9px] text-zinc-500 truncate max-w-[80px]">
                {highest.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">
              Lowest:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-medium text-[10px] text-zinc-800">
                {lowest.value}
              </span>
              <span className="text-[9px] text-zinc-500 truncate max-w-[80px]">
                {lowest.name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DynamicChart;
