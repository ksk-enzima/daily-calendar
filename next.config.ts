import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/app/calendar',
  // Ensure we can export if needed, or just standard run
  // assetPrefix might be needed if CDN is different, but for straightforward reverse proxy, just basePath is usually enough.
};

export default nextConfig;
