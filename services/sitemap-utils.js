// Helper functions for sitemap generation
const { gql } = require("graphql-request");
const { GraphQLClient } = require("graphql-request");

// Create a client for the CDN API (read-only operations)
const cdnClient = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_CDN_API || process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT);

async function getNewsArticles() {
  const query = gql`
    query GetNewsArticles {
      postsConnection(first: 100, orderBy: createdAt_DESC) {
        edges {
          node {
            slug
            title
            createdAt
          }
        }
      }
    }
  `;

  try {
    const result = await cdnClient.request(query);
    return result.postsConnection.edges.map(({ node }) => ({
      loc: `https://onlyblog.vercel.app/${node.slug}`,
      publication_date: node.createdAt,
      title: node.title,
    }));
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    return [];
  }
}

module.exports = {
  getNewsArticles,
};
