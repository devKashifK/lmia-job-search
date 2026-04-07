import { NextResponse } from 'next/server';
import { getServerClient } from '@/app/(unauthenticated)/blog/serverClient';
import { GET_ALL_POST_SLUGS } from '@/app/(unauthenticated)/blog/queries';
import { PostsData } from '@/app/(unauthenticated)/blog/types';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  const baseUrl = 'https://jobmaze.ca';

  try {
    const client = getServerClient();
    const { data } = await client.query<PostsData>({
      query: GET_ALL_POST_SLUGS,
      variables: { first: 100 }
    });

    const posts = data?.posts?.nodes || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.modified || new Date()).toISOString()}</lastmod>
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
    console.error('Sitemap Error (blog.xml):', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
