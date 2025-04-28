// Next.js API route to revalidate pages
// This can be called by a webhook from Hygraph when content changes

import { config } from "./revalidate-config";

// Export the config to configure the API route
export { config };

export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const revalidatedPaths = [];

    // Always revalidate the home page
    await res.revalidate("/");
    revalidatedPaths.push("/");
    console.log("Revalidated home page");

    // If a specific path is provided in query params, revalidate that too
    if (req.query.path) {
      await res.revalidate(req.query.path);
      revalidatedPaths.push(req.query.path);
      console.log(`Revalidated path: ${req.query.path}`);
    }

    // If a slug is provided in query params, revalidate the post page
    if (req.query.slug) {
      await res.revalidate(`/post/${req.query.slug}`);
      revalidatedPaths.push(`/post/${req.query.slug}`);
      console.log(`Revalidated post: /post/${req.query.slug}`);
    }

    // If a category is provided in query params, revalidate the category page
    if (req.query.category) {
      await res.revalidate(`/category/${req.query.category}`);
      revalidatedPaths.push(`/category/${req.query.category}`);
      console.log(`Revalidated category: /category/${req.query.category}`);
    }

    // Handle webhook payload from Hygraph
    if (req.method === "POST") {
      try {
        console.log(
          "Received POST request with body:",
          JSON.stringify(req.body, null, 2)
        );

        const payload = req.body;

        // Check for various payload formats that Hygraph might send

        // Format 1: Our custom payload format
        if (payload.data && payload.operation) {
          console.log(`Received webhook with custom payload format`);

          // Handle different content types
          if (payload.data.model === "Post" && payload.data.slug) {
            await res.revalidate(`/post/${payload.data.slug}`);
            revalidatedPaths.push(`/post/${payload.data.slug}`);
            console.log(
              `Revalidated post from webhook: /post/${payload.data.slug}`
            );
          }

          if (payload.data.model === "Category" && payload.data.slug) {
            await res.revalidate(`/category/${payload.data.slug}`);
            revalidatedPaths.push(`/category/${payload.data.slug}`);
            console.log(
              `Revalidated category from webhook: /category/${payload.data.slug}`
            );
          }
        }
        // Format 2: Default Hygraph format with stage and data
        else if (payload.stage && payload.data) {
          console.log(`Received webhook with default Hygraph format`);

          // Try to determine the content type and slug
          const entry = payload.data;

          if (entry) {
            console.log(`Entry data:`, JSON.stringify(entry, null, 2));

            // Check if it's a post
            if (entry.slug && (entry.__typename === "Post" || entry.title)) {
              await res.revalidate(`/post/${entry.slug}`);
              revalidatedPaths.push(`/post/${entry.slug}`);
              console.log(`Revalidated post: /post/${entry.slug}`);
            }

            // Check if it's a category
            if (entry.slug && entry.__typename === "Category") {
              await res.revalidate(`/category/${entry.slug}`);
              revalidatedPaths.push(`/category/${entry.slug}`);
              console.log(`Revalidated category: /category/${entry.slug}`);
            }
          }
        }
        // Format 3: Raw post data at the root level
        else if (payload.slug) {
          console.log(`Received webhook with raw data format`);

          // Assume it's a post if it has a slug and title
          if (payload.title) {
            await res.revalidate(`/post/${payload.slug}`);
            revalidatedPaths.push(`/post/${payload.slug}`);
            console.log(`Revalidated post: /post/${payload.slug}`);
          }
          // Assume it's a category if it has a slug but no title
          else {
            await res.revalidate(`/category/${payload.slug}`);
            revalidatedPaths.push(`/category/${payload.slug}`);
            console.log(`Revalidated category: /category/${payload.slug}`);
          }
        }
        // If we can't determine the format, revalidate the home page as a fallback
        else {
          console.log(
            `Received webhook with unknown format, revalidating home page only`
          );
        }
      } catch (webhookError) {
        console.error("Error processing webhook payload:", webhookError);
        // Continue execution - we don't want to fail the whole request if just the webhook part fails
      }
    }

    return res.json({
      revalidated: true,
      paths: revalidatedPaths,
      message: "Revalidation triggered successfully",
    });
  } catch (err) {
    // If there was an error, Next.js will continue to show the last successfully generated page
    console.error("Revalidation error:", err);
    return res.status(500).send({
      message: "Error revalidating",
      error: err.message,
    });
  }
}
