import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'statics.basalam.com',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
