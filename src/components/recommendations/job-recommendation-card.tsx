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

interface JobRecommendationCardProps {
    recommendation: JobRecommendation;
    index?: number;
    onSave?: (jobId: string) => void;
    isSaved?: boolean;
}

export function JobRecommendationCard({
    recommendation,
    index = 0,
    onSave,
    isSaved = false,
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

    const handleSave = async () => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-brand-300">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <Link href={detailUrl} className="block">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                    {jobTitle}
                                </h3>
                            </Link>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {employer}
                            </p>
                        </div>

                        {/* Match Score */}
                        <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0 px-3 py-1">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {matchPercentage}% Match
                            </Badge>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                disabled={isLoading}
                                className={isJobSaved ? "text-brand-600" : "text-gray-400 hover:text-brand-600"}
                            >
                                {isJobSaved ? (
                                    <BookmarkCheck className="h-5 w-5" />
                                ) : (
                                    <Bookmark className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Location & Salary */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {location}
                        </div>
                        {salary && (
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {typeof salary === 'number'
                                    ? `$${salary.toLocaleString()}/year`
                                    : salary}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {recommendation.job_source === 'lmia' ? 'LMIA' : 'Hot Lead'}
                        </div>
                    </div>

                    {/* Why This Job? */}
                    <div className="bg-brand-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-brand-700 mb-2">
                            Why we recommend this:
                        </p>
                        <ul className="space-y-1">
                            {topReasons.map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-brand-600 mt-0.5">•</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Button */}
                    <Link href={detailUrl}>
                        <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                            View Details
                            <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
}
