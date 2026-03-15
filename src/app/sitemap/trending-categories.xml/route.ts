import { NextResponse } from 'next/server';
import db from '@/db';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    const baseUrl = 'https://jobmaze.ca';

    try {
        const { data, error } = await (db as any).rpc('get_trending_job_distinct_values', {
            p_column_name: 'category'
        });

        if (error) throw error;

        const categories = (data as any[] || [])
            .map(item => typeof item === 'object' ? Object.values(item)[0] : item)
            .filter(Boolean)
            .map(String);

        const toSlug = (text: any) => {
            if (!text || typeof text !== 'string') return '';
            return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        };

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/trending-category/${toSlug(cat)}?value=${encodeURIComponent(cat)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;

        return new NextResponse(xml, {
            headers: { 
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Sitemap Error (trending-categories):', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
