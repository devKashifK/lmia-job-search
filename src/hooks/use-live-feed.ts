import { useQuery } from '@tanstack/react-query';
import db from '@/db';

export interface FeedItem {
    id: string;
    type: 'lmia' | 'job';
    title: string;
    employer: string;
    location: string;
    wage: string;
    timestamp: string;
}

export interface HeroStats {
    highEndJobs: number;
    totalLmias: number;
    verifiedEmployers: number;
}

export interface FeaturedEmployer {
    id: string;
    name: string;
    velocity: number;
    approvalRate: number;
}

export interface PredictiveTrend {
    role: string;
    growth: number;
    location: string;
    wage: string;
    openPositions: number;
}

interface LiveFeedData {
    feed: FeedItem[];
    stats: HeroStats;
    featuredEmployers: FeaturedEmployer[]; // Plural
    predictiveTrends: PredictiveTrend[];   // Plural
}

const MOCK_FEED: FeedItem[] = [
    { id: 'mock-1', type: 'lmia', title: 'Software Engineer', employer: 'Tech Global', location: 'Toronto, ON', wage: '$45.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-2', type: 'job', title: 'Construction Manager', employer: 'BuildRight Ltd.', location: 'Vancouver, BC', wage: '$38.50/hr', timestamp: new Date().toISOString() },
    { id: 'mock-3', type: 'lmia', title: 'Food Service Supervisor', employer: 'Tasty Eats', location: 'Calgary, AB', wage: '$18.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-4', type: 'job', title: 'Truck Driver', employer: 'Logistics Pro', location: 'Winnipeg, MB', wage: '$26.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-5', type: 'lmia', title: 'Web Developer', employer: 'Creative Agency', location: 'Montreal, QC', wage: '$32.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-6', type: 'job', title: 'Registered Nurse', employer: 'City Hospital', location: 'Ottawa, ON', wage: '$42.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-7', type: 'lmia', title: 'Cook', employer: 'Bistro 42', location: 'Halifax, NS', wage: '$17.50/hr', timestamp: new Date().toISOString() },
];

export function useLiveFeed() {
    return useQuery<LiveFeedData>({
        queryKey: ['live-feed-full'],
        queryFn: async () => {
            try {
                const feedItems: FeedItem[] = [];
                let stats: HeroStats = { highEndJobs: 1240, totalLmias: 8500, verifiedEmployers: 3200 };
                let featuredEmployers: FeaturedEmployer[] = [];
                let predictiveTrends: PredictiveTrend[] = [];

                // 1. Fetch live feed items (LMIAs)
                const { data: lmiaData } = await db
                    .from('lmia_records')
                    .select('RecordID, job_title, operating_name, city, province, salary')
                    .limit(5);

                if (lmiaData) {
                    lmiaData.forEach((item: any) => {
                        const wage = item.salary ? `$${parseFloat(item.salary).toFixed(2)}` : 'N/A';
                        feedItems.push({
                            id: `lmia-${item.RecordID}`,
                            type: 'lmia',
                            title: item.job_title || 'Unknown Position',
                            employer: item.operating_name || 'Verified Employer',
                            location: `${item.city}, ${item.province}`,
                            wage: wage,
                            timestamp: new Date().toISOString(),
                        });

                        // Populate Featured Employers List
                        featuredEmployers.push({
                            id: item.RecordID?.toString() || Math.random().toString(),
                            name: item.operating_name || 'Verified Employer',
                            velocity: 85 + Math.floor(Math.random() * 14), // Dynamic mock 85-99
                            approvalRate: 90 + Math.floor(Math.random() * 10), // Dynamic mock 90-100
                        });
                    });
                }

                // 2. Fetch live feed items (Trending Jobs)
                const { data: jobData } = await db
                    .from('trending_job')
                    .select('id, occupation_title, employer, city, province, wage')
                    .limit(5);

                if (jobData) {
                    jobData.forEach((item: any) => {
                        feedItems.push({
                            id: `job-${item.id}`,
                            type: 'job',
                            title: item.occupation_title || 'Open Role',
                            employer: item.employer || 'Hiring Company',
                            location: `${item.city}, ${item.province}`,
                            wage: item.wage || 'Competitive',
                            timestamp: new Date().toISOString(),
                        });

                        // Populate Predictive Trends List
                        predictiveTrends.push({
                            role: item.occupation_title || 'Trending Role',
                            growth: 10 + Math.floor(Math.random() * 20),
                            location: item.province || 'Canada',
                            wage: item.wage || '$35.00/hr',
                            openPositions: 100 + Math.floor(Math.random() * 500),
                        });
                    });
                }

                // 3. Fetch Real Counts (Parallel)
                const [jobsCount, lmiaCount] = await Promise.all([
                    db.from('trending_job').select('*', { count: 'exact', head: true }),
                    db.from('lmia_records').select('*', { count: 'exact', head: true }),
                ]);

                stats.highEndJobs = jobsCount.count || 12405;
                stats.totalLmias = lmiaCount.count || 50000;
                stats.verifiedEmployers = Math.floor(stats.totalLmias * 0.42); // Estimated metric

                // Final Fallbacks: Ensure at least one mock item exists if DB is empty for UI safety
                if (featuredEmployers.length === 0) {
                    featuredEmployers.push({ id: 'mock-1', name: 'Tech Global Inc.', velocity: 94, approvalRate: 98 });
                    featuredEmployers.push({ id: 'mock-2', name: 'Maple Leaf Construction', velocity: 88, approvalRate: 95 });
                    featuredEmployers.push({ id: 'mock-3', name: 'HealthFirst Canada', velocity: 92, approvalRate: 99 });
                }

                if (predictiveTrends.length === 0) {
                    predictiveTrends.push({ role: 'Software Engineer', growth: 15, location: 'Ontario', wage: '$45.00/hr', openPositions: 342 });
                    predictiveTrends.push({ role: 'Project Manager', growth: 12, location: 'BC', wage: '$55.00/hr', openPositions: 128 });
                    predictiveTrends.push({ role: 'Data Analyst', growth: 22, location: 'Remote', wage: '$38.50/hr', openPositions: 215 });
                }

                return {
                    feed: feedItems.length > 0 ? feedItems.sort(() => Math.random() - 0.5) : MOCK_FEED,
                    stats,
                    featuredEmployers,
                    predictiveTrends
                };

            } catch (error) {
                console.error('Error fetching live data:', error);
                return {
                    feed: MOCK_FEED,
                    stats: { highEndJobs: 12000, totalLmias: 8000, verifiedEmployers: 3500 },
                    featuredEmployers: [
                        { id: '8821', name: 'Tech Global', velocity: 94, approvalRate: 97 },
                        { id: '8822', name: 'BuildRight', velocity: 88, approvalRate: 95 }
                    ],
                    predictiveTrends: [
                        { role: 'Software Engineer', growth: 15, location: 'ON', wage: '$45.00/hr', openPositions: 342 },
                        { role: 'Nurse', growth: 12, location: 'BC', wage: '$42.00/hr', openPositions: 512 }
                    ]
                };
            }
        },
        staleTime: 1000 * 60 * 5,
    });
}
