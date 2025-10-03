#!/usr/bin/env node

/**
 * TinyURL Free Version Test Script
 * Tests and monitors your TinyURL integration
 */

const tinyUrlService = require("../services/tinyurl").default;

async function testTinyURLIntegration() {
  console.log("🧪 Testing TinyURL Integration (Free Version)\n");

  // 1. Check configuration
  console.log("1. 📋 Configuration Check:");
  const stats = tinyUrlService.getStats();
  console.log("   - API Key configured:", stats.apiKeyExists ? "✅" : "❌");
  console.log("   - Service configured:", stats.isConfigured ? "✅" : "❌");
  console.log("   - Cache size:", stats.cacheSize);
  console.log("   - Rate limiter:", stats.rateLimiter);
  console.log("");

  // 2. Test rate limiting
  console.log("2. 🚦 Rate Limiting Test:");
  const rateLimitStatus = tinyUrlService.getRateLimitStatus();
  console.log(
    "   - Requests in current window:",
    rateLimitStatus.requestsInWindow
  );
  console.log("   - Max requests allowed:", rateLimitStatus.maxRequests);
  console.log(
    "   - Can make request:",
    rateLimitStatus.canMakeRequest ? "✅" : "❌"
  );
  console.log("   - Next reset in:", rateLimitStatus.nextResetIn, "ms");
  console.log("");

  // 3. Test URL shortening
  console.log("3. 🔗 URL Shortening Test:");

  const testPost = {
    slug: "test-post-free-version-" + Date.now(),
    title: "Test Post for Free TinyURL Version",
  };

  console.log("   Testing post:", testPost.slug);

  try {
    const startTime = Date.now();
    const shortUrl = await tinyUrlService.shortenPostUrl(
      testPost,
      "https://blog.urtechy.com"
    );
    const duration = Date.now() - startTime;

    const longUrl = `https://blog.urtechy.com/post/${testPost.slug}`;
    const isShortened = shortUrl !== longUrl;

    console.log("   - Duration:", duration + "ms");
    console.log("   - Long URL:", longUrl);
    console.log("   - Short URL:", shortUrl);
    console.log("   - Actually shortened:", isShortened ? "✅" : "❌");
    console.log(
      "   - URL savings:",
      longUrl.length - shortUrl.length,
      "characters"
    );
  } catch (error) {
    console.error("   - Error:", error.message);
  }
  console.log("");

  // 4. Test caching
  console.log("4. 💾 Cache Test:");
  console.log("   Testing cache with same URL...");

  try {
    const startTime = Date.now();
    const cachedUrl = await tinyUrlService.shortenPostUrl(
      testPost,
      "https://blog.urtechy.com"
    );
    const duration = Date.now() - startTime;

    console.log("   - Duration (cached):", duration + "ms");
    console.log("   - Cached URL:", cachedUrl);
    console.log("   - Cache working:", duration < 100 ? "✅" : "❌");
  } catch (error) {
    console.error("   - Cache error:", error.message);
  }
  console.log("");

  // 5. Final statistics
  console.log("5. 📊 Final Statistics:");
  const finalStats = tinyUrlService.getStats();
  const finalRateLimit = tinyUrlService.getRateLimitStatus();

  console.log("   - Cache size after test:", finalStats.cacheSize);
  console.log("   - API requests made:", finalRateLimit.requestsInWindow);
  console.log(
    "   - Remaining requests:",
    finalRateLimit.maxRequests - finalRateLimit.requestsInWindow
  );
  console.log("");

  console.log("🏁 Test completed!");

  // Recommendations for free version
  console.log("\n💡 Free Version Recommendations:");
  console.log("   - Cache is critical to avoid API calls");
  console.log("   - Rate limit: 2 requests per minute (120/hour)");
  console.log("   - Use auto-generated aliases for better success");
  console.log("   - Graceful fallback to original URLs");
  console.log("   - Monitor rate limits in production");
}

// Run the test
testTinyURLIntegration().catch(console.error);
