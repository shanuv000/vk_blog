// API route to generate FAQs for blog posts using Perplexity AI
// Uses Firebase Firestore for permanent storage (no expiry)

import { generateFAQs, getFallbackFAQs } from "../../lib/perplexity";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Firestore collection name
const FAQ_COLLECTION = "faqs";

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

    // Check Firestore for existing FAQs
    try {
      const docRef = doc(db, FAQ_COLLECTION, slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`[FAQ API] Firestore HIT for: ${slug}`);
        return res.status(200).json({
          success: true,
          faqs: data.faqs,
          source: "firestore",
          generated_at: data.generated_at,
        });
      }
    } catch (firestoreError) {
      console.warn(`[FAQ API] Firestore read failed:`, firestoreError.message);
      // Continue to generate new FAQs
    }

    console.log(`[FAQ API] Generating new FAQs for: ${slug}`);

    // Generate FAQs using Perplexity
    const faqs = await generateFAQs(title, excerpt, content);

    if (faqs && faqs.length > 0) {
      // Save to Firestore permanently
      const faqData = {
        faqs,
        post_title: title,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const docRef = doc(db, FAQ_COLLECTION, slug);
        await setDoc(docRef, faqData);
        console.log(`[FAQ API] Saved to Firestore: ${slug}`);
      } catch (saveError) {
        console.error(`[FAQ API] Firestore save failed:`, saveError.message);
        // Continue even if save fails - return the generated FAQs
      }

      return res.status(200).json({
        success: true,
        faqs,
        source: "perplexity",
        generated_at: faqData.generated_at,
      });
    }

    // If generation failed, use fallback FAQs (don't save fallbacks)
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
