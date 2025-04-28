// Next.js API route to revalidate pages
// This can be called by a webhook from Hygraph when content changes

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
    if (req.method === "POST" && req.body) {
      try {
        const payload = req.body;

        // Check if this is a Hygraph webhook payload
        if (payload.data && payload.operation) {
          console.log(
            `Received webhook for ${payload.data.model} with operation ${payload.operation}`
          );

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
