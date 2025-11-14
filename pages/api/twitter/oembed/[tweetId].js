/**
 * Twitter oEmbed API Proxy
 *
 * This endpoint proxies requests to Twitter's oEmbed API to:
 * 1. Avoid client-side rate limits
 * 2. Add server-side caching
 * 3. Handle errors gracefully
 * 4. Provide fallback for rate-limited scenarios
 *
 * Twitter oEmbed API: https://developer.twitter.com/en/docs/twitter-for-websites/oembed-api
 */

// Simple in-memory cache
const cache = new Map();
const inFlight = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (oEmbed HTML rarely changes)
const STALE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (for stale cache fallback)

/**
 * Cleanup old cache entries periodically
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > STALE_CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupCache, 60 * 60 * 1000);
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only GET requests are supported",
    });
  }

  const { tweetId } = req.query;

  // Validate tweet ID
  if (!tweetId || !/^\d+$/.test(tweetId)) {
    return res.status(400).json({
      error: "Invalid tweet ID",
      message: "Tweet ID must be a numeric string",
    });
  }

  const cacheKey = `oembed_${tweetId}`;
  const now = Date.now();

  // Check fresh cache first
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ [oEmbed Cache] Hit for tweet ${tweetId} (age: ${Math.round(
          (now - cached.timestamp) / 1000
        )}s)`
      );
    }
    res.setHeader("X-Cache", "HIT");
    res.setHeader("X-Cache-Age", Math.round((now - cached.timestamp) / 1000));
    return res.status(200).json({
      success: true,
      data: cached.data,
      cached: true,
      cacheAge: now - cached.timestamp,
    });
  }

  try {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔄 [oEmbed] Fetching tweet ${tweetId} from Twitter oEmbed API`
      );
    }

    // Deduplicate concurrent requests
    let promise = inFlight.get(cacheKey);
    if (!promise) {
      const tweetUrl = `https://twitter.com/i/status/${tweetId}`;
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
        tweetUrl
      )}&omit_script=true&dnt=true`;

      promise = fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BlogBot/1.0)",
        },
      }).then(async (response) => {
        if (!response.ok) {
          const error = new Error(`Twitter API error: ${response.status}`);
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        return response.json();
      });

      inFlight.set(cacheKey, promise);
    }

    const oembedData = await promise;

    // Validate response has required fields
    if (!oembedData || !oembedData.html) {
      throw new Error("Invalid oEmbed response: missing html field");
    }

    // Cache the result
    cache.set(cacheKey, {
      data: oembedData,
      timestamp: now,
    });

    // Clear in-flight entry
    inFlight.delete(cacheKey);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ [oEmbed] Successfully fetched and cached tweet ${tweetId}`
      );
    }

    res.setHeader("X-Cache", "MISS");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).json({
      success: true,
      data: oembedData,
      cached: false,
    });
  } catch (error) {
    console.error(
      `❌ [oEmbed] Error fetching tweet ${tweetId}:`,
      error.message
    );

    // Clear in-flight entry on error
    inFlight.delete(cacheKey);

    // Handle rate limiting (429) - serve stale cache if available
    if (error.status === 429) {
      if (cached?.data) {
        const cacheAge = now - cached.timestamp;
        console.warn(
          `⚠️ [oEmbed] Rate limited for ${tweetId}. Serving stale cache (age: ${Math.round(
            cacheAge / 1000
          )}s)`
        );

        res.setHeader("X-Cache", "STALE");
        res.setHeader("X-Cache-Age", Math.round(cacheAge / 1000));
        res.setHeader("X-Rate-Limited", "true");

        return res.status(200).json({
          success: true,
          data: cached.data,
          cached: true,
          stale: true,
          cacheAge,
          warning: "Rate limited - serving cached data",
        });
      }

      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Twitter API rate limit exceeded. Please try again later.",
        tweetId,
        fallbackUrl: `https://twitter.com/i/status/${tweetId}`,
      });
    }

    // Handle not found (404)
    if (error.status === 404) {
      return res.status(404).json({
        error: "Tweet not found",
        message: `Tweet ${tweetId} not found. It may be deleted, private, or the ID is invalid.`,
        tweetId,
        fallbackUrl: `https://twitter.com/i/status/${tweetId}`,
      });
    }

    // Handle network errors
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      // Serve stale cache if available
      if (cached?.data) {
        const cacheAge = now - cached.timestamp;
        console.warn(
          `⚠️ [oEmbed] Network error for ${tweetId}. Serving stale cache (age: ${Math.round(
            cacheAge / 1000
          )}s)`
        );

        res.setHeader("X-Cache", "STALE");
        res.setHeader("X-Cache-Age", Math.round(cacheAge / 1000));

        return res.status(200).json({
          success: true,
          data: cached.data,
          cached: true,
          stale: true,
          cacheAge,
          warning: "Network error - serving cached data",
        });
      }

      return res.status(503).json({
        error: "Service unavailable",
        message: "Unable to connect to Twitter API",
        tweetId,
        fallbackUrl: `https://twitter.com/i/status/${tweetId}`,
      });
    }

    // Generic error handling
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch tweet embed",
      tweetId,
      fallbackUrl: `https://twitter.com/i/status/${tweetId}`,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
