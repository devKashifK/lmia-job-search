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

// Modern Pie Chart with Enhanced UI
export function ModernPieChart({
  data,
  innerRadius = 70,
  outerRadius = 120,
  colorScheme = 'brand',
  showLabels = false,
  showLegend = true
}: ModernPieChartProps) {
  const colors = CHART_COLORS[colorScheme];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Enhanced custom label rendering
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name, value
  }: any) => {
    if (percent < 0.08) return null; // Only show labels for slices > 8%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text 
          x={x} 
          y={y - 8} 
          fill="#374151" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={11}
          fontWeight="600"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <text 
          x={x} 
          y={y + 8} 
          fill="#6b7280" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={10}
          fontWeight="400"
        >
          {name.length > 12 ? `${name.substring(0, 12)}...` : name}
        </text>
      </g>
    );
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 px-4">
      {payload?.map((entry: any, index: number) => {
        const percentage = ((entry.payload.value / total) * 100).toFixed(1);
        return (
          <motion.div
            key={entry.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 text-sm"
          >
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 font-medium">
              {entry.value}
            </span>
            <span className="text-gray-500 text-xs">
              ({percentage}%)
            </span>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {colors.map((color, index) => (
                <React.Fragment key={index}>
                  <linearGradient id={`pie-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                  </linearGradient>
                  <filter id={`shadow-${index}`}>
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={0.2}/>
                  </filter>
                </React.Fragment>
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
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pie-gradient-${index % colors.length})`}
                  filter={`url(#shadow-${index % colors.length})`}
                  style={{
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              ))}
            </Pie>
            
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const percentage = ((data.value / total) * 100).toFixed(1);
                  return (
                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: data.color }}
                        />
                        <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
                      </div>
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">{data.value?.toLocaleString()}</span>
                        <span className="text-gray-500 ml-1">({percentage}%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {!showLegend && (
              <Legend content={() => null} />
            )}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center total display for donut charts */}
        {innerRadius > 40 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        )}
      </div>
      
      {showLegend && (
        <CustomLegend payload={data.map((item, index) => ({
          value: item.name,
          color: colors[index % colors.length],
          payload: item
        }))} />
      )}
    </div>
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
