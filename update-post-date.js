// Script to update the date of a post in Hygraph
// Run with: node update-post-date.js your-post-slug

// Import required modules
const { GraphQLClient, gql } = require('graphql-request');

// Get the post slug from command line arguments
const postSlug = process.argv[2];

if (!postSlug) {
  console.error('Please provide a post slug as an argument');
  console.error('Example: node update-post-date.js up-board-10th-result');
  process.exit(1);
}

// Hygraph API endpoints - replace with your actual endpoints
const HYGRAPH_CONTENT_API = 'https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master';

// You need to provide an auth token with write permissions
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

if (!HYGRAPH_AUTH_TOKEN) {
  console.error('HYGRAPH_AUTH_TOKEN environment variable is required');
  console.error('Run with: HYGRAPH_AUTH_TOKEN=your-token node update-post-date.js your-post-slug');
  process.exit(1);
}

// Create authenticated client
const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
  headers: {
    Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
  },
});

// Query to get the post ID
const getPostQuery = gql`
  query GetPost($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      createdAt
      publishedAt
    }
  }
`;

// Mutation to update the post dates
const updatePostMutation = gql`
  mutation UpdatePost($id: ID!, $createdAt: DateTime!, $publishedAt: DateTime!) {
    updatePost(
      where: { id: $id }
      data: { createdAt: $createdAt, publishedAt: $publishedAt }
    ) {
      id
      title
      createdAt
      publishedAt
    }
  }
`;

// Mutation to publish the updated post
const publishPostMutation = gql`
  mutation PublishPost($id: ID!) {
    publishPost(where: { id: $id }, to: PUBLISHED) {
      id
      title
      createdAt
      publishedAt
    }
  }
`;

// Main function
async function main() {
  try {
    console.log(`Updating dates for post: ${postSlug}`);
    
    // Step 1: Get the post ID
    const postData = await contentClient.request(getPostQuery, { slug: postSlug });
    
    if (!postData.post) {
      console.error(`Post not found: ${postSlug}`);
      process.exit(1);
    }
    
    const { id, title, createdAt, publishedAt } = postData.post;
    
    console.log(`Found post: "${title}"`);
    console.log(`Current createdAt: ${createdAt}`);
    console.log(`Current publishedAt: ${publishedAt}`);
    
    // Step 2: Generate new dates (current time)
    const now = new Date().toISOString();
    
    // Step 3: Update the post dates
    console.log(`\nUpdating dates to: ${now}`);
    
    const updateResult = await contentClient.request(updatePostMutation, {
      id,
      createdAt: now,
      publishedAt: now,
    });
    
    console.log(`\nPost updated successfully!`);
    console.log(`New createdAt: ${updateResult.updatePost.createdAt}`);
    console.log(`New publishedAt: ${updateResult.updatePost.publishedAt}`);
    
    // Step 4: Publish the updated post
    console.log(`\nPublishing post...`);
    
    const publishResult = await contentClient.request(publishPostMutation, { id });
    
    console.log(`Post published successfully!`);
    console.log(`Final createdAt: ${publishResult.publishPost.createdAt}`);
    console.log(`Final publishedAt: ${publishResult.publishPost.publishedAt}`);
    
    console.log(`\n✅ Post "${title}" has been updated with current dates.`);
    console.log(`You should now be able to view it at: /post/${postSlug}`);
    
  } catch (error) {
    console.error('Error updating post:', error.message);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', error.response.errors);
    }
    process.exit(1);
  }
}

// Run the main function
main();
