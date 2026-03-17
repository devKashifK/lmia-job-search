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
import { CustomTooltip } from './shared';

interface LocationDonutChartProps {
    data: any[];
    entityName: string;
    colorScheme: 'blue' | 'green';
}

export default function LocationDonutChart({ data, entityName, colorScheme }: LocationDonutChartProps) {
    const colors = colorScheme === 'blue'
        ? ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff']
        : ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'];

    const chartData = data?.slice(0, 6).map((item: any) => ({
        name: item.name,
        value: item.count
    })) || [];

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 group/donut ${colorScheme === 'blue' ? 'border-blue-100 bg-blue-50/30' : 'border-green-100 bg-green-50/30'} p-6 shadow-xl hover:shadow-2xl`}>
            <div className={`absolute top-0 right-0 w-48 h-48 ${colorScheme === 'blue' ? 'bg-blue-500/10' : 'bg-green-500/10'} rounded-full blur-[80px] group-hover/donut:blur-[100px] transition-all duration-700`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-gradient-to-br ${colorScheme === 'blue' ? 'from-blue-500 to-blue-600 shadow-blue-500/20' : 'from-green-500 to-green-600 shadow-green-500/20'} rounded-xl shadow-lg`}>
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">{entityName}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Location Distribution</p>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {chartData.map((_: any, index: number) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={colors[index % colors.length]}
                                    className="hover:opacity-80 transition-opacity cursor-pointer shadow-xl"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text for Donut */}
                <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="block text-2xl font-extrabold text-gray-900 leading-none">
                        {chartData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">Total Jobs</span>
                </div>
            </div>
        </div>
    );
}
