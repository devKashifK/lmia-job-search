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

interface CategoryBarChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

import { CustomTooltip } from './shared';

export default function CategoryBarChart({ data, entity1, entity2 }: CategoryBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} barGap={12} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <defs>
                    <linearGradient id="colorEntity1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="colorEntity2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="shadow" height="130%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.1" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                />
                <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
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
                    fill="url(#colorEntity1)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={32}
                    animationDuration={1500}
                    animationEasing="ease-out"
                />
                <Bar
                    dataKey={entity2}
                    fill="url(#colorEntity2)"
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
