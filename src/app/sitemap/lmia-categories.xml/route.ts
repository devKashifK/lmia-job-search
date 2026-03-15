import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = 'https://jobmaze.ca';

    // Categories are typically derived from the first digit of NOC codes
    const categories = Array.from({ length: 10 }, (_, i) => i.toString());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/lmia-jobs?category=${cat}</loc>
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
}
