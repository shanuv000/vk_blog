// API route to redirect to placeholder images when the original image is not available
// This helps avoid 404 errors for missing images

export default async function handler(req, res) {
  // Set cache headers to improve performance
  res.setHeader(
    "Cache-Control",
    "public, immutable, max-age=31536000, stale-while-revalidate=86400"
  );

  try {
    // Get image type from query parameter (avatar or featured)
    const { type = "featured" } = req.query;

    // Define placeholder URLs based on type
    const placeholderUrls = {
      avatar: "https://via.placeholder.com/100?text=Author",
      featured: "https://via.placeholder.com/800x450?text=urTechy+Blogs",
      default: "https://via.placeholder.com/800x450?text=urTechy+Blogs",
    };

    // Get the appropriate placeholder URL
    const redirectUrl = placeholderUrls[type] || placeholderUrls.default;

    // Redirect to the placeholder image
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("Error handling default image:", error);
    // Redirect to a generic placeholder as fallback
    res.redirect(302, "https://via.placeholder.com/800x450?text=Error");
  }
}
