/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image configuration
  images: {
    domains: ["media.graphassets.com", "ap-south-1.graphassets.com"], // Hygraph's image domains
    formats: ["image/avif", "image/webp"],
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

  // Enable SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
