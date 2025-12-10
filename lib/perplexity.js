// Perplexity API utility for generating FAQs
// Uses the sonar model for cost-efficient, real-time AI responses

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Generate FAQs for a blog post using Perplexity AI
 * @param {string} title - Post title
 * @param {string} excerpt - Post excerpt/summary
 * @param {string} content - Post content (truncated for token efficiency)
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
export async function generateFAQs(title, excerpt, content = "") {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn("[Perplexity] API key not configured");
    return null;
  }

  // Truncate content to ~1000 chars to save tokens
  const truncatedContent = content.slice(0, 1000);

  const systemPrompt = `You are an expert FAQ generator for a tech blog. Generate exactly 5-6 frequently asked questions with concise, helpful answers based on the article provided. 

Rules:
- Questions should be things readers would naturally ask
- Answers should be 1-3 sentences, informative and accurate
- Focus on practical, useful information
- Use simple language suitable for general audience
- Do NOT include questions about the author or website

Return ONLY valid JSON array in this exact format, no other text:
[{"question": "...", "answer": "..."}]`;

  const userPrompt = `Generate FAQs for this article:

Title: ${title}

Summary: ${excerpt || "No summary available"}

Content excerpt: ${truncatedContent}`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Perplexity] API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[Perplexity] No content in response");
      return null;
    }

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const faqs = JSON.parse(cleanContent);
      
      if (!Array.isArray(faqs)) {
        console.error("[Perplexity] Response is not an array");
        return null;
      }

      // Validate FAQ structure
      const validFaqs = faqs.filter(
        (faq) => 
          typeof faq.question === "string" && 
          typeof faq.answer === "string" &&
          faq.question.length > 0 &&
          faq.answer.length > 0
      );

      console.log(`[Perplexity] Generated ${validFaqs.length} FAQs for: ${title.slice(0, 50)}...`);
      return validFaqs;
    } catch (parseError) {
      console.error("[Perplexity] Failed to parse response:", parseError.message);
      console.error("[Perplexity] Raw content:", content.slice(0, 500));
      return null;
    }
  } catch (error) {
    console.error("[Perplexity] Request failed:", error.message);
    return null;
  }
}

/**
 * Get fallback FAQs when API is unavailable
 * @param {string} title - Post title for context
 * @returns {Array<{question: string, answer: string}>}
 */
export function getFallbackFAQs(title) {
  return [
    {
      question: "What is this article about?",
      answer: `This article covers ${title}. Read the full content above for detailed information.`
    },
    {
      question: "How can I learn more about this topic?",
      answer: "Check out our related articles and resources at urTechy for more in-depth coverage."
    },
    {
      question: "Is this information up to date?",
      answer: "We regularly update our content to ensure accuracy. Check the publication date above for the latest update."
    }
  ];
}

export default { generateFAQs, getFallbackFAQs };
