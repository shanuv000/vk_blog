// Script to test fetching a post directly from Hygraph
// Run with: node test-fetch-post.js your-post-slug

// Import required modules
const { GraphQLClient, gql } = require("graphql-request");

// Get the post slug from command line arguments
const postSlug = process.argv[2];

if (!postSlug) {
  console.error("Please provide a post slug as an argument");
  console.error("Example: node test-fetch-post.js your-post-slug");
  process.exit(1);
}

// Hygraph API endpoints - replace with your actual endpoints
const HYGRAPH_CDN_API =
  "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master";
const HYGRAPH_CONTENT_API =
  "https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master";

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

// Function to fetch from CDN
async function fetchFromCDN() {
  try {
    console.log(`Fetching post from CDN API: ${postSlug}`);
    const result = await cdnClient.request(directQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error("Error fetching from CDN:", error.message);
    return null;
  }
}

// Function to fetch from Content API
async function fetchFromContentAPI() {
  try {
    console.log(`Fetching post from Content API: ${postSlug}`);
    const result = await contentClient.request(directQuery, { slug: postSlug });
    return result;
  } catch (error) {
    console.error("Error fetching from Content API:", error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log(`Testing fetch for post slug: ${postSlug}`);

  // Try CDN first
  const cdnResult = await fetchFromCDN();

  if (cdnResult && cdnResult.post) {
    console.log("\n✅ Post found in CDN API");
    console.log("Title:", cdnResult.post.title);
    console.log("Created At:", cdnResult.post.createdAt);
    console.log("Published At:", cdnResult.post.publishedAt);
    console.log(
      "Categories:",
      cdnResult.post.categories.map((c) => c.name).join(", ")
    );
  } else {
    console.log("\n❌ Post not found in CDN API");

    // Try Content API as fallback
    const contentResult = await fetchFromContentAPI();

    if (contentResult && contentResult.post) {
      console.log("\n✅ Post found in Content API");
      console.log("Title:", contentResult.post.title);
      console.log("Created At:", contentResult.post.createdAt);
      console.log("Published At:", contentResult.post.publishedAt);
      console.log(
        "Categories:",
        contentResult.post.categories.map((c) => c.name).join(", ")
      );
    } else {
      console.log("\n❌ Post not found in Content API either");
      console.log(
        "This suggests the post does not exist in Hygraph or has a different slug."
      );
    }
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
});
