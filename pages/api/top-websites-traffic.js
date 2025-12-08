// Next.js Serverless API route to proxy Top Websites API from RapidAPI
// Uses Upstash Redis for guaranteed 24-hour caching

import { setCorsHeaders } from "../../lib/cors";
import { withCache } from "../../lib/redis";

const CACHE_KEY = "seo:top-websites-traffic";
const CACHE_TTL = 86400; // 24 hours

export default async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800");
    res.setHeader("X-SEO-API-Cache", "redis");

    const { data, source } = await withCache(CACHE_KEY, fetchFromRapidAPI, CACHE_TTL);

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        cachedAt: new Date().toISOString(),
        cacheMaxAge: CACHE_TTL,
        source: source,
      },
    });
  } catch (error) {
    console.error(`[SEO-Websites API] Error:`, error);

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
  const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/websites";
  console.log(`[SEO-Websites API] Fetching fresh data from RapidAPI`);

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
    { website: "Google", domainName: "google.com", similarWebRanking: "1", type: "Search engine", country: "United States" },
    { website: "YouTube", domainName: "youtube.com", similarWebRanking: "2", type: "Video streaming", country: "United States" },
    { website: "Facebook", domainName: "facebook.com", similarWebRanking: "3", type: "Social network", country: "United States" },
    { website: "Instagram", domainName: "instagram.com", similarWebRanking: "4", type: "Social network", country: "United States" },
    { website: "Twitter", domainName: "twitter.com", similarWebRanking: "5", type: "Social network", country: "United States" },
    { website: "Wikipedia", domainName: "wikipedia.org", similarWebRanking: "6", type: "Encyclopedia", country: "United States" },
    { website: "Amazon", domainName: "amazon.com", similarWebRanking: "7", type: "E-commerce", country: "United States" },
    { website: "Reddit", domainName: "reddit.com", similarWebRanking: "8", type: "Social network", country: "United States" },
    { website: "TikTok", domainName: "tiktok.com", similarWebRanking: "9", type: "Video streaming", country: "China" },
    { website: "LinkedIn", domainName: "linkedin.com", similarWebRanking: "10", type: "Social network", country: "United States" },
  ];
}
