import { useQuery } from '@tanstack/react-query';
import { getLiveFeedData, type LiveFeedData, type FeedItem, type HeroStats, type FeaturedEmployer, type PredictiveTrend } from '@/lib/api/analytics';

export type { FeedItem, HeroStats, FeaturedEmployer, PredictiveTrend };

export function useLiveFeed() {
    return useQuery<LiveFeedData>({
        queryKey: ['live-feed-full'],
        queryFn: async () => {
            return await getLiveFeedData();
        },
        staleTime: 1000 * 60 * 5,
    });
}
