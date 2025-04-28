// Advanced script to test fetching a post directly from Hygraph using multiple methods
// Run with: node test-fetch-post-advanced.js your-post-slug

// Import required modules
const { GraphQLClient, gql } = require('graphql-request');

// Get the post slug from command line arguments
const postSlug = process.argv[2];

if (!postSlug) {
  console.error('Please provide a post slug as an argument');
  console.error('Example: node test-fetch-post-advanced.js your-post-slug');
  process.exit(1);
}

// Hygraph API endpoints - replace with your actual endpoints
const HYGRAPH_CDN_API = 'https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master';
const HYGRAPH_CONTENT_API = 'https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master';

// Create clients
const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);
const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API);

// Direct query to fetch post details
const directQuery = gql`
  query GetPostDetails($slug: String!) {
    post(where: { slug: $slug }) {
      title
      excerpt
      featuredImage {
        url
      }
      author {
        name
        bio
        photo {
          url
        }
      }
      createdAt
      publishedAt
      slug
      content {
        raw
      }
      categories {
        name
        slug
      }
    }
  }
`;

// Alternative query that uses posts collection
const alternativeQuery = gql`
  query GetPostDetailsAlternative($slug: String!) {
    posts(where: { slug: $slug }, first: 1) {
      title
      excerpt
      featuredImage {
        url
      }
      author {
        name
        bio
        photo {
          url
        }
      }
      createdAt
      publishedAt
      slug
      content {
        raw
      }
      categories {
        name
        slug
      }
    }
  }
`;

// Function to fetch from CDN with direct query
async function fetchFromCDNDirect() {
  try {
    console.log(`Fetching post from CDN API (direct query): ${postSlug}`);
    const result = await cdnClient.request(directQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error('Error fetching from CDN (direct query):', error.message);
    return null;
  }
}

// Function to fetch from CDN with alternative query
async function fetchFromCDNAlternative() {
  try {
    console.log(`Fetching post from CDN API (alternative query): ${postSlug}`);
    const result = await cdnClient.request(alternativeQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error('Error fetching from CDN (alternative query):', error.message);
    return null;
  }
}

// Function to fetch from Content API with direct query
async function fetchFromContentAPIDirect() {
  try {
    console.log(`Fetching post from Content API (direct query): ${postSlug}`);
    const result = await contentClient.request(directQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error('Error fetching from Content API (direct query):', error.message);
    return null;
  }
}

// Function to fetch from Content API with alternative query
async function fetchFromContentAPIAlternative() {
  try {
    console.log(`Fetching post from Content API (alternative query): ${postSlug}`);
    const result = await contentClient.request(alternativeQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error('Error fetching from Content API (alternative query):', error.message);
    return null;
  }
}

// Helper function to display post data
function displayPostData(source, post) {
  console.log(`\n✅ Post found in ${source}`);
  console.log('Title:', post.title);
  console.log('Created At:', post.createdAt);
  console.log('Published At:', post.publishedAt);
  if (post.categories && post.categories.length > 0) {
    console.log('Categories:', post.categories.map(c => c.name).join(', '));
  }
}

// Main function
async function main() {
  console.log(`Testing fetch for post slug: ${postSlug}`);
  
  // Try all methods one by one
  
  // 1. CDN Direct Query
  const cdnDirectResult = await fetchFromCDNDirect();
  if (cdnDirectResult && cdnDirectResult.post) {
    displayPostData('CDN API (direct query)', cdnDirectResult.post);
  } else {
    console.log('\n❌ Post not found in CDN API using direct query');
    
    // 2. CDN Alternative Query
    const cdnAltResult = await fetchFromCDNAlternative();
    if (cdnAltResult && cdnAltResult.posts && cdnAltResult.posts.length > 0) {
      displayPostData('CDN API (alternative query)', cdnAltResult.posts[0]);
    } else {
      console.log('\n❌ Post not found in CDN API using alternative query');
      
      // 3. Content API Direct Query
      const contentDirectResult = await fetchFromContentAPIDirect();
      if (contentDirectResult && contentDirectResult.post) {
        displayPostData('Content API (direct query)', contentDirectResult.post);
      } else {
        console.log('\n❌ Post not found in Content API using direct query');
        
        // 4. Content API Alternative Query
        const contentAltResult = await fetchFromContentAPIAlternative();
        if (contentAltResult && contentAltResult.posts && contentAltResult.posts.length > 0) {
          displayPostData('Content API (alternative query)', contentAltResult.posts[0]);
        } else {
          console.log('\n❌ Post not found in Content API using alternative query');
          console.log('\n❌ All methods failed. This suggests the post does not exist in Hygraph or has a different slug.');
        }
      }
    }
  }
  
  console.log('\nTest complete.');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
