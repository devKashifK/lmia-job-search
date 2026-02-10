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
                        <p className="text-gray-600 mb-4">
                            Set your preferences to get personalized job recommendations
                        </p>
                        <Link href="/dashboard/profile">
                            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                                Set Preferences
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-brand-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recommended for You
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="text-gray-600 hover:text-brand-600 h-8"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Link href="/recommendations">
                            <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 h-8">
                                View All
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {topRecommendations.map((rec, index) => (
                        <JobRecommendationCard
                            key={`${rec.job_id}-${rec.job_source}`}
                            recommendation={rec}
                            index={index}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

