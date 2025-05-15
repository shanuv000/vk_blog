const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Local placeholder images caching rule
    {
      urlPattern: /\/images\/placeholder-.*\.jpg$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "local-placeholder-images",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year (these are static files)
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // API and data requests - use NetworkFirst to prioritize fresh data
    {
      urlPattern: /^https:\/\/ap-south-1\.cdn\.hygraph\.com\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "hygraph-api",
        expiration: {
          maxEntries: 100, // Increased from 50
          maxAgeSeconds: 60 * 15, // 15 minutes (increased from 5)
        },
        networkTimeoutSeconds: 10, // Fallback to cache if network takes more than 10 seconds
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/api-ap-south-1\.hygraph\.com\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "hygraph-api-content",
        expiration: {
          maxEntries: 100, // Increased from 50
          maxAgeSeconds: 60 * 15, // 15 minutes (increased from 5)
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // API proxy route - use StaleWhileRevalidate for better performance
    {
      urlPattern: /\/api\/hygraph-proxy/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "hygraph-proxy-api",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 30, // 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Default image API - use CacheFirst for better performance
    {
      urlPattern: /\/api\/default-image/,
      handler: "CacheFirst",
      options: {
        cacheName: "default-images-api",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year (these are static redirects)
        },
        cacheableResponse: {
          statuses: [0, 200, 302, 307], // Include redirect status codes
        },
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
    // Images - use CacheFirst for better performance
    {
      urlPattern: /^https:\/\/media\.graphassets\.com\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "graphassets-images",
        expiration: {
          maxEntries: 200, // Increased from 100
          maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days (increased from 30)
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        matchOptions: {
          ignoreSearch: true, // Ignore query parameters for better cache hits
        },
      },
    },
    // Hygraph CDN images
    {
      urlPattern:
        /^https:\/\/ap-south-1\.cdn\.hygraph\.com\/.*\.(png|jpg|jpeg|webp|gif|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "hygraph-cdn-images",
        expiration: {
          maxEntries: 200, // Increased from 100
          maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days (increased from 30)
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        matchOptions: {
          ignoreSearch: true, // Ignore query parameters for better cache hits
        },
      },
    },
    // Static resources
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 200, // Increased from 100
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days (increased from 7)
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        matchOptions: {
          ignoreSearch: true, // Ignore query parameters for better cache hits
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
          maxEntries: 30, // Increased from 20
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Cache API routes
    {
      urlPattern: /\/api\/(?!revalidate|webhook).*/i, // Cache all API routes except revalidate and webhook
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
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
          maxEntries: 100, // Increased from 50
          maxAgeSeconds: 60 * 60 * 4, // 4 hours (increased from 1)
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Add headers to allow YouTube embeds
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com;",
          },
        ],
      },
    ];
  },

  // Image configuration with optimizations
  images: {
    domains: [
      "media.graphassets.com",
      "ap-south-1.graphassets.com",
      "png.pngtree.com",
      "e7.pngegg.com",
      "ap-south-1.cdn.hygraph.com", // Add Hygraph CDN domain
      "via.placeholder.com", // Add placeholder.com for fallback images
      "media.graphcms.com", // Add GraphCMS domain (old name for Hygraph)
      "media.hygraph.com", // Add Hygraph media domain
      "images.unsplash.com", // Add Unsplash for stock images
      "res.cloudinary.com", // Add Cloudinary for image hosting
    ], // Allowed image domains
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 172800, // Increase cache time to 48 hours for better performance
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    loader: "default",
    path: "/_next/image",
    disableStaticImages: false,
    // Enable remote patterns for more flexible image sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.hygraph.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.graphassets.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.graphcms.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
    // Enable image optimization in production
    // This will help with image loading and performance
    unoptimized: false,
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
        destination: "/api/sitemap",
      },
      {
        source: "/sitemap-news.xml",
        destination: "/api/sitemap-news",
      },
      {
        source: "/blog",
        destination: "/",
      },
    ];
  },

  // Redirects configuration for SEO
  async redirects() {
    return [
      // Redirect trailing slashes
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
      // Redirect lowercase URLs
      {
        source: "/:path*/[A-Z]:rest*",
        destination: "/:path*/:rest*",
        permanent: true,
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
