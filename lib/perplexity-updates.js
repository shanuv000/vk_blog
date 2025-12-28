// Perplexity API utility for generating post updates
// Uses the sonar model to generate recent news/event updates for blog posts

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Generate a recent update for a blog post using Perplexity AI
 * @param {string} title - Post title
 * @param {string} excerpt - Post excerpt/summary
 * @param {string} existingContent - Current post content (truncated)
 * @returns {Promise<{update: string, timestamp: string} | null>}
 */
export async function generatePostUpdate(title, excerpt, existingContent = "") {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn("[Perplexity Updates] API key not configured");
    return null;
  }

  // Truncate content to save tokens
  const truncatedContent = existingContent.slice(0, 500);

  const systemPrompt = `You are a news analyst for a tech/news blog. Your task is to provide a brief update on recent developments related to the given article topic.

Rules:
- Write exactly 3-4 sentences about recent news or developments related to the topic
- Focus ONLY on events from the last 7 days
- Be factual and informative
- If there are no significant recent developments, say "No significant updates at this time."
- Do NOT repeat information from the original article
- Do NOT include any citations, references, or bracketed numbers like [1] [2] [3]
- Use present tense for current events
- Keep the tone professional and engaging

Formatting:
- Use **bold** ONLY for important dates, numbers, scores, or key names (max 2-3 per update)
- Keep most text plain - do NOT overuse formatting
- Never use headers, bullet points, or other markdown

Return ONLY the update text with minimal bold highlights for key facts.`;

  const userPrompt = `Generate a recent update for this article:

Title: ${title}

Summary: ${excerpt || "No summary available"}

Content excerpt: ${truncatedContent}

What are the latest developments or news related to this topic in the last week?`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Perplexity Updates] API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[Perplexity Updates] No content in response");
      return null;
    }

    // Clean the response - remove citations like [1], [2], [3] etc.
    let cleanedUpdate = content
      .trim()
      .replace(/\[\d+\]/g, "")           // Remove [1], [2], etc.
      .replace(/\[\d+,\s*\d+\]/g, "")    // Remove [1, 2] format
      .replace(/\s{2,}/g, " ")           // Clean up extra spaces
      .trim();

    // Skip if no meaningful update
    if (
      cleanedUpdate.toLowerCase().includes("no significant updates") ||
      cleanedUpdate.length < 50
    ) {
      console.log(`[Perplexity Updates] No updates for: ${title.slice(0, 50)}...`);
      return null;
    }

    console.log(`[Perplexity Updates] Generated update for: ${title.slice(0, 50)}...`);
    
    return {
      update: cleanedUpdate,
      timestamp: new Date().toISOString(),
      generatedAt: Date.now(),
    };
  } catch (error) {
    console.error("[Perplexity Updates] Request failed:", error.message);
    return null;
  }
}

/**
 * Delay utility for rate limiting
 * @param {number} ms - Milliseconds to wait
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { generatePostUpdate, delay };
