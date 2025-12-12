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

// Query to fetch post details by ID (when webhook only sends minimal data)
const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    post(where: { id: $id }, stage: PUBLISHED) {
      id
      slug
      title
      shortUrl
      categories {
        name
      }
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
      `🔗 Dub Webhook: ${operation} for ${data?.__typename} - ID: ${data?.id}`
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

    // Check for post ID
    if (!data.id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
        error: "Missing id",
      });
    }

    // If slug is missing, fetch post details from Hygraph
    let postData = { ...data };
    if (!postData.slug) {
      console.log("📥 Fetching post details from Hygraph...");
      try {
        const client = getHygraphClient();
        const result = await client.request(GET_POST_BY_ID, { id: data.id });
        
        if (!result.post) {
          return res.status(404).json({
            success: false,
            message: "Post not found in Hygraph",
            error: "Post not found",
          });
        }
        
        postData = { ...data, ...result.post };
        console.log(`✅ Fetched post: ${postData.slug}`);
      } catch (fetchError) {
        console.error("❌ Error fetching post:", fetchError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch post details from Hygraph",
          error: fetchError.message,
        });
      }
    }

    // NOTE: We previously skipped if shortUrl exists, but wrong URLs were cached
    // from an earlier bug. Now we always create/verify the correct short URL.
    // The Dub.co API handles duplicates with 409 conflict.

    // Create the short URL
    console.log(`🔗 Creating Dub.co short URL for: ${postData.slug}`);

    const post = {
      id: postData.id,
      slug: postData.slug,
      title: postData.title || `Blog Post - ${postData.slug}`,
      categories: postData.categories || [],
    };

    const shortUrl = await dubService.shortenPostUrl(
      post,
      "https://blog.urtechy.com"
    );

    const longUrl = `https://blog.urtechy.com/post/${postData.slug}`;
    const isShortened = shortUrl !== longUrl;

    console.log(`✅ Created short URL: ${shortUrl} (shortened: ${isShortened})`);

    // Save short URL back to Hygraph if successfully shortened
    let hygraphUpdateResult = null;
    if (isShortened && postData.id) {
      try {
        console.log("📝 Saving short URL to Hygraph...");
        const client = getHygraphClient();

        // Update the post with the short URL
        const updateResult = await client.request(UPDATE_POST_SHORT_URL, {
          id: postData.id,
          shortUrl: shortUrl,
        });

        // Publish the updated post
        const publishResult = await client.request(PUBLISH_POST, {
          id: postData.id,
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
        slug: postData.slug,
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
