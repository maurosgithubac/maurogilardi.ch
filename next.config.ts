import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/goenner", destination: "/sponsoring", permanent: true }];
  },
  async headers() {
    return [
      {
        // Local brand assets change only on deploy — long browser/CDN cache.
        source: "/brand-assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384, 640],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days — most assets change only on deploy
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
