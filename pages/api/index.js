// API Index - Lists all available API endpoints
// Access at /api to see all available endpoints

import { setCorsHeaders } from "../../lib/cors";

export default function handler(req, res) {
  // Handle CORS preflight
  if (setCorsHeaders(req, res)) return;

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

  const apis = {
    seo: {
      description: "SEO & Web Statistics APIs (RapidAPI - 50 req/day, 24h cached)",
      endpoints: [
        {
          name: "Top Web Technologies",
          path: "/api/top-web-technologies",
          url: `${baseUrl}/api/top-web-technologies`,
          description: "Top technologies used on websites (PHP, MySQL, WordPress, etc.)",
          responseFields: ["rank", "tech[].name", "total_domains", "percent"],
        },
        {
          name: "Top Website Languages",
          path: "/api/top-website-languages",
          url: `${baseUrl}/api/top-website-languages`,
          description: "Most popular languages used on websites",
          responseFields: ["rank", "language", "total_domains", "percent"],
        },
        {
          name: "Top Hosting Providers",
          path: "/api/top-hosting-providers",
          url: `${baseUrl}/api/top-hosting-providers`,
          description: "Most popular web hosting providers/ISPs",
          responseFields: ["rank", "isps[].isp_name", "total_domains", "percent"],
        },
        {
          name: "Top Websites by Traffic",
          path: "/api/top-websites-traffic",
          url: `${baseUrl}/api/top-websites-traffic`,
          description: "Top 50 websites by traffic (Google, YouTube, Facebook, etc.)",
          responseFields: ["website", "domainName", "similarWebRanking", "type", "country"],
        },
        {
          name: "Top WordPress Themes",
          path: "/api/top-wordpress-themes",
          url: `${baseUrl}/api/top-wordpress-themes`,
          description: "Most popular WordPress themes",
          responseFields: ["rank", "wp_themes[].label", "total_domains", "percent"],
        },
      ],
    },
    cricket: {
      description: "Live Cricket Scores & Schedule",
      endpoints: [
        {
          name: "Cricket Proxy",
          path: "/api/cricket-proxy",
          description: "Proxies cricket data (schedule, live-scores, recent-scores, upcoming-matches)",
          queryParams: ["endpoint"],
        },
      ],
    },
    utilities: {
      description: "Utility APIs",
      endpoints: [
        { name: "Health Check", path: "/api/health" },
        { name: "TinyURL", path: "/api/tinyurl" },
        { name: "Sitemap Generator", path: "/api/generate-sitemap" },
      ],
    },
    integrations: {
      description: "Third-party Integrations",
      endpoints: [
        { name: "Hygraph Proxy", path: "/api/hygraph-proxy" },
        { name: "Firebase Proxy", path: "/api/firebase-proxy" },
        { name: "Telegram Notify", path: "/api/telegram-notify" },
      ],
    },
  };

  return res.status(200).json({
    message: "🚀 urTechy Blog API Directory",
    version: "1.0.0",
    documentation: "https://blog.urtechy.com/api",
    apis,
    meta: {
      generatedAt: new Date().toISOString(),
      totalEndpoints: Object.values(apis).reduce(
        (acc, cat) => acc + cat.endpoints.length, 0
      ),
    },
  });
}
