// API route to generate FAQs for blog posts using Perplexity AI
// Saves FAQs to Hygraph for permanent storage and SSR support

import { generateFAQs, getFallbackFAQs } from "../../lib/perplexity";
import { GraphQLClient } from "graphql-request";

// Hygraph API configuration
const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// GraphQL client for mutations (needs auth token)
const getHygraphClient = () => {
  if (!HYGRAPH_CONTENT_API || !HYGRAPH_AUTH_TOKEN) {
    console.error("[FAQ API] Missing Hygraph credentials");
    return null;
  }
  
  return new GraphQLClient(HYGRAPH_CONTENT_API, {
    headers: {
      Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
    },
  });
};

// Mutation to update post with FAQs
const UPDATE_POST_FAQS = `
  mutation UpdatePostFaqs($slug: String!, $faQs: Json!) {
    updatePost(where: { slug: $slug }, data: { faQs: $faQs }) {
      id
      slug
      faQs
    }
    publishPost(where: { slug: $slug }) {
      id
    }
  }
`;

// Query to check if FAQs already exist
const GET_POST_FAQS = `
  query GetPostFaqs($slug: String!) {
    post(where: { slug: $slug }) {
      id
      faQs
    }
  }
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { slug, title, excerpt, content } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: "Missing required fields: slug, title" });
    }

    const client = getHygraphClient();

    // Check if FAQs already exist in Hygraph
    if (client) {
      try {
        const existingData = await client.request(GET_POST_FAQS, { slug });
        
        if (existingData?.post?.faQs && Array.isArray(existingData.post.faQs) && existingData.post.faQs.length > 0) {
          console.log(`[FAQ API] Hygraph HIT for: ${slug}`);
          return res.status(200).json({
            success: true,
            faqs: existingData.post.faQs,
            source: "hygraph",
          });
        }
      } catch (queryError) {
        console.warn(`[FAQ API] Hygraph query failed:`, queryError.message);
        // Continue to generate new FAQs
      }
    }

    console.log(`[FAQ API] Generating new FAQs for: ${slug}`);

    // Generate FAQs using Perplexity
    const faqs = await generateFAQs(title, excerpt, content);

    if (faqs && faqs.length > 0) {
      // Save to Hygraph
      if (client) {
        try {
          await client.request(UPDATE_POST_FAQS, { 
            slug, 
            faQs: faqs 
          });
          console.log(`[FAQ API] Saved to Hygraph: ${slug}`);
        } catch (saveError) {
          console.error(`[FAQ API] Hygraph save failed:`, saveError.message);
          // Continue even if save fails - return the generated FAQs
        }
      }

      return res.status(200).json({
        success: true,
        faqs,
        source: "perplexity",
      });
    }

    // If generation failed, use fallback FAQs (don't save fallbacks)
    console.log(`[FAQ API] Using fallback FAQs for: ${slug}`);
    const fallbackFaqs = getFallbackFAQs(title);

    return res.status(200).json({
      success: true,
      faqs: fallbackFaqs,
      source: "fallback",
    });
  } catch (error) {
    console.error("[FAQ API] Error:", error.message);

    // Return fallback on error
    const { title = "this topic" } = req.body || {};
    const fallbackFaqs = getFallbackFAQs(title);

    return res.status(200).json({
      success: false,
      faqs: fallbackFaqs,
      source: "fallback",
      error: error.message,
    });
  }
}
