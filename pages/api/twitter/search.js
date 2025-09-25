import {
  searchTweets,
  formatTweetData,
} from "../../../services/twitterService.js";

const cache = new Map();
const inFlight = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (search cache)

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q: query, count = 10 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const cacheKey = `search_${query}_${count}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res
      .status(200)
      .json({ success: true, data: cached.data, cached: true });
  }

  try {
    let promise = inFlight.get(cacheKey);
    if (!promise) {
      promise = searchTweets(query, parseInt(count));
      inFlight.set(cacheKey, promise);
    }
    const twitterData = await promise;

    // Format tweets for frontend consumption
    const formattedTweets = twitterData.data.map((tweet) =>
      formatTweetData(tweet, twitterData.includes)
    );

    const payload = { tweets: formattedTweets, meta: twitterData.meta };
    cache.set(cacheKey, { data: payload, timestamp: Date.now() });
    inFlight.delete(cacheKey);
    return res
      .status(200)
      .json({ success: true, data: payload, cached: false });
  } catch (error) {
    console.error("API Error searching tweets:", error);
    inFlight.delete(cacheKey);

    // Handle specific Twitter API errors
    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Twitter API unavailable",
        message: "Unable to connect to Twitter API",
      });
    }

    if (error.code === 429) {
      if (cached?.data) {
        res.setHeader("X-From-Cache", "stale");
        return res
          .status(200)
          .json({
            success: true,
            data: cached.data,
            cached: true,
            stale: true,
          });
      }
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Twitter API rate limit exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to search tweets",
    });
  }
}
