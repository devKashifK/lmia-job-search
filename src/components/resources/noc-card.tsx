import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { NocSummary } from '@/lib/noc-service';
import { cn } from '@/lib/utils';

interface NocCardProps {
    noc: NocSummary;
    isPreferred?: boolean;
}

export function NocCard({ noc, isPreferred }: NocCardProps) {
    return (
        <Link href={`/resources/noc-codes/${noc.code}`} className="block h-full group">
            <Card className={cn(
                "h-full border transition-all duration-300 rounded-xl overflow-hidden relative",
                isPreferred 
                    ? "border-brand-500 bg-brand-50/30 shadow-md ring-1 ring-brand-500/20" 
                    : "border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 bg-white"
            )}>
                {isPreferred && (
                    <div className="absolute top-0 right-0 p-2">
                        <Sparkles className="w-3 h-3 text-brand-600" />
                    </div>
                )}
                <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={cn(
                            "font-mono text-xs px-2 py-0.5",
                            isPreferred ? "bg-brand-600 text-white border-transparent" : "bg-brand-50 text-brand-700 border-brand-100"
                        )}>
                            NOC {noc.code}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-1.5">
                            {noc.teer}
                        </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-4 group-hover:text-brand-600 transition-colors flex-grow">
                        {noc.title}
                    </h3>

                    {isPreferred && (
                        <div className="mb-4">
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider bg-brand-100/50 px-2 py-0.5 rounded-full">
                                Recommended Match
                            </span>
                        </div>
                    )}

                    <div className="flex items-center text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-50">
                        <span className="flex items-center gap-1.5 group-hover:text-brand-600 transition-colors">
                            <BookOpen className="w-3.5 h-3.5" />
                            View Guide
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-500" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
