// Next.js Serverless API route to proxy SEO Hosting API from RapidAPI
// Uses Upstash Redis for guaranteed 24-hour caching

import { setCorsHeaders } from "../../lib/cors";
import { withCache } from "../../lib/redis";

const CACHE_KEY = "seo:top-hosting-providers";
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
    console.error(`[SEO-Hosting API] Error:`, error);

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
  const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/isp";
  console.log(`[SEO-Hosting API] Fetching fresh data from RapidAPI`);

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
    { rank: 1, isps: [{ isp_id: "1", isp_name: "Amazon.com" }], total_domains: "1360112", percent: "4.865%" },
    { rank: 2, isps: [{ isp_id: "2", isp_name: "Cloudflare" }], total_domains: "1292992", percent: "4.625%" },
    { rank: 3, isps: [{ isp_id: "3", isp_name: "Google Inc." }], total_domains: "858713", percent: "3.071%" },
    { rank: 4, isps: [{ isp_id: "4", isp_name: "OVHcloud" }], total_domains: "487097", percent: "1.742%" },
    { rank: 5, isps: [{ isp_id: "5", isp_name: "Shopify, Inc." }], total_domains: "396382", percent: "1.418%" },
    { rank: 6, isps: [{ isp_id: "6", isp_name: "Hetzner" }], total_domains: "350000", percent: "1.25%" },
    { rank: 7, isps: [{ isp_id: "7", isp_name: "DigitalOcean" }], total_domains: "320000", percent: "1.14%" },
    { rank: 8, isps: [{ isp_id: "8", isp_name: "GoDaddy" }], total_domains: "290000", percent: "1.03%" },
    { rank: 9, isps: [{ isp_id: "9", isp_name: "Microsoft" }], total_domains: "260000", percent: "0.93%" },
    { rank: 10, isps: [{ isp_id: "10", isp_name: "Unified Layer" }], total_domains: "230000", percent: "0.82%" },
  ];
}
