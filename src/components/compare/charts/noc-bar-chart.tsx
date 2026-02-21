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

interface NocBarChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

import { CustomTooltip } from './shared';

export default function NocBarChart({ data, entity1, entity2 }: NocBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barGap={8}>
                <defs>
                    <linearGradient id="colorNOC1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="colorNOC2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#e5e7eb"
                />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} stroke="#e5e7eb" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey={entity1}
                    fill="url(#colorNOC1)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                />
                <Bar
                    dataKey={entity2}
                    fill="url(#colorNOC2)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
