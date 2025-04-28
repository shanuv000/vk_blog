// Script to test fetching category posts from Hygraph
// Run with: node test-fetch-category.js category-slug

// Import required modules
const { GraphQLClient, gql } = require('graphql-request');

// Get the category slug from command line arguments
const categorySlug = process.argv[2];

if (!categorySlug) {
  console.error('Please provide a category slug as an argument');
  console.error('Example: node test-fetch-category.js education');
  process.exit(1);
}

// Hygraph API endpoints - replace with your actual endpoints
const HYGRAPH_CDN_API = 'https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master';
const HYGRAPH_CONTENT_API = 'https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master';

// Create clients
const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);
const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API);

// Standard query using postsConnection
const standardQuery = gql`
  query GetCategoryPost($slug: String!) {
    postsConnection(
      where: { categories_some: { slug: $slug } }
      orderBy: createdAt_DESC
    ) {
      edges {
        cursor
        node {
          author {
            name
          }
          createdAt
          publishedAt
          slug
          title
          excerpt
          featuredImage {
            url
          }
          categories {
            name
            slug
          }
        }
      }
    }
  }
`;

// Alternative query that doesn't filter by date
const alternativeQuery = gql`
  query GetCategoryPostAlternative($slug: String!) {
    categories(where: { slug: $slug }) {
      name
      posts {
        author {
          name
        }
        createdAt
        publishedAt
        slug
        title
        excerpt
        featuredImage {
          url
        }
        categories {
          name
          slug
        }
      }
    }
  }
`;

// Function to fetch from CDN with standard query
async function fetchFromCDNStandard() {
  try {
    console.log(`Fetching category posts from CDN API (standard query): ${categorySlug}`);
    const result = await cdnClient.request(standardQuery, { slug: categorySlug });
    return result;
  } catch (error) {
    console.error('Error fetching from CDN (standard query):', error.message);
    return null;
  }
}

// Function to fetch from CDN with alternative query
async function fetchFromCDNAlternative() {
  try {
    console.log(`Fetching category posts from CDN API (alternative query): ${categorySlug}`);
    const result = await cdnClient.request(alternativeQuery, { slug: categorySlug });
    return result;
  } catch (error) {
    console.error('Error fetching from CDN (alternative query):', error.message);
    return null;
  }
}

// Function to fetch from Content API with standard query
async function fetchFromContentAPIStandard() {
  try {
    console.log(`Fetching category posts from Content API (standard query): ${categorySlug}`);
    const result = await contentClient.request(standardQuery, { slug: categorySlug });
    return result;
  } catch (error) {
    console.error('Error fetching from Content API (standard query):', error.message);
    return null;
  }
}

// Function to fetch from Content API with alternative query
async function fetchFromContentAPIAlternative() {
  try {
    console.log(`Fetching category posts from Content API (alternative query): ${categorySlug}`);
    const result = await contentClient.request(alternativeQuery, { slug: categorySlug });
    return result;
  } catch (error) {
    console.error('Error fetching from Content API (alternative query):', error.message);
    return null;
  }
}

// Helper function to display posts
function displayPosts(source, posts) {
  console.log(`\n✅ Found ${posts.length} posts in ${source}`);
  posts.forEach((post, index) => {
    console.log(`\n${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Created: ${post.createdAt}`);
    console.log(`   Published: ${post.publishedAt || 'Not published'}`);
    if (post.categories && post.categories.length > 0) {
      console.log(`   Categories: ${post.categories.map(c => c.name).join(', ')}`);
    }
  });
}

// Main function
async function main() {
  console.log(`Testing fetch for category slug: ${categorySlug}`);
  
  // Try all methods one by one
  
  // 1. CDN Standard Query
  const cdnStandardResult = await fetchFromCDNStandard();
  if (cdnStandardResult && 
      cdnStandardResult.postsConnection && 
      cdnStandardResult.postsConnection.edges && 
      cdnStandardResult.postsConnection.edges.length > 0) {
    
    const posts = cdnStandardResult.postsConnection.edges.map(edge => edge.node);
    displayPosts('CDN API (standard query)', posts);
  } else {
    console.log('\n❌ No posts found in CDN API using standard query');
    
    // 2. CDN Alternative Query
    const cdnAltResult = await fetchFromCDNAlternative();
    if (cdnAltResult && 
        cdnAltResult.categories && 
        cdnAltResult.categories.length > 0 && 
        cdnAltResult.categories[0].posts && 
        cdnAltResult.categories[0].posts.length > 0) {
      
      displayPosts('CDN API (alternative query)', cdnAltResult.categories[0].posts);
    } else {
      console.log('\n❌ No posts found in CDN API using alternative query');
      
      // 3. Content API Standard Query
      const contentStandardResult = await fetchFromContentAPIStandard();
      if (contentStandardResult && 
          contentStandardResult.postsConnection && 
          contentStandardResult.postsConnection.edges && 
          contentStandardResult.postsConnection.edges.length > 0) {
        
        const posts = contentStandardResult.postsConnection.edges.map(edge => edge.node);
        displayPosts('Content API (standard query)', posts);
      } else {
        console.log('\n❌ No posts found in Content API using standard query');
        
        // 4. Content API Alternative Query
        const contentAltResult = await fetchFromContentAPIAlternative();
        if (contentAltResult && 
            contentAltResult.categories && 
            contentAltResult.categories.length > 0 && 
            contentAltResult.categories[0].posts && 
            contentAltResult.categories[0].posts.length > 0) {
          
          displayPosts('Content API (alternative query)', contentAltResult.categories[0].posts);
        } else {
          console.log('\n❌ No posts found in Content API using alternative query');
          console.log('\n❌ All methods failed. This suggests the category does not exist or has no posts.');
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
