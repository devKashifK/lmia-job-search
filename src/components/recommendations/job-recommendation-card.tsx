"use client";

import { motion } from "framer-motion";
import {
    MapPin,
    Building2,
    DollarSign,
    Clock,
    Sparkles,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobRecommendation } from "@/utils/recommendation-engine";
import { useSaveJob } from "@/hooks/use-save-job";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WageComparisonDisplay } from "@/components/analytics/wage-comparison-display";

interface JobRecommendationCardProps {
    recommendation: JobRecommendation;
    index?: number;
    onSave?: (jobId: string) => void;
    isSaved?: boolean;
    variant?: 'default' | 'compact';
}

export function JobRecommendationCard({
    recommendation,
    index = 0,
    onSave,
    isSaved = false,
    variant = 'default'
}: JobRecommendationCardProps) {
    const job = recommendation.job_data;

    if (!job) return null;

    // Use the useSaveJob hook - it only takes recordId parameter
    const { isSaved: isJobSaved, toggleSave, isLoading } = useSaveJob(recommendation.job_id);

    // Extract job details based on source
    const jobTitle = job.JobTitle || job.job_title || 'Job Opening';
    const employer = job.operating_name || job.employer || job.Employer || 'Company';
    const location = job.City && job.Province
        ? `${job.City}, ${job.Province}`
        : job.city || job.location || 'Canada';
    const salary = job.Wage || job.salary || job.median_salary;

    // Format score as percentage
    const matchPercentage = Math.round(recommendation.score * 100);

    // Get top 2 reasons
    const topReasons = recommendation.reasons.slice(0, 2);

    const handleSave = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        await toggleSave();
        // If an onSave prop is still provided, call it as well
        if (onSave) {
            onSave(recommendation.job_id);
        }
    };

    // Build detail page URL
    const detailUrl = recommendation.job_source === 'lmia'
        ? `/analysis/${encodeURIComponent(employer)}?t=lmia`
        : `/analysis/${encodeURIComponent(employer)}?t=trending_job`;

    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <Link href={detailUrl}>
                    <div className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-brand-300 transition-all duration-300 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-bold text-gray-900 truncate text-sm group-hover:text-brand-600 transition-colors">
                                    {jobTitle}
                                </h3>
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                    <Building2 className="h-3 w-3" />
                                    {employer}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-0 px-1.5 py-0.5 text-[10px] h-5 font-bold shadow-none">
                                    {matchPercentage}%
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-2 space-y-1.5 mb-3 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="truncate">{location}</span>
                            </div>
                            {salary && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <DollarSign className="h-3 w-3 text-gray-400" />
                                    <span className="truncate">
                                        {typeof salary === 'number'
                                            ? `${salary.toLocaleString()}/yr`
                                            : salary}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                {recommendation.job_source === 'lmia' ? 'LMIA' : 'Hot Lead'}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                disabled={isLoading}
                                className={cn("h-7 w-7", isJobSaved ? "text-brand-600 bg-brand-50" : "text-gray-400 hover:text-brand-600 hover:bg-gray-50")}
                            >
                                {isJobSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
        >
            <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-emerald-300 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6 flex flex-col h-full">
                    {/* Header Section (Pinned to top) */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <Link href={detailUrl} className="block group/title">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                                        {jobTitle}
                                    </h3>
                                </Link>
                                <p className="text-gray-500 mt-1.5 flex items-center gap-2 text-sm font-medium">
                                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{employer}</span>
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-none">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {matchPercentage}% Match
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className={cn(
                                        "h-9 w-9 rounded-xl transition-all",
                                        isJobSaved ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                    )}
                                >
                                    {isJobSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>

                        {/* Location & Meta */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-[13px] text-gray-600 font-medium">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="truncate">{location}</span>
                            </div>
                            {salary && (
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">
                                        {typeof salary === 'number'
                                            ? `$${salary.toLocaleString()}/yr`
                                            : salary}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{recommendation.job_source === 'lmia' ? 'LMIA' : 'Hot Lead'}</span>
                            </div>
                        </div>

                        {/* Wage Comparison (Optional info block) */}
                        {typeof salary === 'number' && job.NOC && (
                            <div className="mb-6">
                                <WageComparisonDisplay
                                    noc={job.NOC}
                                    province={job.Province || job.province}
                                    currentWage={salary / 2080}
                                />
                            </div>
                        )}

                        {/* Recommendation Reasons */}
                        <div className="relative border border-emerald-100 bg-emerald-50/30 rounded-xl p-4 mb-6">
                            <div className="absolute -top-2.5 left-3 px-2 bg-white text-[10px] font-bold text-emerald-600 uppercase tracking-wider border border-emerald-100 rounded-md">
                                Expert Insight
                            </div>
                            <ul className="space-y-2">
                                {topReasons.map((reason, idx) => (
                                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer Section (Pinned to bottom) */}
                    <div className="mt-auto pt-4 border-t border-gray-50">
                        <Link href={detailUrl}>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/10 group-hover:scale-[1.02] transition-transform">
                                View Details
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
