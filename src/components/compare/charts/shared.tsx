import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
                <p className="font-extrabold text-gray-900 mb-2 tracking-tight text-sm uppercase">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <p className="text-xs font-semibold text-gray-600">
                                <span className="opacity-70">{entry.name}:</span> 
                                <span className="ml-1 text-gray-900 font-extrabold">{entry.value?.toLocaleString()}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};
