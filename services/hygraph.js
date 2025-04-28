import { GraphQLClient, gql } from 'graphql-request';

// API endpoints
export const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
export const HYGRAPH_CDN_API = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
export const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Create clients for different purposes
export const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
  headers: {
    authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
  },
});

export const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);

// Helper function for read-only operations (uses CDN for better performance)
export const fetchFromCDN = async (query, variables = {}) => {
  try {
    return await cdnClient.request(query, variables);
  } catch (error) {
    console.error('Error fetching from Hygraph CDN:', error);
    throw error;
  }
};

// Helper function for operations that might include mutations (uses Content API)
export const fetchFromContentAPI = async (query, variables = {}) => {
  try {
    return await contentClient.request(query, variables);
  } catch (error) {
    console.error('Error fetching from Hygraph Content API:', error);
    throw error;
  }
};

// Export gql for convenience
export { gql };
