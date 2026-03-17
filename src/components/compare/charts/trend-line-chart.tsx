'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { CustomTooltip } from './shared';

interface TrendLineChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

export default function TrendLineChart({ data, entity1, entity2 }: TrendLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorEntity1Line" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEntity2Line" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0} />
                <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                />
                <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', fontWeight: 800 }}
                />
                <Line
                    type="monotone"
                    dataKey={entity1}
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 4 }}
                    animationDuration={2000}
                />
                <Line
                    type="monotone"
                    dataKey={entity2}
                    stroke="#10b981"
                    strokeWidth={4}
                    dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 4 }}
                    animationDuration={2000}
                    animationBegin={300}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
