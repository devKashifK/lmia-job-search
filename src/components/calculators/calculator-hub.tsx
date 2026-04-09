import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
    Star, 
    Briefcase, 
    GraduationCap, 
    Users, 
    MapPin, 
    Award,
    Clock,
    UserCircle,
    BadgeCheck,
    Languages,
    Share2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CalculatorType = 
    | 'express-entry' 
    | 'canada-67' 
    | 'alberta' 
    | 'bc' 
    | 'manitoba' 
    | 'nova-scotia' 
    | 'saskatchewan' 
    | 'ontario' 
    | 'quebec';

interface CalculatorInfo {
    id: CalculatorType;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
}

const CALCULATORS: CalculatorInfo[] = [
    {
        id: 'express-entry',
        title: "Express Entry CRS",
        description: "Comprehensive Ranking System score for IRCC draws.",
        icon: Star,
        color: "text-amber-600",
        bgColor: "bg-amber-50"
    },
    {
        id: 'canada-67',
        title: "Canada 67 Points",
        description: "Eligibility check for Federal Skilled Worker Program.",
        icon: BadgeCheck,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
    },
    {
        id: 'alberta',
        title: "Alberta PNP",
        description: "AAIP streams for skilled workers and entrepreneurs.",
        icon: Briefcase,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        id: 'bc',
        title: "British Columbia PNP",
        description: "SIRS scoring for BC's skills immigration streams.",
        icon: UserCircle,
        color: "text-violet-600",
        bgColor: "bg-violet-50"
    },
    {
        id: 'manitoba',
        title: "Manitoba PNP",
        description: "Skilled worker point assessment for MPNP draws.",
        icon: Users,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50"
    },
    {
        id: 'nova-scotia',
        title: "Nova Scotia PNP",
        description: "Qualification check for Nova Scotia's labor market streams.",
        icon: MapPin,
        color: "text-rose-600",
        bgColor: "bg-rose-50"
    },
    {
        id: 'saskatchewan',
        title: "Saskatchewan PNP",
        description: "SINP points grid for In-Demand and Express Entry.",
        icon: Award,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
    },
    {
        id: 'ontario',
        title: "Ontario PNP",
        description: "OINP points for employer job offers and human capital.",
        icon: Clock,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
    },
    {
        id: 'quebec',
        title: "Quebec QSWP",
        description: "Skilled worker program for the province of Quebec.",
        icon: Languages,
        color: "text-pink-600",
        bgColor: "bg-pink-50"
    }
];

interface CalculatorHubProps {
    onSelect: (calc: CalculatorType) => void;
    activeCalc?: CalculatorType;
    scores?: Record<string, { score: number, isEstimate: boolean }>;
    onShare?: (id: CalculatorType, score: number) => void;
}

export function CalculatorHub({ onSelect, activeCalc, scores, onShare }: CalculatorHubProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCULATORS.map((calc) => {
                const scoreData = scores?.[calc.id];
                return (
                    <Card 
                        key={calc.id}
                        className={cn(
                            "group cursor-pointer hover:shadow-md transition-all border-dashed border-gray-200 hover:border-solid hover:border-gray-900 overflow-hidden relative",
                            activeCalc === calc.id && "border-solid border-gray-900 ring-1 ring-gray-900"
                        )}
                        onClick={() => onSelect(calc.id)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className={cn("p-2.5 rounded-xl transition-colors shrink-0", calc.bgColor, calc.color)}>
                                    <calc.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1 pr-6">
                                    <h3 className="font-bold text-sm tracking-tight text-gray-900 group-hover:text-primary transition-colors flex items-center justify-between gap-2">
                                        {calc.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        {calc.description}
                                    </p>
                                </div>
                            </div>

                            {scoreData !== undefined && (
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Badge className={cn(
                                            "border text-[10px] font-black h-5 px-1.5 shrink-0",
                                            scoreData.isEstimate 
                                                ? "bg-amber-50 text-amber-700 border-amber-100" 
                                                : "bg-brand-50 text-brand-700 border-brand-100"
                                        )}>
                                            {scoreData.score} PTS
                                        </Badge>
                                        {scoreData.isEstimate && (
                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter mt-0.5">Potential Rank</span>
                                        )}
                                    </div>

                                    {onShare && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShare(calc.id, scoreData.score);
                                            }}
                                            className="p-2 transition-all hover:bg-brand-50 hover:text-brand-600 text-gray-300 rounded-lg flex items-center gap-1.5"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover:inline opacity-60">Share Assessment</span>
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
