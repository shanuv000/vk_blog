// API route to automatically update posts with AI-generated content
// Uses Perplexity AI to generate recent news/event updates for blog posts
// Triggered via GitHub Actions cron job

import { generatePostUpdate, delay } from "../../lib/perplexity-updates";
import { GraphQLClient } from "graphql-request";

// Hygraph API configuration
const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;
const AI_UPDATE_SECRET = process.env.AI_UPDATE_SECRET;

// GraphQL client for mutations
const getHygraphClient = () => {
  if (!HYGRAPH_CONTENT_API || !HYGRAPH_AUTH_TOKEN) {
    console.error("[AI Update] Missing Hygraph credentials");
    return null;
  }

  return new GraphQLClient(HYGRAPH_CONTENT_API, {
    headers: {
      Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
    },
  });
};

// Query to get posts with AI updates enabled
const GET_AI_ENABLED_POSTS = `
  query GetAIEnabledPosts {
    posts(where: { aiAutoUpdate: true }, first: 5, orderBy: createdAt_DESC) {
      id
      slug
      title
      excerpt
      recentUpdates
      aiLastUpdated
    }
  }
`;

// Mutation to update post with new updates
const UPDATE_POST_RECENT = `
  mutation UpdatePostRecentUpdates($id: ID!, $updates: Json!, $timestamp: DateTime!) {
    updatePost(
      where: { id: $id }
      data: { 
        recentUpdates: $updates
        aiLastUpdated: $timestamp 
      }
    ) {
      id
      slug
    }
    publishPost(where: { id: $id }) {
      id
    }
  }
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify authorization
  const authHeader = req.headers.authorization;
  const providedSecret = authHeader?.replace("Bearer ", "");

  if (!AI_UPDATE_SECRET) {
    console.error("[AI Update] AI_UPDATE_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (providedSecret !== AI_UPDATE_SECRET) {
    console.error("[AI Update] Unauthorized request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = getHygraphClient();
  if (!client) {
    return res.status(500).json({ error: "Hygraph client initialization failed" });
  }

  const results = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    updates: [],
  };

  try {
    // Fetch posts with AI updates enabled
    console.log("[AI Update] Fetching AI-enabled posts...");
    const data = await client.request(GET_AI_ENABLED_POSTS);
    const posts = data?.posts || [];

    if (posts.length === 0) {
      console.log("[AI Update] No posts with aiAutoUpdate enabled");
      return res.status(200).json({
        success: true,
        message: "No posts to update",
        results,
      });
    }

    console.log(`[AI Update] Found ${posts.length} posts to process`);

    // Process each post
    for (const post of posts) {
      results.processed++;

      try {
        // Check if post was updated recently (within 20 hours to allow some buffer)
        if (post.aiLastUpdated) {
          const lastUpdate = new Date(post.aiLastUpdated);
          const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate < 20) {
            console.log(`[AI Update] Skipping ${post.slug} - updated ${hoursSinceUpdate.toFixed(1)} hours ago`);
            results.skipped++;
            continue;
          }
        }

        console.log(`[AI Update] Generating update for: ${post.slug}`);

        // Generate update using Perplexity
        const updateResult = await generatePostUpdate(
          post.title,
          post.excerpt,
          "" // We don't need full content for updates
        );

        if (!updateResult) {
          console.log(`[AI Update] No update generated for: ${post.slug}`);
          results.skipped++;
          continue;
        }

        // Prepare updated recentUpdates array (keep last 5 updates)
        const existingUpdates = Array.isArray(post.recentUpdates) ? post.recentUpdates : [];
        const newUpdates = [
          {
            text: updateResult.update,
            timestamp: updateResult.timestamp,
          },
          ...existingUpdates.slice(0, 4), // Keep only the 4 most recent previous updates
        ];

        // Update post in Hygraph
        await client.request(UPDATE_POST_RECENT, {
          id: post.id,
          updates: newUpdates,
          timestamp: updateResult.timestamp,
        });

        console.log(`[AI Update] Updated: ${post.slug}`);
        results.updated++;
        results.updates.push({
          slug: post.slug,
          update: updateResult.update.slice(0, 100) + "...",
        });

        // Rate limiting - wait 2 seconds between API calls
        if (results.processed < posts.length) {
          await delay(2000);
        }
      } catch (postError) {
        console.error(`[AI Update] Error processing ${post.slug}:`, postError.message);
        results.errors.push({
          slug: post.slug,
          error: postError.message,
        });
      }
    }

    console.log(`[AI Update] Completed: ${results.updated} updated, ${results.skipped} skipped`);

    return res.status(200).json({
      success: true,
      message: `Processed ${results.processed} posts`,
      results,
    });
  } catch (error) {
    console.error("[AI Update] Fatal error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      results,
    });
  }
}
