'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { MapPin } from 'lucide-react';

interface LocationDonutChartProps {
    data: any[];
    entityName: string;
    colorScheme: 'blue' | 'green';
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-100 text-xs">
                <p className="font-semibold text-gray-900">{payload[0].name}</p>
                <p className="text-gray-600">
                    {payload[0].value.toLocaleString()} jobs ({payload[0].payload.percent ? (payload[0].payload.percent * 100).toFixed(0) : 0}%)
                </p>
            </div>
        );
    }
    return null;
};

export default function LocationDonutChart({ data, entityName, colorScheme }: LocationDonutChartProps) {
    const colors = colorScheme === 'blue'
        ? ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
        : ['#10b981', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

    const chartData = data?.slice(0, 6).map((item: any) => ({
        name: item.name,
        value: item.count
    })) || [];

    return (
        <div className={`relative overflow-hidden rounded-xl border ${colorScheme === 'blue' ? 'border-blue-200' : 'border-green-200'} bg-white p-4 shadow-sm`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${colorScheme === 'blue' ? 'bg-blue-500/5' : 'bg-green-500/5'} rounded-full blur-3xl`} />
            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 bg-gradient-to-br ${colorScheme === 'blue' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'} rounded-lg`}>
                        <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{entityName}</h3>
                        <p className="text-xs text-gray-500">Location Distribution</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
