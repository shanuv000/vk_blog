/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
};
