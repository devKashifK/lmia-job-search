import type { NextConfig } from "next";

const isMobile = process.env.MOBILE_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : undefined,
  images: {
    unoptimized: isMobile,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* 
  Static export does not support rewrites/redirects. 
  For mobile, handle these via client-side routing if necessary.
  */
  async rewrites() {
    if (isMobile) return [];
    return [
      // existing rewrites keep here...
    ];
  },
  async redirects() {
    if (isMobile) return [];
    return [
      // existing redirects keep here...
    ];
  }
};

export default nextConfig;
