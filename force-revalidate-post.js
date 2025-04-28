// Script to force revalidation of a specific post
// Run with: node force-revalidate-post.js your-post-slug

const https = require('https');

// Get the post slug from command line arguments
const postSlug = process.argv[2];

if (!postSlug) {
  console.error('Please provide a post slug as an argument');
  console.error('Example: node force-revalidate-post.js up-board-10th-result');
  process.exit(1);
}

// Replace with your actual token
const REVALIDATION_TOKEN = '19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35';

// Function to revalidate the home page
function revalidateHome() {
  return new Promise((resolve, reject) => {
    const url = `https://onlyblog.vercel.app/api/revalidate?secret=${REVALIDATION_TOKEN}`;
    
    console.log(`Revalidating home page...`);
    console.log(`URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('Home page revalidation response:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (e) {
          console.log('Raw response:', data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('Error revalidating home page:', err.message);
      reject(err);
    });
  });
}

// Function to revalidate a specific post
function revalidatePost(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://onlyblog.vercel.app/api/revalidate?secret=${REVALIDATION_TOKEN}&slug=${slug}`;
    
    console.log(`Revalidating post: ${slug}`);
    console.log(`URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('Post revalidation response:', JSON.stringify(parsedData, null, 2));
          
          if (parsedData.paths && parsedData.paths.includes(`/post/${slug}`)) {
            console.log(`\n✅ Success! The post page was revalidated.`);
          } else {
            console.log(`\n❌ Error: The post page was not included in the revalidated paths.`);
          }
          
          resolve(parsedData);
        } catch (e) {
          console.log('Raw response:', data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('Error revalidating post:', err.message);
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    console.log(`Force revalidating post: ${postSlug}`);
    
    // First revalidate the home page
    await revalidateHome();
    
    // Then revalidate the specific post
    await revalidatePost(postSlug);
    
    console.log(`\nRevalidation complete. Check your site to see if the post is now visible.`);
    console.log(`Post URL: https://onlyblog.vercel.app/post/${postSlug}`);
    
  } catch (error) {
    console.error('Error during revalidation:', error);
  }
}

// Run the main function
main();
