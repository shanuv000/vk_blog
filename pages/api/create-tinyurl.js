/**
 * Server-side TinyURL creation endpoint
 * This runs o    console.log("🔄 Proceeding with TinyURL creation (FREE version)...");

    // Check rate limit before proceeding
    const rateLimitStatus = tinyUrlService.getRateLimitStatus();
    console.log("📊 Rate limit status:", rateLimitStatus);

    if (!rateLimitStatus.canMakeRequest) {
      const originalUrl = `${baseUrl}/post/${post.slug}`;
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        shortUrl: originalUrl,
        isShortened: false,
        rateLimitStatus,
        message: "Using original URL due to rate limit",
      });
    }

    // Create TinyURL using server-side service
    const shortUrl = await tinyUrlService.shortenPostUrl(post, baseUrl);
    const originalUrl = `${baseUrl}/post/${post.slug}`;
    const isActuallyShort = shortUrl && shortUrl !== originalUrl;

    console.log("✅ Server TinyURL result:", {
      shortUrl,
      shortUrlLength: shortUrl?.length,
      originalUrl,
      originalUrlLength: originalUrl.length,
      isActuallyShort,
      urlsEqual: shortUrl === originalUrl,
      shortUrlType: typeof shortUrl,
      rateLimitStatus: tinyUrlService.getRateLimitStatus(),
    }); where environment variables are available
 */

import tinyUrlService from "../../services/tinyurl";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      post,
      baseUrl = "https://blog.urtechy.com",
      force = false,
    } = req.body;

    if (!post || !post.slug) {
      return res.status(400).json({ error: "Invalid post data provided" });
    }

    // Check if this is a new post that should have TinyURL
    const TINYURL_INTEGRATION_DATE = new Date("2025-09-29T00:00:00Z");
    const publishedAt = post.publishedAt || post.createdAt;
    const postDate = new Date(publishedAt);
    const isNewPost = postDate >= TINYURL_INTEGRATION_DATE;

    if (!isNewPost && !force) {
      const originalUrl = `${baseUrl}/post/${post.slug}`;
      return res.status(200).json({
        success: true,
        shortUrl: originalUrl,
        isShortened: false,
        isNewPost: false,
        reason: "Legacy post - returning original URL",
      });
    }

    // Create TinyURL using server-side service
    const shortUrl = await tinyUrlService.shortenPostUrl(post, baseUrl);
    const originalUrl = `${baseUrl}/post/${post.slug}`;
    const isActuallyShort = shortUrl && shortUrl !== originalUrl;

    return res.status(200).json({
      success: true,
      shortUrl,
      originalUrl,
      isShortened: isActuallyShort,
      isNewPost,
      alias: isActuallyShort
        ? shortUrl.match(/tinyurl\.com\/(.+)$/)?.[1]
        : null,
      rateLimitStatus: tinyUrlService.getRateLimitStatus(),
      freeVersionOptimized: true,
    });
  } catch (error) {
    console.error("❌ Server TinyURL creation failed:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      shortUrl: req.body.post
        ? `${req.body.baseUrl || "https://blog.urtechy.com"}/post/${
            req.body.post.slug
          }`
        : null,
    });
  }
}
