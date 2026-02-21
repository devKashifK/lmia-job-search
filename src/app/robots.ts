import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/dashboard/',
                '/admin/',
                '/_next/',
                '/checkout/',
                '/payment/',
            ],
        },
        sitemap: 'https://jobmaze.ca/sitemap.xml',
    };
}
