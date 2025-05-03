import { GraphQLClient } from "graphql-request";

// Get the Hygraph API endpoint from environment variables
const graphqlAPI = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
const authToken = process.env.NEXT_PUBLIC_HYGRAPH_TOKEN;

// Determine if we're running in the browser
const isBrowser = typeof window !== "undefined";

// For client-side requests, use our proxy API to avoid CORS issues
// For server-side requests, use the direct API
export const graphQLClient = new GraphQLClient(
  isBrowser ? "/api/hygraph-proxy" : graphqlAPI,
  {
    headers: authToken
      ? {
          authorization: `Bearer ${authToken}`,
        }
      : {},
  }
);
