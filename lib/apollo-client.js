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
            // Cache for 6 hours (21600 seconds) - increased from 2 hours
            maxAge: 21600,
          },
          // Configure caching for categories
          categories: {
            // Cache for 12 hours (43200 seconds) - increased from 4 hours
            maxAge: 43200,
          },
          // Configure caching for individual posts
          post: {
            // Cache for 6 hours (21600 seconds) - increased from 3 hours
            maxAge: 21600,
            // Read function to check if we have the post in cache
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Post",
                slug: args?.where?.slug,
              });
            },
          },
          // Configure caching for similar posts
          posts: {
            // Cache for 6 hours (21600 seconds)
            maxAge: 21600,
            // Merge function to handle different query parameters
            merge(existing, incoming, { args }) {
              // If we have args, this is a filtered query (like similar posts)
              if (args && (args.where || args.orderBy)) {
                return incoming;
              }
              // Otherwise, merge with existing data
              return existing ? [...existing, ...incoming] : incoming;
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
            // Cache images for 48 hours (172800 seconds) - increased from 24 hours
            maxAge: 172800,
            // Merge function for featuredImage to handle missing IDs
            merge(existing, incoming) {
              return incoming || existing;
            },
            // Read function to handle null/undefined values
            read(existing) {
              return existing || null;
            },
          },
          // Configure caching for author
          author: {
            // Cache author data for 48 hours
            maxAge: 172800,
          },
          // Configure caching for categories
          categories: {
            // Cache categories for 48 hours
            maxAge: 172800,
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
            // Cache image URLs for 48 hours (172800 seconds) - increased from 24 hours
            maxAge: 172800,
          },
        },
      },
      // Configure caching for Author type
      Author: {
        keyFields: ["id", "name"],
        fields: {
          photo: {
            // Cache author photos for 48 hours
            maxAge: 172800,
          },
        },
      },
      // Configure caching for Category type
      Category: {
        keyFields: ["slug"],
        // Cache categories for 48 hours
        maxAge: 172800,
      },
    },
    // Default cache time for items not specifically configured (4 hours - increased from 1 hour)
    defaultMaxAge: 14400,
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
        // Use cache-first for better performance, only fetch from network when needed
        fetchPolicy: "cache-first",
        // Fall back to cache if network request fails
        nextFetchPolicy: "cache-only",
        // Refetch only when cache is empty or stale
        notifyOnNetworkStatusChange: true,
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
