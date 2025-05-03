import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { useMemo } from "react";

// Get the Hygraph API endpoints from environment variables
const HYGRAPH_CDN_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CDN_API ||
  "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master";
const HYGRAPH_CONTENT_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API ||
  "https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master";

// Cache configuration with type policies
const createCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure caching for posts query
          postsConnection: {
            // Merge function for pagination
            merge(existing, incoming) {
              return incoming;
            },
            // Cache for 2 hours (7200 seconds)
            maxAge: 7200,
          },
          // Configure caching for categories
          categories: {
            // Cache for 4 hours (14400 seconds)
            maxAge: 14400,
          },
          // Configure caching for individual posts
          post: {
            // Cache for 3 hours (10800 seconds)
            maxAge: 10800,
            // Read function to check if we have the post in cache
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Post",
                slug: args?.where?.slug,
              });
            },
          },
        },
      },
      // Configure caching for Post type
      Post: {
        // Use slug as the key for identifying posts
        keyFields: ["slug"],
        fields: {
          // Configure caching for featured image
          featuredImage: {
            // Cache images for 24 hours (86400 seconds)
            maxAge: 86400,
            // Merge function for featuredImage to handle missing IDs
            merge(existing, incoming) {
              return incoming || existing;
            },
            // Read function to handle null/undefined values
            read(existing) {
              return existing || null;
            },
          },
        },
      },
      // Configure caching for Asset type (images)
      Asset: {
        // Use url as the key field for Assets that might not have an ID
        keyFields: ["url"],
        // Custom merge function for Assets
        merge(existing, incoming) {
          return { ...existing, ...incoming };
        },
        fields: {
          url: {
            // Cache image URLs for 24 hours (86400 seconds)
            maxAge: 86400,
          },
        },
      },
    },
    // Default cache time for items not specifically configured (1 hour)
    defaultMaxAge: 3600,
  });
};

// Function to create Apollo Client
function createApolloClient() {
  // Error handling link
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        console.error("GraphQL Errors:", graphQLErrors);

        // If there's a specific error that indicates we should retry with content API
        const shouldUseContentAPI = graphQLErrors.some(
          (error) =>
            error.message.includes("rate limit") ||
            error.message.includes("timeout")
        );

        if (shouldUseContentAPI) {
          console.log("Switching to Content API due to CDN error");
          // Modify the operation to use the content API instead
          const contentApiOperation = { ...operation };
          contentApiOperation.setContext({
            uri: HYGRAPH_CONTENT_API,
          });
          return forward(contentApiOperation);
        }
      }

      if (networkError) {
        console.error("Network Error:", networkError);
      }
    }
  );

  // Retry link for transient network issues
  const retryLink = new RetryLink({
    delay: {
      initial: 300, // Initial delay in ms
      max: 3000, // Maximum delay in ms
      jitter: true, // Randomize delay
    },
    attempts: {
      max: 3, // Max number of retries
      retryIf: (error, operation) => {
        // Only retry on network errors or specific GraphQL errors
        return (
          !!error &&
          (error.networkError ||
            (error.graphQLErrors &&
              error.graphQLErrors.some(
                (err) =>
                  err.message.includes("timeout") ||
                  err.message.includes("rate limit")
              )))
        );
      },
    },
  });

  // HTTP link to the Hygraph CDN API
  const httpLink = new HttpLink({
    uri: HYGRAPH_CDN_API,
    // Include credentials for cross-origin requests if needed
    credentials: "same-origin",
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Set to true for SSR
    link: from([errorLink, retryLink, httpLink]),
    cache: createCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
    connectToDevTools:
      process.env.NODE_ENV === "development" && typeof window !== "undefined",
  });
}

// Global variable to store the Apollo Client instance
let apolloClient;

// Function to initialize Apollo Client
export function initializeApollo(initialState = null) {
  // Create a new Apollo Client instance if one doesn't exist
  const _apolloClient = apolloClient ?? createApolloClient();

  // If there's initial state, restore it to the Apollo Client cache
  if (initialState) {
    // Get existing cache
    const existingCache = _apolloClient.cache.extract();

    // Merge the existing cache with the initial state
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSR, always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;

  // For client-side, reuse the Apollo Client instance
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

// React hook to use Apollo Client
export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

// Export a singleton instance for direct imports
const client = initializeApollo();
export default client;
