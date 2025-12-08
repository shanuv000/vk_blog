// Next.js Serverless API route to proxy SEO Language API from RapidAPI
// Uses Upstash Redis for guaranteed 24-hour caching

import { setCorsHeaders } from "../../lib/cors";
import { withCache } from "../../lib/redis";

const CACHE_KEY = "seo:top-website-languages";
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
    console.error(`[SEO-Language API] Error:`, error);

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
  const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/language";
  console.log(`[SEO-Language API] Fetching fresh data from RapidAPI`);

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
    { rank: 1, language: "English (en)", total_domains: "10708003", percent: "38.3%" },
    { rank: 2, language: "German (de)", total_domains: "1607187", percent: "5.749%" },
    { rank: 3, language: "Spanish (es)", total_domains: "1044155", percent: "3.735%" },
    { rank: 4, language: "French (fr)", total_domains: "952190", percent: "3.406%" },
    { rank: 5, language: "Dutch (nl)", total_domains: "675142", percent: "2.415%" },
    { rank: 6, language: "Italian (it)", total_domains: "532879", percent: "1.906%" },
    { rank: 7, language: "Russian (ru)", total_domains: "501284", percent: "1.793%" },
    { rank: 8, language: "Polish (pl)", total_domains: "384904", percent: "1.377%" },
    { rank: 9, language: "Portuguese (pt)", total_domains: "350000", percent: "1.25%" },
    { rank: 10, language: "Japanese (ja)", total_domains: "320000", percent: "1.14%" },
  ];
}
