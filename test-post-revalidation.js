// Script to test post revalidation
// Run with: node test-post-revalidation.js your-post-slug

const https = require('https');

// Get the post slug from command line arguments
const postSlug = process.argv[2];

if (!postSlug) {
  console.error('Please provide a post slug as an argument');
  console.error('Example: node test-post-revalidation.js your-post-slug');
  process.exit(1);
}

// Replace with your actual token
const REVALIDATION_TOKEN = '19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35';

// URL for revalidation
const url = `https://onlyblog.vercel.app/api/revalidate?secret=${REVALIDATION_TOKEN}&slug=${postSlug}`;

console.log(`Testing revalidation for post: ${postSlug}`);
console.log(`URL: ${url}`);

// Make the request
https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status code: ${res.statusCode}`);
    try {
      const parsedData = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.paths && parsedData.paths.includes(`/post/${postSlug}`)) {
        console.log('\n✅ Success! The post page was revalidated.');
      } else {
        console.log('\n❌ Error: The post page was not included in the revalidated paths.');
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
