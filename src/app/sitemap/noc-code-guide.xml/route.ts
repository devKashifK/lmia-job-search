import { NextResponse } from 'next/server';
import db from '@/db';

export const revalidate = 86400;

export async function GET() {
    const baseUrl = 'https://jobmaze.ca';

    try {
        // Fetch unique NOC codes from both tables using RPCs
        const [{ data: trendingNocs }, { data: lmiaNocs }] = await Promise.all([
            (db as any).rpc('get_trending_job_distinct_values', { p_column_name: 'noc_code' }),
            (db as any).rpc('get_lmia_table_distinct_values', { p_column_name: 'noc_code' })
        ]);

        const formatData = (d: any) => (d as any[] || [])
            .map(item => typeof item === 'object' ? Object.values(item)[0] : item)
            .filter(Boolean)
            .map(String);

        const allNocs = new Set([
            ...formatData(trendingNocs),
            ...formatData(lmiaNocs)
        ]);

        const uniqueNocs = Array.from(allNocs).filter(Boolean);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueNocs.map(noc => `
  <url>
    <loc>${baseUrl}/resources/noc-codes/${noc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Sitemap Error (noc-code-guide):', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
