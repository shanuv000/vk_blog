import {
  getTweetById,
  formatTweetData,
} from "../../../../services/twitterService.js";

// Simple server-side cache
const cache = new Map();
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
    console.log(`Cache hit for tweet ${tweetId}`);
    return res.status(200).json({
      success: true,
      data: cached.data,
      cached: true,
    });
  }

  try {
    console.log(`Fetching tweet ${tweetId} from Twitter API`);
    const twitterData = await getTweetById(tweetId);

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

    return res.status(200).json({
      success: true,
      data: formattedTweet,
      cached: false,
    });
  } catch (error) {
    console.error("API Error fetching tweet:", error);

    // Handle specific Twitter API errors
    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Twitter API unavailable",
        message: "Unable to connect to Twitter API",
      });
    }

    if (error.status === 429) {
      const resetTime = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000)
        : null;
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

    if (error.status === 404) {
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
