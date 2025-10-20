/**
 * Hygraph Webhook Handler for TinyURL Integration
 * Automatically shortens URLs when posts are published or updated in Hygraph
 */
import tinyUrlService from "../../services/tinyurl";

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only POST requests are accepted.",
    });
  }

  try {
    // Check for secret to confirm this is a valid request
    const { secret } = req.query;

    if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
      console.warn("Invalid webhook secret attempted");
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Get the webhook payload
    const { operation, data } = req.body;

    if (process.env.NODE_ENV === 'development') {


      if (process.env.NODE_ENV === 'development') {



        console.log(
      `TinyURL Webhook received: ${operation} for ${
        data?.__typename || "unknown"
      } with slug: ${data?.slug}`
    );



      }


    }

    // Only proceed if this is a relevant operation
    const relevantOperations = ["create", "update", "publish"];
    if (!relevantOperations.includes(operation)) {
      return res.status(200).json({
        success: true,
        message: `Operation "${operation}" not relevant for URL shortening`,
        skipped: true,
      });
    }

    // Only proceed if this is a Post model
    const modelType = data.__typename || data.model;
    if (modelType !== "Post") {
      return res.status(200).json({
        success: true,
        message: `Model "${modelType}" not relevant for URL shortening`,
        skipped: true,
      });
    }

    // Check if post has required data
    if (!data.slug) {
      return res.status(400).json({
        success: false,
        message: "Post slug is required for URL shortening",
        error: "Missing slug",
      });
    }

    // Only shorten URLs for published posts
    if (
      operation === "publish" ||
      (operation === "update" && data.stage === "PUBLISHED")
    ) {
      try {
        if (process.env.NODE_ENV === 'development') {

          if (process.env.NODE_ENV === 'development') {


            console.log(`Creating short URL for post: ${data.slug}`);


          }

        }

        // Create the post object for TinyURL service
        const post = {
          slug: data.slug,
          title: data.title || `Blog Post - ${data.slug}`,
        };

        // Create shortened URL
        const shortUrl = await tinyUrlService.shortenPostUrl(
          post,
          "https://blog.urtechy.com"
        );

        // Log success
        if (process.env.NODE_ENV === 'development') {

          if (process.env.NODE_ENV === 'development') {


            console.log(
          `Successfully created short URL: ${shortUrl} for post: ${data.slug}`
        );


          }

        }

        // Optionally, you could store the short URL back to Hygraph here
        // using the Management API if you want to save it as a field

        return res.status(200).json({
          success: true,
          message: "Short URL created successfully",
          data: {
            slug: data.slug,
            operation,
            shortUrl,
            longUrl: `https://blog.urtechy.com/post/${data.slug}`,
          },
        });
      } catch (error) {
        console.error("Error creating short URL:", error);

        // Don't fail the webhook if URL shortening fails
        // This ensures other processes can continue
        return res.status(200).json({
          success: false,
          message: "Failed to create short URL, but webhook processed",
          error: error.message,
          data: {
            slug: data.slug,
            operation,
            fallbackUrl: `https://blog.urtechy.com/post/${data.slug}`,
          },
        });
      }
    } else {
      // For non-publish operations, just acknowledge
      return res.status(200).json({
        success: true,
        message: `Post ${operation} acknowledged, no URL shortening needed`,
        data: {
          slug: data.slug,
          operation,
        },
      });
    }
  } catch (error) {
    console.error("Error in TinyURL webhook handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error processing webhook",
      error: error.message,
    });
  }
}

/**
 * Optional: Store short URL back to Hygraph
 * This function can be called to save the shortened URL back to Hygraph
 * You would need to add a "shortUrl" field to your Post model first
 */
async function saveShortUrlToHygraph(postId, shortUrl) {
  // This requires Hygraph Management API integration
  // Example implementation:
  /*
  const { GraphQLClient, gql } = require('graphql-request');
  
  const managementClient = new GraphQLClient(
    process.env.NEXT_PUBLIC_HYGRAPH_MANAGEMENT_API,
    {
      headers: {
        Authorization: `Bearer ${process.env.HYGRAPH_AUTH_TOKEN}`,
      },
    }
  );

  const UPDATE_POST_SHORT_URL = gql`
    mutation UpdatePostShortUrl($id: ID!, $shortUrl: String!) {
      updatePost(where: { id: $id }, data: { shortUrl: $shortUrl }) {
        id
        slug
        shortUrl
      }
    }
  `;

  try {
    const result = await managementClient.request(UPDATE_POST_SHORT_URL, {
      id: postId,
      shortUrl: shortUrl,
    });
    
    // Don't forget to publish the changes
    const PUBLISH_POST = gql`
      mutation PublishPost($id: ID!) {
        publishPost(where: { id: $id }) {
          id
          slug
          shortUrl
        }
      }
    `;
    
    await managementClient.request(PUBLISH_POST, { id: postId });
    
    return result;
  } catch (error) {
    console.error('Error saving short URL to Hygraph:', error);
    throw error;
  }
  */
}
