import {
  getUserTweets,
  formatTweetData,
} from "../../../../services/twitterService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, count = 10 } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const twitterData = await getUserTweets(username, parseInt(count));

    // Format tweets for frontend consumption
    const formattedTweets = twitterData.data.map((tweet) =>
      formatTweetData(tweet, twitterData.includes)
    );

    return res.status(200).json({
      success: true,
      data: {
        tweets: formattedTweets,
        user: twitterData.user,
        meta: twitterData.meta,
      },
    });
  } catch (error) {
    console.error("API Error fetching user tweets:", error);

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

    if (error.status === 404) {
      return res.status(404).json({
        error: "User not found",
        message: `Twitter user @${username} not found`,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch tweets",
    });
  }
}
