import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false, // Enable image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.backblazeb2.com', // Allow any backblaze subdomain
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.backblazeb2.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // For API routes in App Router, we handle body parsing in the route itself
  // Size limits for API routes in App Router are managed per-route
};

export default nextConfig;
