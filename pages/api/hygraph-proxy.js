// Next.js API route to proxy requests to Hygraph
// This avoids CORS issues when fetching from the client side

import { GraphQLClient } from 'graphql-request';

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the query and variables from the request body
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Create a GraphQL client for Hygraph CDN
    const hygraphCdnEndpoint = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
    const client = new GraphQLClient(hygraphCdnEndpoint);

    // Execute the query
    const data = await client.request(query, variables);

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying request to Hygraph:', error);
    
    // Try to extract meaningful error information
    const errorMessage = error.response?.errors?.[0]?.message || error.message || 'Unknown error';
    const statusCode = error.response?.status || 500;
    
    return res.status(statusCode).json({ 
      message: 'Error fetching data from Hygraph',
      error: errorMessage
    });
  }
}
