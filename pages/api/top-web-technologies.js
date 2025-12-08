// Next.js Serverless API route to proxy SEO Tech API from RapidAPI
// Uses aggressive Vercel caching to optimize 50 requests/day limit

import { setCorsHeaders } from "../../lib/cors";

/**
 * Cache configuration:
 * - s-maxage: 86400 (24 hours) - CDN cache for full day
 * - stale-while-revalidate: 172800 (48 hours) - Serve stale while revalidating
 * - This means the API will only be called once per day maximum
 */

export default async function handler(req, res) {
  // Handle CORS preflight
  if (setCorsHeaders(req, res)) return;

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Set aggressive cache headers to minimize API calls
    // Cache for 24 hours on Vercel's edge, serve stale for 48 hours while revalidating
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800, max-age=3600"
    );

    // Performance tracking headers
    res.setHeader("X-SEO-API-Cache", "true");
    res.setHeader("X-Cache-TTL", "86400");

    const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/tech";

    console.log(`[SEO-Tech API] Fetching from: ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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

    const data = await response.json();

    // Add metadata to response
    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        cachedAt: new Date().toISOString(),
        cacheMaxAge: 86400, // 24 hours in seconds
        source: "rapidapi-seo-api2",
      },
    });
  } catch (error) {
    console.error(`[SEO-Tech API] Error:`, error);

    // Return cached fallback data to prevent UI breaking
    // This ensures the page still works even if API fails
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

/**
 * Fallback data in case the API fails or quota is exceeded
 * Based on typical top web technologies data
 */
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
