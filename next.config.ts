import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Image configuration
  images: {
    domains: ["media.graphassets.com"], // Hygraph's image domain
    formats: ['image/avif', 'image/webp'],
  },
  
  // Rewrites configuration
  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/robots.txt",
      },
      {
        source: "/sitemap.xml",
        destination: "/sitemap.xml",
      },
    ];
  },
  
  // Webpack configuration for audio files
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
    });

    return config;
  },
  
  // Next.js 15 optimizations
  swcMinify: true,
  
  // Caching configuration
  experimental: {
    // Set staleTime for dynamic routes to match Next.js 15 defaults
    staleTimes: {
      dynamic: 0,
    },
    // Optimize bundling of external packages
    bundlePagesRouterDependencies: true,
  },
};

export default nextConfig;
