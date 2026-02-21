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

interface CitiesBarChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

import { CustomTooltip } from './shared';

export default function CitiesBarChart({ data, entity1, entity2 }: CitiesBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={8}>
                <defs>
                    <linearGradient id="colorCity1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="colorCity2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    stroke="#e5e7eb"
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#e5e7eb" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey={entity1}
                    fill="url(#colorCity1)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                />
                <Bar
                    dataKey={entity2}
                    fill="url(#colorCity2)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
