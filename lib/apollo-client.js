import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
} from "@apollo/client";
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

// Log the API endpoints being used
console.log("Using Hygraph CDN API:", HYGRAPH_CDN_API);
console.log("Using Hygraph Content API:", HYGRAPH_CONTENT_API);

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
        // Use name as the key field since id might not be available
        keyFields: ["name"],
        fields: {
          photo: {
            // Cache author photos for 48 hours
            maxAge: 172800,
            // Read function to handle missing fields
            read(existing) {
              return existing || null;
            },
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
  // Error handling link with improved error handling
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      // Log GraphQL errors
      if (graphQLErrors) {
        console.error("GraphQL Errors:", graphQLErrors);

        // Check for specific errors that indicate we should retry with content API
        const shouldUseContentAPI = graphQLErrors.some(
          (error) =>
            error.message.includes("rate limit") ||
            error.message.includes("timeout") ||
            error.message.includes("Server response was missing")
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

      // Handle network errors
      if (networkError) {
        console.error("Network Error:", networkError);

        // For CORS errors, try to recover by using the proxy
        if (
          networkError.message &&
          (networkError.message.includes("CORS") ||
            networkError.message.includes("Failed to fetch"))
        ) {
          console.log(
            `CORS/network error detected, retrying with proxy for ${operation.operationName}`
          );

          // Get current context
          const context = operation.getContext();
          const oldUri = context.uri;

          // Only modify if not already using proxy
          if (!oldUri.includes("/api/hygraph-proxy")) {
            // Modify the operation to use the proxy
            operation.setContext({
              ...context,
              uri: "/api/hygraph-proxy",
            });

            // Retry the operation
            return forward(operation);
          }
        }
      }
    }
  );

  // Retry link for transient network issues with improved error handling
  const retryLink = new RetryLink({
    delay: {
      initial: 500, // Initial delay in ms (increased)
      max: 5000, // Maximum delay in ms (increased)
      jitter: true, // Randomize delay
    },
    attempts: {
      max: 5, // Max number of retries (increased)
      retryIf: (error, operation) => {
        // Log retry attempt
        console.log(
          `Retrying operation ${operation.operationName} due to error`
        );

        // Only retry on network errors or specific GraphQL errors
        return (
          !!error &&
          (error.networkError ||
            (error.graphQLErrors &&
              error.graphQLErrors.some(
                (err) =>
                  err.message.includes("timeout") ||
                  err.message.includes("rate limit") ||
                  err.message.includes("Server response was missing") ||
                  err.message.includes("Failed to fetch") ||
                  err.message.includes("Network request failed")
              )))
        );
      },
    },
  });

  // HTTP link to our proxy API route instead of directly to Hygraph
  // This avoids CORS issues in production
  const httpLink = new HttpLink({
    // Use relative URL for the proxy API route
    uri:
      typeof window === "undefined"
        ? HYGRAPH_CDN_API // Use direct API for server-side rendering
        : "/api/hygraph-proxy", // Use proxy for client-side requests
    credentials: "same-origin",
    // Add custom headers that might help with CORS
    headers: {
      Origin: "https://blog.urtechy.com",
      Referer: "https://blog.urtechy.com/",
      "User-Agent": "Mozilla/5.0 urTechy Blog Client",
    },
  });

  // Debug link to log cache hits/misses
  const debugLink = new ApolloLink((operation, forward) => {
    // Only enable in development or when debug flag is set
    const enableDebug =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" && window.APOLLO_DEBUG);

    if (enableDebug) {
      const startTime = Date.now();
      const operationName = operation.operationName || "unnamed operation";

      console.log(`🚀 [Apollo] Starting ${operationName}`);

      return forward(operation).map((result) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Check if this was likely a cache hit (very fast response)
        const isCacheHit = duration < 50;

        console.log(
          `✅ [Apollo] ${operationName} completed in ${duration}ms ${
            isCacheHit ? "(CACHE HIT ⚡)" : "(NETWORK 🌐)"
          }`
        );

        return result;
      });
    }

    return forward(operation);
  });

  // Create link array
  const links = [debugLink, errorLink, retryLink, httpLink];

  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Set to true for SSR
    link: from(links),
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
  if (typeof window === "undefined") {
    return _apolloClient;
  }

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

// Function to enable debug mode
export function enableApolloDebug() {
  if (typeof window !== "undefined") {
    window.APOLLO_DEBUG = true;
    console.log("Apollo Client debug mode enabled");
  }
}

// Function to get cache statistics
export function getApolloStats() {
  if (!client) {
    return {
      cacheSize: "0 KB",
      entries: 0,
      rootQueries: 0,
    };
  }

  const cache = client.cache;
  const extract = cache.extract();
  const size = JSON.stringify(extract).length;

  return {
    cacheSize: `${Math.round(size / 1024)} KB`,
    entries: Object.keys(extract).length,
    rootQueries: Object.keys(extract).filter((key) =>
      key.startsWith("ROOT_QUERY")
    ).length,
  };
}

export default client;
