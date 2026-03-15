import { NextResponse } from 'next/server';
import db from '@/db';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  const baseUrl = 'https://jobmaze.ca';

  try {
    // Use RPC to fetch all unique job titles from trending_job
    const { data, error } = await (db as any).rpc('get_trending_job_distinct_values', {
      p_column_name: 'job_title'
    });



    if (error) throw error;

    // data might be string[] or Record<string, any>[] depending on RPC definition
    const uniqueRoles = (data as any[] || [])
      .map(item => typeof item === 'object' ? Object.values(item)[0] : item)
      .filter(Boolean)
      .map(String)
      .slice(0, 10000); // Safety limit for stability (Max 10k to prevent hang)


    const toSlug = (text: any) => {
      if (!text || typeof text !== 'string') return '';
      return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueRoles.map(role => `
  <url>
    <loc>${baseUrl}/trending-jobs/${toSlug(role)}?value=${encodeURIComponent(role)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Sitemap Error (trending-roles):', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}