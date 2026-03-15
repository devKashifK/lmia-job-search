import { NextResponse } from 'next/server';
import db from '@/db';

export const revalidate = 86400;

export async function GET() {
    const baseUrl = 'https://jobmaze.ca';

    try {
        // Use RPC to fetch all unique NOC codes from trending_job
        const { data, error } = await (db as any).rpc('get_trending_job_distinct_values', {
            p_column_name: 'noc_code'
        });

        if (error) throw error;

        const uniqueNocs = (data as any[] || [])
            .map(item => typeof item === 'object' ? Object.values(item)[0] : item)
            .filter(Boolean)
            .map(String);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueNocs.map(noc => `
  <url>
    <loc>${baseUrl}/trending-jobs?noc=${noc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

        return new NextResponse(xml, {
            headers: { 
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Sitemap Error (trending-noc-codes):', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
