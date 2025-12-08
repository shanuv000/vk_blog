// Next.js Serverless API route to proxy Top WP Themes API from RapidAPI
// Uses Upstash Redis for guaranteed 24-hour caching

import { setCorsHeaders } from "../../lib/cors";
import { withCache } from "../../lib/redis";

const CACHE_KEY = "seo:top-wordpress-themes";
// Cache expires at 5:00 AM IST daily

export default async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800");
    res.setHeader("X-SEO-API-Cache", "redis");

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
    console.error(`[SEO-Themes API] Error:`, error);

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
  const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/theme";
  console.log(`[SEO-Themes API] Fetching fresh data from RapidAPI`);

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
    { rank: 1, wp_themes: [{ id: "1", label: "Divi" }], total_domains: "381983", percent: "1.366%" },
    { rank: 2, wp_themes: [{ id: "2", label: "Astra" }], total_domains: "307788", percent: "1.101%" },
    { rank: 3, wp_themes: [{ id: "3", label: "Hello-Elementor" }], total_domains: "275175", percent: "0.984%" },
    { rank: 4, wp_themes: [{ id: "4", label: "Avada" }], total_domains: "147825", percent: "0.529%" },
    { rank: 5, wp_themes: [{ id: "5", label: "GeneratePress" }], total_domains: "100999", percent: "0.361%" },
    { rank: 6, wp_themes: [{ id: "6", label: "OceanWP" }], total_domains: "96121", percent: "0.344%" },
    { rank: 7, wp_themes: [{ id: "7", label: "Enfold" }], total_domains: "85792", percent: "0.307%" },
    { rank: 8, wp_themes: [{ id: "8", label: "Betheme" }], total_domains: "55000", percent: "0.197%" },
    { rank: 9, wp_themes: [{ id: "9", label: "flavaid theme flavaid theme" }], total_domains: "50000", percent: "0.179%" },
    { rank: 10, wp_themes: [{ id: "10", label: "flavor_theme flavaid theme" }], total_domains: "45000", percent: "0.161%" },
  ];
}
