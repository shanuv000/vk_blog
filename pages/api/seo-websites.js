// Next.js Serverless API route to proxy Top Websites API from RapidAPI
// Uses aggressive Vercel caching to optimize 50 requests/day limit

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Cache for 24 hours on Vercel's edge
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800, max-age=3600"
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-SEO-API-Cache", "true");
    res.setHeader("X-Cache-TTL", "86400");

    const apiUrl = "https://seo-api2.p.rapidapi.com/www-reports/websites";

    console.log(`[SEO-Websites API] Fetching from: ${apiUrl}`);

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

function getFallbackData() {
  return [
    { website: "Google", domainName: "google.com", similarWebRanking: "1", semrushRanking: "1", type: "Search engine", company: "Google", country: "United States" },
    { website: "YouTube", domainName: "youtube.com", similarWebRanking: "2", semrushRanking: "2", type: "Video streaming", company: "Google", country: "United States" },
    { website: "Facebook", domainName: "facebook.com", similarWebRanking: "3", semrushRanking: "3", type: "Social network", company: "Meta", country: "United States" },
    { website: "Instagram", domainName: "instagram.com", similarWebRanking: "4", semrushRanking: "4", type: "Social network", company: "Meta", country: "United States" },
    { website: "Twitter", domainName: "twitter.com", similarWebRanking: "5", semrushRanking: "5", type: "Social network", company: "X Corp", country: "United States" },
    { website: "Wikipedia", domainName: "wikipedia.org", similarWebRanking: "6", semrushRanking: "6", type: "Encyclopedia", company: "Wikimedia", country: "United States" },
    { website: "Amazon", domainName: "amazon.com", similarWebRanking: "7", semrushRanking: "7", type: "E-commerce", company: "Amazon", country: "United States" },
    { website: "Reddit", domainName: "reddit.com", similarWebRanking: "8", semrushRanking: "8", type: "Social network", company: "—", country: "United States" },
    { website: "TikTok", domainName: "tiktok.com", similarWebRanking: "9", semrushRanking: "9", type: "Video streaming", company: "ByteDance", country: "China" },
    { website: "LinkedIn", domainName: "linkedin.com", similarWebRanking: "10", semrushRanking: "10", type: "Social network", company: "Microsoft", country: "United States" },
  ];
}
