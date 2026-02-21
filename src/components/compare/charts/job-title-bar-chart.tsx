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

interface JobTitleBarChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

import { CustomTooltip } from './shared';

export default function JobTitleBarChart({ data, entity1, entity2 }: JobTitleBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} barGap={8} layout="vertical">
                <defs>
                    <linearGradient id="colorJob1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="colorJob2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} stroke="#e5e7eb" />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    stroke="#e5e7eb"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey={entity1}
                    fill="url(#colorJob1)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={25}
                />
                <Bar
                    dataKey={entity2}
                    fill="url(#colorJob2)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={25}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
