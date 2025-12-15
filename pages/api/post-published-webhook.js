/**
 * Post Publishing Webhook Handler
 * Handles sitemap revalidation when posts are published
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only POST requests are accepted.",
    });
  }

  try {
    // Validate secret
    const { secret } = req.query;
    if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
      console.warn("Invalid webhook secret attempted");
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { operation, data } = req.body;
    const results = {
      sitemap: null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Post webhook received: ${operation} for ${data?.__typename} with slug: ${data?.slug}`
      );
    }

    // Only process Post models
    if (data.__typename !== "Post") {
      return res.status(200).json({
        success: true,
        message: `Model "${data.__typename}" not relevant for post processing`,
        skipped: true,
      });
    }

    // Only process relevant operations
    const relevantOperations = ["create", "update", "publish"];
    if (!relevantOperations.includes(operation)) {
      return res.status(200).json({
        success: true,
        message: `Operation "${operation}" not relevant for post processing`,
        skipped: true,
      });
    }

    // Handle sitemap revalidation for published posts
    if (
      operation === "publish" ||
      (operation === "update" && data.stage === "PUBLISHED")
    ) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("🔄 Revalidating sitemap...");
        }

        // Call sitemap revalidation endpoint
        const sitemapResponse = await fetch(
          `https://blog.urtechy.com/api/revalidate-sitemap?secret=${secret}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "post-published",
              slug: data.slug,
            }),
          }
        );

        if (sitemapResponse.ok) {
          results.sitemap = {
            success: true,
            message: "Sitemap revalidated successfully",
          };
          if (process.env.NODE_ENV === "development") {
            console.log("✅ Sitemap revalidated");
          }
        } else {
          throw new Error(`Sitemap API returned ${sitemapResponse.status}`);
        }
      } catch (error) {
        console.error("❌ Sitemap revalidation failed:", error);
        results.sitemap = {
          success: false,
          error: error.message,
        };
      }
    }

    // Return combined results
    return res.status(200).json({
      success: true,
      message: "Post webhook processed successfully",
      data: {
        slug: data.slug,
        operation,
        results,
      },
    });
  } catch (error) {
    console.error("Error in post webhook handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error processing webhook",
      error: error.message,
    });
  }
}
