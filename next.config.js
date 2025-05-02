const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // API and data requests - use NetworkFirst to prioritize fresh data
    {
      urlPattern: /^https:\/\/ap-south-1\.cdn\.hygraph\.com\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "hygraph-api",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 10, // Fallback to cache if network takes more than 10 seconds
      },
    },
    {
      urlPattern: /^https:\/\/api-ap-south-1\.hygraph\.com\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "hygraph-api-content",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/api-sync\.vercel\.app\/api\/cricket\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "cricket-api",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 2, // 2 minutes
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Images - can use CacheFirst for better performance
    {
      urlPattern: /^https:\/\/media\.graphassets\.com\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "graphassets-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Hygraph CDN images
    {
      urlPattern: /^https:\/\/ap-south-1\.cdn\.hygraph\.com\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "hygraph-cdn-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Static resources
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
      },
    },
    // Images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    // Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Default handler for everything else
    {
      urlPattern: /.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "others",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image configuration with optimizations
  images: {
    domains: [
      "media.graphassets.com",
      "ap-south-1.graphassets.com",
      "png.pngtree.com",
      "e7.pngegg.com",
      "ap-south-1.cdn.hygraph.com", // Add Hygraph CDN domain
    ], // Allowed image domains
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // Increase cache time to 1 hour
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    loader: "default",
    path: "/_next/image",
    disableStaticImages: false,
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

  // Webpack configuration for audio files and optimizations
  webpack(config) {
    // Audio file handling
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

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Removed experimental features that were causing issues
};

module.exports = withPWA(nextConfig);
