import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-lg shadow-xl border-2 border-gray-100">
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        <span className="font-medium">{entry.name}:</span> {entry.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
