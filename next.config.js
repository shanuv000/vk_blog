// Removed PWA configuration for better performance

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add headers to allow social media embeds
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // Frame/embed sources
              "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com https://twitter.com https://x.com https://www.facebook.com https://web.facebook.com https://www.instagram.com https://instagram.com https://urtechy-35294.firebaseapp.com https://docs.google.com;",
              // Scripts - Added Google Analytics, Clarity, Firebase, Google APIs, Cloudflare
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://connect.facebook.net https://www.instagram.com https://instagram.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://apis.google.com https://static.cloudflareinsights.com;",
              // Images - CRITICAL: Allow images from Hygraph and other CDNs
              "img-src 'self' data: https: blob: https://*.graphassets.com https://*.hygraph.com https://*.graphcms.com https://pbs.twimg.com https://video.twimg.com https://www.google-analytics.com;",
              // XHR/fetch targets - Added Sentry, Firebase, Google Analytics, Clarity, Hygraph APIs
              "connect-src 'self' https://syndication.twitter.com https://api.twitter.com https://graph.facebook.com https://www.instagram.com https://instagram.com https://firebase.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://api-ap-south-1.hygraph.com https://ap-south-1.cdn.hygraph.com https://*.hygraph.com https://*.graphassets.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://vitals.vercel-insights.com https://docs.google.com https://*.googleusercontent.com;",
            ].join(" "),
          },
        ],
      },
    ];
  },

  // Enhanced image configuration with advanced optimizations
  images: {
    // Modern image formats with priority order (AVIF first for best compression)
    formats: ["image/avif", "image/webp"],

    // Optimized device sizes for responsive images
    deviceSizes: [
      640, // Mobile portrait
      750, // Mobile landscape / small tablet
      828, // iPhone X/11/12/13 Pro Max
      1080, // Small desktop / large tablet
      1200, // Medium desktop
      1440, // Large desktop
      1920, // Full HD
      2048, // 2K displays
      3840, // 4K displays
    ],

    // Optimized image sizes for different use cases
    imageSizes: [
      16, // Small icons
      32, // Medium icons
      48, // Large icons
      64, // Avatar small
      96, // Avatar medium
      128, // Avatar large
      256, // Thumbnails
      384, // Small images
      512, // Medium images
      768, // Large images
    ],

    // Extended cache time for better performance (7 days)
    minimumCacheTTL: 604800,

    // Security settings for SVG handling
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Image optimization settings
    loader: "default",
    path: "/_next/image",
    disableStaticImages: false,

    // Enhanced remote patterns for flexible image sources
    remotePatterns: [
      // Hygraph/GraphCMS patterns
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

      // CDN and image service patterns
      {
        protocol: "https",
        hostname: "**.cdn.hygraph.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ap-south-1.cdn.hygraph.com",
        pathname: "**",
      },

      // External image services
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "**",
      },

      // Cloud storage services
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "**",
      },

      // Additional image sources
      {
        protocol: "https",
        hostname: "png.pngtree.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "e7.pngegg.com",
        pathname: "**",
      },
      // Twitter media CDNs
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "video.twimg.com",
        pathname: "**",
      },
      // Cricbuzz CDN for team icons
      {
        protocol: "https",
        hostname: "static.cricbuzz.com",
        pathname: "**",
      },
    ],

    // Enable image optimization in production
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

  // Webpack configuration for audio files and optimizations
  webpack(config, { isServer }) {
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

    // Production optimizations
    if (!isServer) {
      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for react and react-dom
            framework: {
              name: "framework",
              chunks: "all",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Commons chunk for shared code
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            // Separate chunk for large libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace("@", "")}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

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
    // Remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Output configuration for better caching
  output: "standalone",

  // Experimental features for better performance
  experimental: {
    scrollRestoration: true,
    // Optimize package imports
    optimizePackageImports: [
      "react-icons",
      "lucide-react",
      "@fortawesome/react-fontawesome",
    ],
    // optimizeCss: true, // Disabled - requires critters package
  },

  // Removed experimental features that were causing issues
};


module.exports = withBundleAnalyzer(nextConfig);

