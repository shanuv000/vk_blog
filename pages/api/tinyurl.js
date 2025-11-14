/**
 * API endpoint for TinyURL operations
 * Provides server-side URL shortening and analytics
 */
import tinyUrlService from "../../services/tinyurl";

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    "https://blog.urtechy.com",
    "https://urtechy.com",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "POST":
        return await handleCreateShortUrl(req, res);
      case "GET":
        return await handleGetAnalytics(req, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("TinyURL API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Handle POST request to create a short URL
 */
async function handleCreateShortUrl(req, res) {
  const { url, alias, tags, description, post } = req.body;

  // Validate required fields
  if (!url) {
    return res.status(400).json({
      error: "URL is required",
    });
  }

  try {
    let result;

    if (post && post.slug) {
      // Use the post-specific shortening method
      result = await tinyUrlService.shortenPostUrl(
        post,
        "https://blog.urtechy.com"
      );
      return res.status(200).json({
        success: true,
        shortUrl: result,
        longUrl: url,
        isShortened: result !== url,
      });
    } 
      // Use general URL shortening
      const options = {};
      if (alias) {options.alias = alias;}
      if (tags) {options.tags = Array.isArray(tags) ? tags : [tags];}
      if (description) {options.description = description;}

      const response = await tinyUrlService.createShortUrl(url, options);

      return res.status(200).json({
        success: response.code === 0,
        shortUrl: response.data.tiny_url,
        longUrl: response.data.url,
        alias: response.data.alias,
        errors: response.errors || [],
        isShortened: response.data.tiny_url !== url,
      });
    
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({
      error: "Failed to create short URL",
      message: error.message,
      fallback: url, // Return original URL as fallback
    });
  }
}

/**
 * Handle GET request to fetch analytics
 */
async function handleGetAnalytics(req, res) {
  const { alias } = req.query;

  if (!alias) {
    return res.status(400).json({
      error: "Alias is required for analytics",
    });
  }

  try {
    const analytics = await tinyUrlService.getAnalytics(alias);

    if (!analytics) {
      return res.status(404).json({
        error: "Analytics not found for the provided alias",
      });
    }

    return res.status(200).json({
      success: true,
      analytics,
      alias,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({
      error: "Failed to fetch analytics",
      message: error.message,
    });
  }
}
