"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJobRecommendations } from "@/hooks/use-job-recommendations";
import { JobRecommendationCard } from "@/components/recommendations/job-recommendation-card";
import { invalidateRecommendationCache } from "@/utils/recommendation-engine";
import { useSession } from "@/hooks/use-session";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

/**
 * Dashboard widget showing top 5 recommendations
 * To be integrated into the main dashboard page
 */
export function RecommendationsWidget() {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const { recommendations, isLoading } = useJobRecommendations();
    const { preferences } = useUserPreferences();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Show top 5
    const topRecommendations = recommendations.slice(0, 5);

    const handleRefresh = async () => {
        if (!session?.user?.id) return;

        setIsRefreshing(true);
        try {
            // Invalidate cache in database
            await invalidateRecommendationCache(session.user.id);

            // Invalidate react-query cache to trigger refetch
            await queryClient.invalidateQueries({ queryKey: ['job-recommendations'] });
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-6 w-6 text-brand-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recommended for You
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-32 bg-gray-100 animate-pulse rounded-lg"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (topRecommendations.length === 0) {
        // Check if user has ANY preferences set
        const hasSetPreferences =
            preferences?.preferred_job_titles?.length > 0 ||
            preferences?.preferred_provinces?.length > 0 ||
            preferences?.preferred_cities?.length > 0 ||
            preferences?.preferred_industries?.length > 0 ||
            preferences?.preferred_noc_codes?.length > 0;

        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-6 w-6 text-brand-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recommended for You
                        </h2>
                    </div>
                    <div className="text-center py-8">
                        {hasSetPreferences ? (
                            <>
                                <p className="text-gray-600 mb-4">
                                    We couldn't find any new jobs matching your specific preferences right now.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Try broadening your filters or checking back later.
                                </p>
                                <Link href="/dashboard/profile">
                                    <Button variant="outline" className="text-brand-600 border-brand-200 hover:bg-brand-50">
                                        Update Preferences
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-4">
                                    Set your preferences to get personalized job recommendations
                                </p>
                                <Link href="/dashboard/profile">
                                    <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                                        Set Preferences
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-100 rounded-lg">
                        <Sparkles className="h-4 w-4 text-brand-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-none">
                            Recommended for You
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Based on your profile & search history
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-8 w-8 text-gray-400 hover:text-brand-600"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/recommendations">
                        <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 h-8 text-xs font-medium px-2">
                            View All
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative group">
                {/* Gradient Fade for scroll indication */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:block hidden" />

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x snap-mandatory scrollbar-hide">
                    {topRecommendations.map((rec, index) => (
                        <div key={`${rec.job_id}-${rec.job_source}`} className="snap-start shrink-0 w-[280px] md:w-[320px]">
                            <JobRecommendationCard
                                recommendation={rec}
                                index={index}
                                variant="compact"
                            />
                        </div>
                    ))}

                    {/* "View More" Card at the end */}
                    <Link href="/recommendations" className="snap-start shrink-0 w-[100px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer group/more">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover/more:bg-white flex items-center justify-center mb-2 shadow-sm">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover/more:text-brand-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 group-hover/more:text-brand-600">View All</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

