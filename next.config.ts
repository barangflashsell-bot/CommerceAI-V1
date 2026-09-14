import type { NextConfig } from "next";

// Ensure DATABASE_URL is defined during build time on Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@ep-placeholder.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
}

const nextConfig: NextConfig = {
  // Enable image optimization for external images
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
