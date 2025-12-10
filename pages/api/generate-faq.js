// API route to generate FAQs for blog posts using Perplexity AI
// Uses Firebase Firestore for permanent storage (no expiry)

import { generateFAQs, getFallbackFAQs } from "../../lib/perplexity";

// Firestore collection name
const FAQ_COLLECTION = "faqs";

// Lazy import Firebase to avoid SSR issues
let db = null;
let docFn = null;
let getDocFn = null;
let setDocFn = null;

async function initFirestore() {
  if (db) return true;
  
  try {
    const firebase = await import("../../lib/firebase");
    const firestore = await import("firebase/firestore");
    
    db = firebase.db;
    docFn = firestore.doc;
    getDocFn = firestore.getDoc;
    setDocFn = firestore.setDoc;
    
    return true;
  } catch (error) {
    console.error("[FAQ API] Failed to initialize Firestore:", error.message);
    return false;
  }
}

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

    // Try to initialize Firestore
    const firestoreReady = await initFirestore();

    // Check Firestore for existing FAQs
    if (firestoreReady && db && docFn && getDocFn) {
      try {
        const docRef = docFn(db, FAQ_COLLECTION, slug);
        const docSnap = await getDocFn(docRef);

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
    }

    console.log(`[FAQ API] Generating new FAQs for: ${slug}`);

    // Generate FAQs using Perplexity
    const faqs = await generateFAQs(title, excerpt, content);

    if (faqs && faqs.length > 0) {
      // Save to Firestore permanently if available
      const faqData = {
        faqs,
        post_title: title,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (firestoreReady && db && docFn && setDocFn) {
        try {
          const docRef = docFn(db, FAQ_COLLECTION, slug);
          await setDocFn(docRef, faqData);
          console.log(`[FAQ API] Saved to Firestore: ${slug}`);
        } catch (saveError) {
          console.error(`[FAQ API] Firestore save failed:`, saveError.message);
          // Continue even if save fails - return the generated FAQs
        }
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
