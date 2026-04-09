import React from 'react';
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StatItemConfig {
  icon: keyof typeof Icons | string;
  value: number;
  suffix: string;
  label: string;
  bgColor: string;
  placeholderValue: string;
}

interface StatsSectionProps {
  badgeText: string;
  title: React.ReactNode;
  description: string;
  stats: StatItemConfig[];
}

export function StatsSection({ badgeText, title, description, stats }: StatsSectionProps) {
  return (
    <div className="text-center space-y-4 max-w-4xl mx-auto py-4">
      <Badge className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-200 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
        {badgeText}
      </Badge>
      
      <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
        {title}
      </h1>
      
      <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-xl mx-auto uppercase tracking-wide">
        {description}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {stats.map((stat, i) => {
          const IconComponent = (Icons as any)[stat.icon] || Icons.HelpCircle;
          return (
            <div key={i} className="group p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:border-brand-200">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110", stat.bgColor)}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-gray-900 leading-none">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight mt-1">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
