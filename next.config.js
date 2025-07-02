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

  // Enhanced security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Enhanced Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "https://www.googletagmanager.com",
              "https://www.google-analytics.com",
              "https://platform.twitter.com",
              "https://connect.facebook.net",
              "https://www.clarity.ms",
              "style-src 'self' 'unsafe-inline'",
              "https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "https://media.graphassets.com",
              "https://ap-south-1.cdn.hygraph.com",
              "https://via.placeholder.com",
              "https://images.unsplash.com",
              "https://res.cloudinary.com",
              "frame-src 'self'",
              "https://www.youtube-nocookie.com",
              "https://www.youtube.com",
              "https://platform.twitter.com",
              "https://syndication.twitter.com",
              "https://www.facebook.com",
              "https://web.facebook.com",
              "https://www.instagram.com",
              "https://instagram.com",
              "connect-src 'self'",
              "https://ap-south-1.cdn.hygraph.com",
              "https://api-ap-south-1.hygraph.com",
              "https://www.google-analytics.com",
              "https://www.googletagmanager.com",
              "https://syndication.twitter.com",
              "https://api.twitter.com",
              "https://graph.facebook.com",
              "font-src 'self'",
              "https://fonts.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join(" "),
          },
          // Additional security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS for production
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
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
      // This rewrite maintains backward compatibility for the sitemap-news.xml
      // It allows search engines to continue accessing the sitemap at the original URL
      // while the content is dynamically generated by our API route
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

  // Enhanced Webpack configuration for performance
  webpack(config, { dev, isServer }) {
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

    // Bundle analyzer for production builds (optional)
    if (!dev && !isServer && process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: "../bundle-analyzer-report.html",
        })
      );
    }

    // Optimize chunks for better caching
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Enhanced performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
    // Remove data-testid attributes in production
    removeReactProperties: process.env.NODE_ENV === "production",
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Enable experimental features for better performance
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Optimize server components
    serverComponentsExternalPackages: ["sharp"],
    // Enable gzip compression
    gzipSize: true,
  },

  // Output configuration for better caching
  generateEtags: true,
  poweredByHeader: false,
};

module.exports = withPWA(nextConfig);
