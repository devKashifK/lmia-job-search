import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      /** TRENDING / HOT-LEADS SECTION **/
      // Capture sitemap links with ?value=...
      {
        source: '/trending-jobs/:title',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/hot-leads/:val?field=job_title&t=trending_job',
      },
      {
        source: '/trending-jobs-in/:state',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/hot-leads/:val?field=state&t=trending_job',
      },
      {
        source: '/trending-company/:name',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/hot-leads/:val?field=employer&t=trending_job',
      },
      {
        source: '/trending-category/:cat',
        destination: '/search/hot-leads/:cat?field=category&t=trending_job',
      },

      /** LMIA SECTION **/
      {
        source: '/lmia-jobs/:role',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/lmia/:val?field=job_title&t=lmia',
      },
      {
        source: '/lmia-jobs-in/:state',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/lmia/:val?field=state&t=lmia',
      },
      {
        source: '/lmia-company/:name',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/search/lmia/:val?field=employer_norm&t=lmia',
      },
      {
        source: '/lmia-category/:cat',
        destination: '/search/lmia/:cat?field=category&t=lmia',
      },

      /** ANALYSIS SECTION **/
      {
        source: '/analysis/:slug',
        has: [{ type: 'query', key: 'value', value: '(?<val>.*)' }],
        destination: '/analysis/:val',
      },
    ]
  }
};

export default nextConfig;
