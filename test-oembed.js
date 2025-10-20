#!/usr/bin/env node

/**
 * Test script for Twitter oEmbed API endpoint
 * Run with: node test-oembed.js
 */

const http = require("http");

const PORT = 3001;
const TWEET_ID = "1790555395041472948";
const path = `/api/twitter/oembed/${TWEET_ID}`;

console.log("🧪 Testing Twitter oEmbed API Endpoint\n");
console.log(`📍 URL: http://localhost:${PORT}${path}\n`);

const options = {
  hostname: "localhost",
  port: PORT,
  path: path,
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`);
  console.log(`   Cache-Control: ${res.headers["cache-control"] || "Not set"}`);
  console.log(`   X-Cache: ${res.headers["x-cache"] || "Not set"}`);
  console.log(`   X-Cache-Age: ${res.headers["x-cache-age"] || "Not set"}`);
  console.log(`   Content-Type: ${res.headers["content-type"]}\n`);

  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const json = JSON.parse(data);

      console.log("📦 Response Data:");

      if (json.error) {
        console.log(`   ❌ Error: ${json.error}`);
        if (json.details) {
          console.log(`   Details: ${json.details}`);
        }
      } else {
        console.log(`   ✅ Has HTML: ${!!json.html}`);
        console.log(`   📏 HTML Length: ${json.html?.length || 0} characters`);
        console.log(`   👤 Author: ${json.author_name || "Not available"}`);
        console.log(`   🔗 Author URL: ${json.author_url || "Not available"}`);
        console.log(`   🏢 Provider: ${json.provider_name || "Not available"}`);
        console.log(
          `   📦 Cache Version: ${json.cache_version || "Not available"}`
        );

        if (json._stale) {
          console.log(
            `   ⚠️  Serving stale cache (cached at: ${json._cachedAt})`
          );
        }

        // Show first 200 chars of HTML
        if (json.html) {
          console.log(`\n   📄 HTML Preview (first 200 chars):`);
          console.log(`   ${json.html.substring(0, 200)}...`);
        }
      }

      console.log("\n✨ Test completed successfully!");
    } catch (err) {
      console.error("❌ Failed to parse JSON response:", err.message);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (err) => {
  console.error("❌ Request failed:", err.message);
  console.log("\n💡 Make sure the dev server is running on port 3001");
  console.log("   Run: npm run dev");
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error("❌ Request timed out after 10 seconds");
  req.destroy();
  process.exit(1);
});

req.end();
