// Simple script to test the revalidation API
// Run with: node test-revalidation.js

const https = require("https");

// Replace with your actual token
const REVALIDATION_TOKEN =
  "19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35";

// Function to make a GET request to the revalidation API
function testRevalidation(path = null, slug = null, category = null) {
  let url = `https://onlyblog.vercel.app/api/revalidate?secret=${REVALIDATION_TOKEN}`;

  if (path) url += `&path=${path}`;
  if (slug) url += `&slug=${slug}`;
  if (category) url += `&category=${category}`;

  console.log(`Testing revalidation with URL: ${url}`);

  https
    .get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Status code: ${res.statusCode}`);
        try {
          const parsedData = JSON.parse(data);
          console.log("Response:", JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.log("Raw response:", data);
        }
      });
    })
    .on("error", (err) => {
      console.error("Error:", err.message);
    });
}

// Test cases
console.log("1. Testing home page revalidation...");
testRevalidation();

// Uncomment and modify these to test specific pages
// setTimeout(() => {
//   console.log('\n2. Testing specific post revalidation...');
//   testRevalidation(null, 'your-post-slug');
// }, 2000);

// setTimeout(() => {
//   console.log('\n3. Testing category revalidation...');
//   testRevalidation(null, null, 'your-category-slug');
// }, 4000);

console.log("\nTests initiated. Check the output above for results.");
