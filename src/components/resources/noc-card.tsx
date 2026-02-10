import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import { NocSummary } from '@/lib/noc-service';

interface NocCardProps {
    noc: NocSummary;
}

export function NocCard({ noc }: NocCardProps) {
    return (
        <Link href={`/resources/noc-codes/${noc.code}`} className="block h-full group">
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 rounded-xl overflow-hidden bg-white">
                <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-100 font-mono text-xs px-2 py-0.5">
                            NOC {noc.code}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-1.5">
                            {noc.teer}
                        </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-4 group-hover:text-brand-600 transition-colors flex-grow">
                        {noc.title}
                    </h3>

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
