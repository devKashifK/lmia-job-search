import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://jobmaze.ca'

    return [
        { url: `${baseUrl}/sitemap/trending.xml`, lastModified: new Date() },
        { url: `${baseUrl}/sitemap/lmia.xml`, lastModified: new Date() },
        { url: `${baseUrl}/sitemap/blog.xml`, lastModified: new Date() },
        { url: `${baseUrl}/sitemap/company-analysis.xml`, lastModified: new Date() },
        { url: `${baseUrl}/sitemap/noc-code-guide.xml`, lastModified: new Date() },
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/security`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/refund-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/careers`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/cookies`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/resources/documentation`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/resources/noc-codes`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/resources/wage-finder`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Solutions
        { url: `${baseUrl}/for-immigration-consultants`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/for-recruiters`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/what-is-lmia`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/lmia-employers-list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/lmia-processing-time`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        // Province Hubs
        { url: `${baseUrl}/lmia-jobs-ontario`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs-british-columbia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs-alberta`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs-saskatchewan`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs/manitoba`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs/new-brunswick`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs/nova-scotia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        // Industry Hubs
        { url: `${baseUrl}/lmia-jobs/agriculture`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/lmia-jobs/construction`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/lmia-jobs/hospitality`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/lmia-jobs-healthcare`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/lmia-jobs-trucking`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ];
}