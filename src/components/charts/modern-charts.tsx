'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  Treemap
} from 'recharts';
import { motion } from 'framer-motion';

// Modern color palettes
export const CHART_COLORS = {
  primary: ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
  pastel: ['#ffeaa7', '#fab1a0', '#fd79a8', '#fdcb6e', '#e17055'],
  professional: ['#2C3E50', '#E74C3C', '#3498DB', '#F39C12', '#27AE60'],
  brand: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
};

interface ChartData {
  name: string;
  value: number;
  label?: string;
  year?: string;
  count?: number;
  percentage?: number;
  color?: string;
}

interface ModernBarChartProps {
  data: ChartData[];
  dataKey?: string;
  nameKey?: string;
  colorScheme?: keyof typeof CHART_COLORS;
  showGrid?: boolean;
  animated?: boolean;
}

interface ModernPieChartProps {
  data: ChartData[];
  innerRadius?: number;
  outerRadius?: number;
  colorScheme?: keyof typeof CHART_COLORS;
  showLabels?: boolean;
  showLegend?: boolean;
}

interface ModernLineChartProps {
  data: ChartData[];
  dataKey?: string;
  nameKey?: string;
  colorScheme?: keyof typeof CHART_COLORS;
  smooth?: boolean;
  showArea?: boolean;
  showGrid?: boolean;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: pld.color }}
            />
            <span className="text-sm text-gray-700">
              {pld.name}: <span className="font-semibold">{pld.value?.toLocaleString()}</span>
              {pld.payload.percentage && (
                <span className="text-gray-500 ml-1">({pld.payload.percentage.toFixed(1)}%)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Modern Bar Chart
export function ModernBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colorScheme = 'brand',
  showGrid = true,
  animated = true
}: ModernBarChartProps) {
  const colors = CHART_COLORS[colorScheme];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <defs>
          {colors.map((color, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
            </linearGradient>
          ))}
        </defs>
        
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f1f5f9" 
            strokeOpacity={0.8}
          />
        )}
        
        <XAxis 
          dataKey={nameKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          angle={data.length > 8 ? -45 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          height={data.length > 8 ? 80 : 40}
        />
        
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Bar 
          dataKey={dataKey}
          radius={[4, 4, 0, 0]}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient-${index % colors.length})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Modern Pie Chart
export function ModernPieChart({
  data,
  innerRadius = 60,
  outerRadius = 100,
  colorScheme = 'brand',
  showLabels = true,
  showLegend = false
}: ModernPieChartProps) {
  const colors = CHART_COLORS[colorScheme];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {colors.map((color, index) => (
            <linearGradient key={index} id={`pie-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.8}/>
            </linearGradient>
          ))}
        </defs>
        
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomizedLabel : false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={2}
          stroke="white"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#pie-gradient-${index % colors.length})`}
            />
          ))}
        </Pie>
        
        <Tooltip content={<CustomTooltip />} />
        
        {showLegend && (
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// Modern Line Chart
export function ModernLineChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colorScheme = 'brand',
  smooth = true,
  showArea = false,
  showGrid = true
}: ModernLineChartProps) {
  const colors = CHART_COLORS[colorScheme];
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.3}/>
            <stop offset="100%" stopColor={colors[0]} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f1f5f9" 
            strokeOpacity={0.8}
          />
        )}
        
        <XAxis 
          dataKey={nameKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {showArea ? (
          <Area
            type={smooth ? "monotone" : "linear"}
            dataKey={dataKey}
            stroke={colors[0]}
            strokeWidth={3}
            fill="url(#area-gradient)"
            dot={{ fill: colors[0], stroke: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2, fill: 'white' }}
          />
        ) : (
          <Line
            type={smooth ? "monotone" : "linear"}
            dataKey={dataKey}
            stroke={colors[0]}
            strokeWidth={3}
            dot={{ fill: colors[0], stroke: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2, fill: 'white' }}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

// Modern Donut Chart (specialized Pie Chart)
export function ModernDonutChart({
  data,
  colorScheme = 'brand',
  showLabels = true,
  centerText
}: ModernPieChartProps & { centerText?: string }) {
  return (
    <div className="relative">
      <ModernPieChart
        data={data}
        innerRadius={70}
        outerRadius={110}
        colorScheme={colorScheme}
        showLabels={showLabels}
      />
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{centerText}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Chart Legends Component
export function ChartLegend({ data, colorScheme = 'brand' }: { data: ChartData[], colorScheme?: keyof typeof CHART_COLORS }) {
  const colors = CHART_COLORS[colorScheme];
  
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {data.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="text-sm text-gray-700">{item.name}</span>
        </motion.div>
      ))}
    </div>
  );
}
