// Service to fetch data from Hygraph via our proxy API
// This avoids CORS issues when fetching from the client side

import { gql } from "graphql-request";

// Helper function to fetch data via the proxy API
export const fetchViaProxy = async (query, variables = {}) => {
  try {
    // Add a timestamp to bypass caching
    const timestampedVariables = {
      ...variables,
      _timestamp: new Date().getTime(),
    };

    // Make a POST request to our proxy API with absolute URL
    // Using window.location to get the base URL
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://blog.urtechy.com";
    const response = await fetch(`${baseUrl}/api/hygraph-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: timestampedVariables,
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch data via proxy");
    }

    // Parse and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching via proxy:", error);
    throw error;
  }
};

// Export gql for convenience
export { gql };
