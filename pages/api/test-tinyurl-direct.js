/**
 * Direct TinyURL test endpoint
 * Tests the TinyURL service directly with post data
 */

import tinyUrlService from "../../services/tinyurl";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postSlug, postTitle } = req.body;

  if (!postSlug) {
    return res.status(400).json({ error: "Post slug is required" });
  }

  try {
    console.log("🧪 Direct TinyURL test starting:", { postSlug, postTitle });

    // Create a mock post object
    const mockPost = {
      slug: postSlug,
      title: postTitle || "Test Post",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const baseUrl = "https://blog.urtechy.com";

    const result = await tinyUrlService.shortenPostUrl(mockPost, baseUrl);

    const response = {
      success: true,
      input: {
        postSlug,
        postTitle,
        baseUrl,
        fullUrl: `${baseUrl}/post/${postSlug}`,
      },
      result: {
        shortUrl: result,
        isActuallyShort: result && result !== `${baseUrl}/post/${postSlug}`,
        length: result?.length,
      },
      timestamp: new Date().toISOString(),
    };

    // Test completed

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Direct test failed:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
