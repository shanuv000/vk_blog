import {
  getTweetById,
  formatTweetData,
} from "../../../../services/twitterService.js";

// Simple server-side cache
const cache = new Map();
// Dedupe concurrent requests per tweetId
const inFlight = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tweetId } = req.query;

  if (!tweetId) {
    return res.status(400).json({ error: "Tweet ID is required" });
  }

  // Check cache first
  const cacheKey = `tweet_${tweetId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (process.env.NODE_ENV === 'development') {

      if (process.env.NODE_ENV === 'development') {


        console.log(`Cache hit for tweet ${tweetId}`);


      }

    }
    return res.status(200).json({
      success: true,
      data: cached.data,
      cached: true,
    });
  }

  try {
    if (process.env.NODE_ENV === 'development') {

      if (process.env.NODE_ENV === 'development') {


        console.log(`Fetching tweet ${tweetId} from Twitter API`);


      }

    }

    // Dedupe upstream calls
    let promise = inFlight.get(cacheKey);
    if (!promise) {
      promise = getTweetById(tweetId);
      inFlight.set(cacheKey, promise);
    }
    const twitterData = await promise;

    // Format tweet for frontend consumption
    const formattedTweet = formatTweetData(
      twitterData.data,
      twitterData.includes
    );

    // Cache the result
    cache.set(cacheKey, {
      data: formattedTweet,
      timestamp: Date.now(),
    });

    // Clear in-flight entry
    inFlight.delete(cacheKey);

    return res.status(200).json({
      success: true,
      data: formattedTweet,
      cached: false,
    });
  } catch (error) {
    console.error("API Error fetching tweet:", error);

    // Clear in-flight entry on error
    inFlight.delete(cacheKey);

    // Handle specific Twitter API errors
    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Twitter API unavailable",
        message: "Unable to connect to Twitter API",
      });
    }

    // If rate-limited, try to serve stale cache (even if expired)
    const statusCode =
      typeof error.code === "number" ? error.code : parseInt(error.code, 10);
    if (statusCode === 429) {
      const resetTime = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000)
        : null;
      if (cached?.data) {
        console.warn(
          `Rate limited for ${tweetId}. Serving stale cache (age ${
            (Date.now() - cached.timestamp) / 1000
          }s)`
        );
        res.setHeader("X-From-Cache", "stale");
        return res.status(200).json({
          success: true,
          data: cached.data,
          cached: true,
          stale: true,
          rateLimit: {
            limit: error.rateLimit?.limit,
            remaining: error.rateLimit?.remaining,
            reset: resetTime?.toISOString(),
            resetIn: resetTime
              ? Math.max(0, resetTime.getTime() - Date.now())
              : null,
          },
        });
      }
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Twitter API rate limit exceeded. Please try again later.",
        rateLimit: {
          limit: error.rateLimit?.limit,
          remaining: error.rateLimit?.remaining,
          reset: resetTime?.toISOString(),
          resetIn: resetTime
            ? Math.max(0, resetTime.getTime() - Date.now())
            : null,
        },
      });
    }

    if (error.code === 404) {
      return res.status(404).json({
        error: "Tweet not found",
        message: `Tweet with ID ${tweetId} not found or may be private/deleted`,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch tweet",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
