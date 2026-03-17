'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { CustomTooltip } from './shared';

interface JobTitleBarChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

export default function JobTitleBarChart({ data, entity1, entity2 }: JobTitleBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} barGap={12} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <defs>
                    <linearGradient id="colorEntity1Jobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="colorEntity2Jobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 10 }}
                />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', fontWeight: 800 }}
                />
                <Bar
                    dataKey={entity1}
                    fill="url(#colorEntity1Jobs)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={32}
                    animationDuration={1500}
                    animationEasing="ease-out"
                />
                <Bar
                    dataKey={entity2}
                    fill="url(#colorEntity2Jobs)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={32}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={200}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
