// API Index - Lists all available API endpoints
// Access at /api to see all available endpoints

export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

  const apis = {
    seo: {
      description: "SEO & Web Statistics APIs (RapidAPI - 50 req/day, 24h cached)",
      endpoints: [
        {
          name: "Top Web Technologies",
          path: "/api/seo-tech",
          url: `${baseUrl}/api/seo-tech`,
          description: "Top technologies used on websites (PHP, MySQL, WordPress, etc.)",
          responseFields: ["rank", "tech[].name", "total_domains", "percent"],
        },
        {
          name: "Top Website Languages",
          path: "/api/seo-language",
          url: `${baseUrl}/api/seo-language`,
          description: "Most popular languages used on websites",
          responseFields: ["rank", "language", "total_domains", "percent"],
        },
        {
          name: "Top Hosting Providers",
          path: "/api/seo-hosting",
          url: `${baseUrl}/api/seo-hosting`,
          description: "Most popular web hosting providers/ISPs",
          responseFields: ["rank", "isps[].isp_name", "total_domains", "percent"],
        },
        {
          name: "Top Websites by Traffic",
          path: "/api/seo-websites",
          url: `${baseUrl}/api/seo-websites`,
          description: "Top 50 websites by traffic (Google, YouTube, Facebook, etc.)",
          responseFields: ["website", "domainName", "similarWebRanking", "type", "country"],
        },
        {
          name: "Top WordPress Themes",
          path: "/api/seo-themes",
          url: `${baseUrl}/api/seo-themes`,
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
