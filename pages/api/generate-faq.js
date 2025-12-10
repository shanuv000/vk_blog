// API route to generate FAQs for blog posts using Perplexity AI
// Uses Upstash Redis for persistent caching across serverless instances

import { generateFAQs, getFallbackFAQs } from "../../lib/perplexity";
import { getCachedData, setCachedData } from "../../lib/redis";

// Cache key prefix for FAQs
const FAQ_CACHE_PREFIX = "faq:";
// FAQ cache TTL: 24 hours in seconds
const FAQ_CACHE_TTL = 24 * 60 * 60;

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

    const cacheKey = `${FAQ_CACHE_PREFIX}${slug}`;

    // Check Redis cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      console.log(`[FAQ API] Redis cache HIT for: ${slug}`);
      return res.status(200).json({
        success: true,
        faqs: cached.faqs,
        source: "redis-cache",
        cached_at: cached.cached_at,
      });
    }

    console.log(`[FAQ API] Cache MISS, generating FAQs for: ${slug}`);

    // Generate FAQs using Perplexity
    const faqs = await generateFAQs(title, excerpt, content);

    if (faqs && faqs.length > 0) {
      // Cache the result in Redis for 24 hours
      const cacheData = {
        faqs,
        cached_at: new Date().toISOString(),
      };
      await setCachedData(cacheKey, cacheData, FAQ_CACHE_TTL);

      return res.status(200).json({
        success: true,
        faqs,
        source: "perplexity",
        generated_at: new Date().toISOString(),
      });
    }

    // If generation failed, use fallback FAQs (don't cache fallbacks)
    console.log(`[FAQ API] Using fallback FAQs for: ${slug}`);
    const fallbackFaqs = getFallbackFAQs(title);

    return res.status(200).json({
      success: true,
      faqs: fallbackFaqs,
      source: "fallback",
      generated_at: new Date().toISOString(),
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
