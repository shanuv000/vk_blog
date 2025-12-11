/**
 * API Route to create Dub.co short links on-demand
 * Used by the useDub hook when shortUrl is not pre-cached
 */
import dubService from "../../services/dub";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { post } = req.body;

    if (!post || !post.slug) {
      return res.status(400).json({
        success: false,
        message: "Post slug is required",
      });
    }

    const shortUrl = await dubService.shortenPostUrl(
      post,
      "https://blog.urtechy.com"
    );

    const longUrl = `https://blog.urtechy.com/post/${post.slug}`;
    const isShortened = shortUrl !== longUrl;

    return res.status(200).json({
      success: true,
      shortUrl,
      longUrl,
      isShortened,
    });
  } catch (error) {
    console.error("Error creating short link:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      shortUrl: req.body?.post?.slug
        ? `https://blog.urtechy.com/post/${req.body.post.slug}`
        : null,
    });
  }
}
