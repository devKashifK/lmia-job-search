import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem } from "../ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

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

const DynamicChart = ({ data, keyName, active }) => {
  console.log(data, "CheckData");
  const [activeTab, setActiveTab] = useState("highest");
  const [activeChartType, setActiveChartType] = useState(active);

  const { sortedData, average, highest, lowest } = aggregateData(keyName, data);

  const top10Highest = sortedData.slice(0, 10);
  const top10Lowest = sortedData.slice(-10).reverse();
  const displayData =
    activeTab === "highest"
      ? top10Highest
      : activeTab === "lowest"
      ? top10Lowest
      : sortedData;

  const colors = [
    "#4caf50",
    "#2196f3",
    "#ff5722",
    "#ff9800",
    "#9c27b0",
    "#f44336",
    "#03a9f4",
    "#00bcd4",
    "#8bc34a",
    "#cddc39",
  ];

  const getChartOptions = (dataset, chartType, title) => {
    const commonGrid = {
      top: 10, // Space from the top
      bottom: 10, // Space from the bottom
      left: 2, // Space from the left
      right: 2, // Space from the right
      containLabel: false, // Ensures labels (if any) are contained within the grid
    };
    if (chartType === "pie") {
      return {
        // title: { text: `${title}`, left: "left" },
        tooltip: { trigger: "item" },
        xAxis: { show: false }, // Explicitly hide x-axis (if it's added somehow)
        yAxis: { show: false }, // Explicitly hide y-axis (if it's added somehow)
        grid: commonGrid,
        series: [
          {
            name: "Occupations",
            type: "pie",
            radius: ["0%", "85%"],
            data: dataset.map((item, index) => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: colors[index % colors.length],
                mariginTop: "20px",
              },
            })),
            label: {
              show: false, // Hide all labels
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
    }

    if (chartType === "bar") {
      return {
        // title: { text: `${title}`, left: "left" },
        tooltip: { trigger: "axis" },
        grid: commonGrid,

        xAxis: {
          type: "category",
          data: dataset.map((item) => item.name),
          axisLabel: { show: false }, // Hide x-axis labels
        },
        yAxis: {
          splitLine: {
            show: true, // Show grid lines
            lineStyle: {
              color: "#e0e0e0", // Customize the grid line color
              type: "dashed", // You can use 'solid', 'dashed', or 'dotted'
            },
          },
          type: "value",
          axisLabel: { show: false }, // Hide y-axis labels
        },
        series: [
          {
            data: dataset.map((item, index) => ({
              value: item.value,
              itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [8, 8, 0, 0],
              },
            })),
            type: "bar",
            barWidth: "60%",
          },
        ],
      };
    }

    if (chartType === "line") {
      return {
        // title: { text: `${title}`, left: "left" },

        tooltip: { trigger: "axis" },
        grid: commonGrid,

        xAxis: {
          type: "category",
          data: dataset.map((item) => item.name),
          axisLabel: { show: false },
        },
        yAxis: {
          type: "value",
          axisLabel: { show: false },
          splitLine: {
            show: true, // Show grid lines
            lineStyle: {
              color: "#e0e0e0", // Customize the grid line color
              type: "dashed", // You can use 'solid', 'dashed', or 'dotted'
            },
          },
        },
        series: [
          {
            data: dataset.map((item) => item.value),
            type: "line",
            smooth: true,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#2196f3" }, // Gradient start
                  { offset: 1, color: "rgba(33, 150, 243, 0.1)" }, // Gradient end
                ],
              },
            },
            lineStyle: {
              width: 3,
              color: "#2196f3",
            },
          },
        ],
      };
    }

    return {};
  };

  if (!sortedData || sortedData.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  return (
    <div className="w-[40rem] flex flex-col gap-4 bg-white/20 shadow-md rounded-sm">
      <div className="flex w-full justify-between items-center space-x-2 bg-white/10 border-b rounded-tr-sm rounded-tl-sm px-2 py-0.5">
        <div className="flex gap-2 items-center">
          <Icon
            icon="material-symbols:area-chart-rounded"
            className="text-blue-800"
          />
          <h2 className="text-sm text-blue-800 ">{keyName} Statistics</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveChartType("bar")}>
            <Icon
              icon={"uim:graph-bar"}
              className={cn(activeChartType === "bar" && "text-blue-800")}
            />
          </button>
          <button
            onClick={() => setActiveChartType("line")}
            className={`px-3 py-2 rounded-md `}
          >
            <Icon
              icon="tabler:chart-line"
              className={cn(activeChartType === "line" && "text-blue-800")}
            />
          </button>
          {/* <button onClick={() => setActiveChartType("pie")}>
            <Icon
              icon="ic:round-pie-chart"
              className={cn(activeChartType === "pie" && "text-blue-800")}
            />
          </button> */}
          <Select onValueChange={(value) => setActiveTab(value)}>
            <SelectTrigger>
              <button
                onClick={() => setActiveChartType("bar")}
                className={`px-2 py-2 rounded-md w-max `}
              >
                <Icon
                  icon={"mdi:filter-cog-outline"}
                  className="text-blue-800"
                />
              </button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Overview */}
      <div className="w-full flex flex-col gap-1 ">
        <div className="w-full p-2">
          <ReactECharts
            option={getChartOptions(
              displayData,
              activeChartType
              // activeTab === "highest"
              //   ? `Top 10 Highest ${keyName}`
              //   : activeTab === "lowest"
              //   ? `Top 10 Lowest ${keyName}`
              //   : `All ${keyName}`
            )}
            style={{ height: "120px" }}
          />
        </div>
        <div className="bg-active w-full">
          <div className=" flex justify-between px-4  gap-4 text-sm">
            {/* <div className=" rounded-md">
              <span className="font-medium text-xs">Total {keyName} :</span>{" "}
              {sortedData.length}
            </div> */}
            {/* <div className=" rounded-md">
              <span className="font-medium text-xs">Average Occurrences:</span>{" "}
              {average.toFixed(2)}
            </div> */}
            <div className="rounded-md text-[11px]">
              <span className="font-normal ">Highest:</span> {highest.name} (
              {highest.value})
            </div>
            <div className=" rounded-md text-[11px]">
              <span className="font-normal ">Lowest:</span> {lowest.name} (
              {lowest.value})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicChart;
