/**
 * Firebase Proxy API Route
 *
 * This API route acts as a proxy between the client and Firebase services.
 * It handles CORS issues by setting appropriate headers and forwarding requests.
 */

// Helper function to validate the request
const validateRequest = (req) => {
  // Check if the request has the necessary data
  if (!req.body || !req.body.endpoint || !req.body.method) {
    return {
      valid: false,
      error: "Missing required fields: endpoint and method",
    };
  }

  // Validate the endpoint to prevent abuse
  const allowedEndpoints = [
    "https://firestore.googleapis.com/v1/projects/",
    "https://identitytoolkit.googleapis.com/v1/",
  ];

  const isValidEndpoint = allowedEndpoints.some((endpoint) =>
    req.body.endpoint.startsWith(endpoint)
  );

  if (!isValidEndpoint) {
    return { valid: false, error: "Invalid endpoint" };
  }

  // Validate the method
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  if (!allowedMethods.includes(req.body.method)) {
    return { valid: false, error: "Invalid method" };
  }

  return { valid: true };
};

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    "https://blog.urtechy.com",
    "https://www.blog.urtechy.com",
    "http://localhost:3000",
    "https://urtechy.com",
    "https://www.urtechy.com",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // For preflight requests, we need to respond to any origin
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests for the proxy
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate the request
  const validation = validateRequest(req);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Extract request details
    const { endpoint, method, body, headers = {} } = req.body;

    // Prepare fetch options
    const fetchOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add body for non-GET requests
    if (method !== "GET" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Make the request to Firebase
    const response = await fetch(endpoint, fetchOptions);

    // Get the response data
    const data = await response.json();

    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Firebase proxy error:", error);
    res.status(500).json({ error: "Failed to proxy request to Firebase" });
  }
}
