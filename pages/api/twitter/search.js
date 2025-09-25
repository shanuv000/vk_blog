import {
  searchTweets,
  formatTweetData,
} from "../../../services/twitterService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q: query, count = 10 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const twitterData = await searchTweets(query, parseInt(count));

    // Format tweets for frontend consumption
    const formattedTweets = twitterData.data.map((tweet) =>
      formatTweetData(tweet, twitterData.includes)
    );

    return res.status(200).json({
      success: true,
      data: {
        tweets: formattedTweets,
        meta: twitterData.meta,
      },
    });
  } catch (error) {
    console.error("API Error searching tweets:", error);

    // Handle specific Twitter API errors
    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Twitter API unavailable",
        message: "Unable to connect to Twitter API",
      });
    }

    if (error.status === 429) {
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
