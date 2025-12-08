// Next.js Serverless API route to proxy SEO ISP/Hosting API from RapidAPI
// Uses aggressive Vercel caching to optimize 50 requests/day limit

/**
 * Cache configuration:
 * - s-maxage: 86400 (24 hours) - CDN cache for full day
 * - stale-while-revalidate: 172800 (48 hours) - Serve stale while revalidating
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Cache for 24 hours on Vercel's edge, serve stale for 48 hours while revalidating
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800, max-age=3600"
    );

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-SEO-API-Cache", "true");
    res.setHeader("X-Cache-TTL", "86400");

    const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/isp";

    console.log(`[SEO-Hosting API] Fetching from: ${apiUrl}`);

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

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        cachedAt: new Date().toISOString(),
        cacheMaxAge: 86400,
        source: "rapidapi-seo-api2",
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

/**
 * Fallback data for top hosting providers
 */
function getFallbackData() {
  return [
    { rank: 1, isps: [{ isp_id: "1", isp_name: "Amazon.com, Inc." }], total_domains: "5234567", percent: "18.72%" },
    { rank: 2, isps: [{ isp_id: "2", isp_name: "Cloudflare, Inc." }], total_domains: "4123456", percent: "14.75%" },
    { rank: 3, isps: [{ isp_id: "3", isp_name: "Google LLC" }], total_domains: "3456789", percent: "12.36%" },
    { rank: 4, isps: [{ isp_id: "4", isp_name: "Microsoft Corporation" }], total_domains: "2345678", percent: "8.39%" },
    { rank: 5, isps: [{ isp_id: "5", isp_name: "OVH SAS" }], total_domains: "1234567", percent: "4.41%" },
    { rank: 6, isps: [{ isp_id: "6", isp_name: "Unified Layer" }], total_domains: "987654", percent: "3.53%" },
    { rank: 7, isps: [{ isp_id: "7", isp_name: "Hetzner Online GmbH" }], total_domains: "876543", percent: "3.14%" },
    { rank: 8, isps: [{ isp_id: "8", isp_name: "DigitalOcean, LLC" }], total_domains: "765432", percent: "2.74%" },
    { rank: 9, isps: [{ isp_id: "9", isp_name: "GoDaddy.com, LLC" }], total_domains: "654321", percent: "2.34%" },
    { rank: 10, isps: [{ isp_id: "10", isp_name: "Fastly, Inc." }], total_domains: "543210", percent: "1.94%" },
  ];
}
