// Next.js Serverless API route to proxy SEO Tech API from RapidAPI
// Uses Upstash Redis for guaranteed 24-hour caching

import { setCorsHeaders } from "../../lib/cors";
import { withCache } from "../../lib/redis";

const CACHE_KEY = "seo:top-web-technologies";
// Cache expires at 5:00 AM IST daily

export default async function handler(req, res) {
  // Handle CORS preflight
  if (setCorsHeaders(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Set cache headers for CDN layer
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800");
    res.setHeader("X-SEO-API-Cache", "redis");

    // Use Redis cache wrapper
    const { data, source } = await withCache(CACHE_KEY, fetchFromRapidAPI);

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        cachedAt: new Date().toISOString(),
        cacheMaxAge: "5:00 AM IST",
        source: source,
      },
    });
  } catch (error) {
    console.error(`[SEO-Tech API] Error:`, error);

    return res.status(200).json({
      success: false,
      error: error.message || "Unknown error",
      data: getFallbackData(),
      meta: {
        cachedAt: new Date().toISOString(),
        isFallback: true,
        source: "fallback",
      },
    });
  }
}

async function fetchFromRapidAPI() {
  const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/tech";
  console.log(`[SEO-Tech API] Fetching fresh data from RapidAPI`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "seo-api2.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "df5446d358msh92435ea35de93f9p11eea2jsn5142275af42e",
      "Accept": "application/json",
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`);
  }

  return response.json();
}

function getFallbackData() {
  return [
    { rank: 1, tech: [{ id: "1656", name: "PHP" }], total_domains: "14064015", percent: "50.31%" },
    { rank: 2, tech: [{ id: "1595", name: "MySQL" }], total_domains: "9729930", percent: "34.8%" },
    { rank: 3, tech: [{ id: "1", name: "WordPress" }], total_domains: "9163105", percent: "32.78%" },
    { rank: 4, tech: [{ id: "1072", name: "Apache HTTP Server" }], total_domains: "8326179", percent: "29.78%" },
    { rank: 5, tech: [{ id: "1611", name: "Nginx" }], total_domains: "7170492", percent: "25.65%" },
    { rank: 6, tech: [{ id: "1174", name: "Cloudflare" }], total_domains: "5009136", percent: "17.92%" },
    { rank: 7, tech: [{ id: "1255", name: "Elementor" }], total_domains: "2286362", percent: "8.178%" },
    { rank: 8, tech: [{ id: "1997", name: "WooCommerce" }], total_domains: "1989940", percent: "7.118%" },
    { rank: 9, tech: [{ id: "1498", name: "LiteSpeed" }], total_domains: "1795063", percent: "6.421%" },
    { rank: 10, tech: [{ id: "3607", name: "Google Hosted Libraries" }], total_domains: "1681800", percent: "6.016%" },
  ];
}

