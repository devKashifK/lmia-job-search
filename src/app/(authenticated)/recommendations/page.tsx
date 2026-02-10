"use client";

import { motion } from "framer-motion";
import {
    Sparkles,
    RefreshCw,
    Settings,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobRecommendations } from "@/hooks/use-job-recommendations";
import { JobRecommendationCard } from "@/components/recommendations/job-recommendation-card";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useSaveJob } from "@/hooks/use-save-job";
import Navbar from "@/components/ui/nabvar";
import { BottomNav } from "@/components/mobile/bottom-nav";
import useMobile from "@/hooks/use-mobile";
import Link from "next/link";

export default function RecommendationsPage() {
    const { isMobile } = useMobile();
    const { recommendations, isLoading, regenerate, isRegenerating } =
        useJobRecommendations();
    const { data: savedJobs } = useSavedJobs();

    // Check if a job is saved
    const isJobSaved = (jobId: string) => {
        return savedJobs?.some((job: any) => job.record_id === jobId);
    };

    // Handle save job (will be called with individual job IDs)
    const handleSaveJob = async (jobId: string) => {
        // Trigger save/unsave - the component will handle it via useSaveJob hook
        // This is a placeholder - actual implementation uses the hook directly in card
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mx-auto mb-4" />
                            <p className="text-gray-600">Generating personalized recommendations...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-brand-600" />
                                Job Recommendations
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Personalized jobs based on your preferences and activity
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/dashboard/profile">
                                <Button variant="outline" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    {!isMobile && "Preferences"}
                                </Button>
                            </Link>
                            <Button
                                onClick={() => regenerate()}
                                disabled={isRegenerating}
                                className="bg-brand-600 hover:bg-brand-700 text-white gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                {!isMobile && "Refresh"}
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    {recommendations.length > 0 && (
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="h-4 w-4 text-brand-600" />
                                <span>{recommendations.length} recommendations</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span>•</span>
                                <span>
                                    Avg match:{" "}
                                    {Math.round(
                                        recommendations.reduce((acc, r) => acc + r.score, 0) /
                                        recommendations.length *
                                        100
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {recommendations.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 max-w-2xl mx-auto">
                            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Recommendations Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Set your job preferences to get personalized recommendations
                            </p>
                            <Link href="/dashboard/profile">
                                <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Set Preferences
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Recommendations Grid */}
                {recommendations.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recommendations.map((rec, index) => (
                            <JobRecommendationCard
                                key={`${rec.job_id}-${rec.job_source}`}
                                recommendation={rec}
                                index={index}
                                onSave={handleSaveJob}
                                isSaved={isJobSaved(rec.job_id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {isMobile && <BottomNav />}
        </div>
    );
}
