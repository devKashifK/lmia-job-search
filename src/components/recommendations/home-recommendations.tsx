'use client';

import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useRecentActivity } from '@/hooks/use-recent-activity';
import { RecommendationsWidget } from '@/components/dashboard/recommendations-widget';
import { motion } from 'framer-motion';

export function HomeRecommendations() {
    const { preferences } = useUserPreferences();
    // Fetch just 1 item to check if activity exists efficiently
    const { data: recentActivity, isLoading: isLoadingActivity } = useRecentActivity(1);

    // 1. Check Preferences
    const hasSetPreferences =
        preferences?.preferred_job_titles?.length > 0 ||
        preferences?.preferred_provinces?.length > 0 ||
        preferences?.preferred_cities?.length > 0 ||
        preferences?.preferred_industries?.length > 0 ||
        preferences?.preferred_noc_codes?.length > 0 ||
        preferences?.preferred_teer_categories?.length > 0;

    // 2. Check Activity (Saved Jobs or Recent Searches)
    const hasActivity = recentActivity && recentActivity.length > 0;

    // Loading state: strictly don't show to avoid flickering "Set Preferences"
    if (isLoadingActivity) return null;

    // Logic: Show ONLY if (Preferences Set OR Has Activity)
    if (!hasSetPreferences && !hasActivity) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-5xl mx-auto mt-6 mb-12 relative z-10 px-4 md:px-0"
        >
            <div className="bg-white/80 backdrop-blur-md border border-brand-100 rounded-3xl p-6 shadow-sm">
                <RecommendationsWidget />
            </div>
        </motion.section>
    );
}
