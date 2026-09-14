import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for local images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
