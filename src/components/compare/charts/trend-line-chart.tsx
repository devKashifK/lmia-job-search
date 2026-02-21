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

interface TrendLineChartProps {
    data: any[];
    entity1: string;
    entity2: string;
}

import { CustomTooltip } from './shared';

export default function TrendLineChart({ data, entity1, entity2 }: TrendLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    stroke="#e5e7eb"
                    axisLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} stroke="#e5e7eb" axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                />
                <Line
                    type="monotone"
                    dataKey={entity1}
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', stroke: '#fff', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#6366f1' }}
                />
                <Line
                    type="monotone"
                    dataKey={entity2}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#10b981' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
