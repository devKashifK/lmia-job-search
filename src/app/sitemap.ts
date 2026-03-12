import { MetadataRoute } from 'next';
import { getAllNocSummaries } from '@/lib/noc-service';

const BASE_URL = 'https://jobmaze.ca';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // ─── Static Public Pages ───────────────────────────────────────────────────
    const staticRoutes: MetadataRoute.Sitemap = [
        // Core
        { url: `${BASE_URL}/`,                         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${BASE_URL}/about`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/pricing`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/contact`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/careers`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

        // Auth
        { url: `${BASE_URL}/sign-in`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
        { url: `${BASE_URL}/sign-up`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.7 },

        // Search & Resources
        { url: `${BASE_URL}/search`,                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
        { url: `${BASE_URL}/resources/documentation`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/resources/noc-codes`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/blog`,                     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },

        // Legal
        { url: `${BASE_URL}/terms`,                    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${BASE_URL}/privacy`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${BASE_URL}/security`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${BASE_URL}/cookies`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${BASE_URL}/refund-policy`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },

        // HTML Sitemap (for humans)
        { url: `${BASE_URL}/site-map`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    ];

    // ─── Dynamic: NOC Code Profile Pages ──────────────────────────────────────
    // e.g. /resources/noc-codes/12345
    let nocRoutes: MetadataRoute.Sitemap = [];
    try {
        const nocSummaries = await getAllNocSummaries();
        nocRoutes = nocSummaries.map(({ code }) => ({
            url: `${BASE_URL}/resources/noc-codes/${code}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (err) {
        console.error('[sitemap] Failed to load NOC summaries:', err);
    }

    return [...staticRoutes, ...nocRoutes];
}
