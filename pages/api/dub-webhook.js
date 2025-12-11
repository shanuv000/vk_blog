/**
 * Hygraph Webhook Handler for Dub.co Link Shortening
 * Automatically creates short URLs when posts are published in Hygraph
 * and saves them back to Hygraph's shortUrl field
 */
import dubService from "../../services/dub";
import { GraphQLClient, gql } from "graphql-request";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

// Hygraph Management API client for updating posts
const getHygraphClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
  const token = process.env.HYGRAPH_AUTH_TOKEN;

  if (!endpoint || !token) {
    throw new Error("Hygraph API configuration missing");
  }

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Mutation to update post with short URL
const UPDATE_POST_SHORT_URL = gql`
  mutation UpdatePostShortUrl($id: ID!, $shortUrl: String!) {
    updatePost(where: { id: $id }, data: { shortUrl: $shortUrl }) {
      id
      slug
      shortUrl
    }
  }
`;

// Mutation to publish the updated post
const PUBLISH_POST = gql`
  mutation PublishPost($id: ID!) {
    publishPost(where: { id: $id }) {
      id
      slug
      shortUrl
    }
  }
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only POST requests are accepted.",
    });
  }

  try {
    // Validate webhook secret
    const { secret } = req.query;
    if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
      console.warn("❌ Invalid webhook secret attempted");
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { operation, data } = req.body;

    console.log(
      `🔗 Dub Webhook: ${operation} for ${data?.__typename} - ${data?.slug}`
    );

    // Only process Post models
    if (data.__typename !== "Post") {
      return res.status(200).json({
        success: true,
        message: `Model "${data.__typename}" not relevant for URL shortening`,
        skipped: true,
      });
    }

    // Only process publish operations
    const relevantOperations = ["publish", "update"];
    if (!relevantOperations.includes(operation)) {
      return res.status(200).json({
        success: true,
        message: `Operation "${operation}" not relevant for URL shortening`,
        skipped: true,
      });
    }

    // Only process published content
    if (operation === "update" && data.stage !== "PUBLISHED") {
      return res.status(200).json({
        success: true,
        message: "Update operation not for published content",
        skipped: true,
      });
    }

    // Check required data
    if (!data.slug) {
      return res.status(400).json({
        success: false,
        message: "Post slug is required",
        error: "Missing slug",
      });
    }

    // Skip if short URL already exists (avoid duplicate API calls)
    if (data.shortUrl && data.shortUrl.includes("dub.sh") || 
        data.shortUrl && data.shortUrl.includes(process.env.DUB_CUSTOM_DOMAIN || "")) {
      console.log("✅ Short URL already exists:", data.shortUrl);
      return res.status(200).json({
        success: true,
        message: "Short URL already exists",
        data: {
          slug: data.slug,
          shortUrl: data.shortUrl,
        },
        skipped: true,
      });
    }

    // Create the short URL
    console.log(`🔗 Creating Dub.co short URL for: ${data.slug}`);

    const post = {
      id: data.id,
      slug: data.slug,
      title: data.title || `Blog Post - ${data.slug}`,
      categories: data.categories || [],
    };

    const shortUrl = await dubService.shortenPostUrl(
      post,
      "https://blog.urtechy.com"
    );

    const longUrl = `https://blog.urtechy.com/post/${data.slug}`;
    const isShortened = shortUrl !== longUrl;

    console.log(`✅ Created short URL: ${shortUrl} (shortened: ${isShortened})`);

    // Save short URL back to Hygraph if successfully shortened
    let hygraphUpdateResult = null;
    if (isShortened && data.id) {
      try {
        console.log("📝 Saving short URL to Hygraph...");
        const client = getHygraphClient();

        // Update the post with the short URL
        const updateResult = await client.request(UPDATE_POST_SHORT_URL, {
          id: data.id,
          shortUrl: shortUrl,
        });

        // Publish the updated post
        const publishResult = await client.request(PUBLISH_POST, {
          id: data.id,
        });

        hygraphUpdateResult = {
          success: true,
          updated: updateResult,
          published: publishResult,
        };

        console.log("✅ Short URL saved to Hygraph");
      } catch (hygraphError) {
        console.error("❌ Error saving to Hygraph:", hygraphError.message);
        hygraphUpdateResult = {
          success: false,
          error: hygraphError.message,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: "Short URL created successfully",
      data: {
        slug: data.slug,
        operation,
        shortUrl,
        longUrl,
        isShortened,
        hygraphUpdate: hygraphUpdateResult,
        stats: dubService.getStats(),
      },
    });
  } catch (error) {
    console.error("❌ Error in Dub webhook handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
