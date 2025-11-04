'use client';

import React, { useState } from 'react';

// Color palette for charts
const COLOR_PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#3b82f6',
  '#10b981',
];

// Area Chart Component
interface AreaChartProps {
  data: Array<{ period: string; count: number }>;
  color?: string;
}

export const AreaChart = ({ data, color = '#10b981' }: AreaChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;
  const minValue = data.length > 0 ? Math.min(...data.map((d) => d.count)) : 0;
  const range = maxValue - minValue || 1;
  const width = 1000;
  const height = 400;
  const padding = 50;
  const bottomPadding = 80;

  const points =
    data.length > 1
      ? data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y =
            height -
            bottomPadding -
            ((d.count - minValue) / range) * (height - padding - bottomPadding);
          return { x, y, value: d.count, period: d.period };
        })
      : [];

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaData =
    points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${
          height - bottomPadding
        } L ${points[0].x} ${height - bottomPadding} Z`
      : '';

  return (
    <div className="relative w-full h-full px-4 py-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        <path d={areaData} fill="url(#areaGradient)" />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? '6' : '4'}
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="28"
                  rx="6"
                  fill="rgba(0, 0, 0, 0.8)"
                />
                <text
                  x={point.x}
                  y={point.y - 24}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {point.value}
                </text>
                <text
                  x={point.x}
                  y={point.y - 13}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                >
                  {point.period}
                </text>
              </g>
            )}
          </g>
        ))}
        <line
          x1={padding}
          y1={height - bottomPadding}
          x2={width - padding}
          y2={height - bottomPadding}
          stroke="#d1d5db"
          strokeWidth="1.5"
        />
        {points.map((point, index) => (
          <g key={`label-group-${index}`}>
            <line
              x1={point.x}
              y1={height - bottomPadding}
              x2={point.x}
              y2={height - bottomPadding + 5}
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <text
              x={point.x}
              y={height - bottomPadding + 30}
              textAnchor="middle"
              fontSize="18"
              fontWeight={hoveredIndex === index ? 700 : 600}
              fill={hoveredIndex === index ? '#047857' : '#1f2937'}
              className="select-none"
              style={{
                userSelect: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {point.period}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Donut Chart Component
interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  centerValue?: string | number;
  centerLabel?: string;
  onSegmentClick?: (name: string) => void;
}

export const DonutChart = ({
  data,
  centerValue,
  centerLabel,
  onSegmentClick,
}: DonutChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  let currentAngle = -90;

  const paths = data?.map((item, index) => {
    const assignedColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ');
    return {
      pathData,
      color: assignedColor,
      name: item.name,
      value: item.value,
      percentage: percentage.toFixed(1),
      index,
    };
  }) || [];

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="20"
      />
      {paths.map((path) => (
        <path
          key={path.index}
          d={path.pathData}
          fill={path.color}
          className="transition-all duration-200 cursor-pointer"
          style={{
            opacity:
              hoveredIndex === null || hoveredIndex === path.index ? 1 : 0.4,
            transform:
              hoveredIndex === path.index ? 'scale(1.02)' : 'scale(1)',
            transformOrigin: '50% 50%',
          }}
          onMouseEnter={() => setHoveredIndex(path.index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onSegmentClick && onSegmentClick(path.name)}
        />
      ))}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1f2937"
      >
        {centerValue}
      </text>
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="5"
        fill="#6b7280"
      >
        {centerLabel}
      </text>
    </svg>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  maxValue?: number;
  onBarClick?: (name: string) => void;
}

export const BarChart = ({ data, maxValue, onBarClick }: BarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max =
    maxValue || (data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1);

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div
          key={index}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onBarClick && onBarClick(item.name)}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="w-24 text-gray-700 truncate font-medium shrink-0">
              {item.name}
            </span>
            <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-visible relative min-w-0">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out flex items-center rounded-md relative"
                style={{
                  width: `${Math.max((item.value / max) * 100, 10)}%`,
                  transform:
                    hoveredIndex === index ? 'scaleY(1.1)' : 'scaleY(1)',
                }}
              >
                <span className="absolute right-2 text-white font-bold text-xs whitespace-nowrap">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Column Chart Component
interface ColumnChartProps {
  data: Array<{ title: string; count: number }>;
  onColumnClick?: (title: string) => void;
}

export const ColumnChart = ({ data, onColumnClick }: ColumnChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <div className="flex items-end justify-around h-48 gap-1 px-2">
      {data.map((item, index) => {
        const heightPercent = (item.count / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onColumnClick && onColumnClick(item.title)}
          >
            {/* Value label */}
            <div
              className={`text-xs font-bold transition-all ${
                hoveredIndex === index ? 'text-brand-700' : 'text-gray-600'
              }`}
            >
              {item.count}
            </div>
            {/* Bar */}
            <div
              className={`w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-md transition-all duration-300 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-80'
              }`}
              style={{
                height: `${heightPercent}%`,
                transform:
                  hoveredIndex === index ? 'scaleY(1.05)' : 'scaleY(1)',
                transformOrigin: 'bottom',
              }}
            />
            {/* Label */}
            <div className="text-[10px] text-gray-600 font-medium text-center truncate w-full">
              {item.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};
