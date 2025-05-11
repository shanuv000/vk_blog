/**
 * Firebase Proxy API Route - Production Optimized
 *
 * This API route acts as a proxy between the client and Firebase services.
 * It handles CORS issues by setting appropriate headers and forwarding requests.
 */

// Firebase project configuration - hardcoded for production to avoid env lookups
const FIREBASE_PROJECT_ID = 'urtechy-35294';

// Allowed origins for CORS - using Set for O(1) lookups
const ALLOWED_ORIGINS = new Set([
  "https://blog.urtechy.com",
  "https://www.blog.urtechy.com",
  "https://urtechy.com",
  "https://www.urtechy.com",
  process.env.NODE_ENV === 'development' ? "http://localhost:3000" : null
].filter(Boolean));

// Allowed Firebase endpoints
const ALLOWED_ENDPOINTS = [
  "https://firestore.googleapis.com/v1/projects/",
  "https://identitytoolkit.googleapis.com/v1/",
];

// Allowed HTTP methods - using Set for O(1) lookups
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

// Helper function to validate the request - optimized with early returns and optional chaining
const validateRequest = (req) => {
  // Check if the request has the necessary data
  if (!req.body?.endpoint || !req.body?.method) {
    return {
      valid: false,
      error: "Missing required fields: endpoint and method",
    };
  }

  // Validate the endpoint to prevent abuse
  const isValidEndpoint = ALLOWED_ENDPOINTS.some((endpoint) =>
    req.body.endpoint.startsWith(endpoint)
  );

  if (!isValidEndpoint) {
    return { valid: false, error: "Invalid endpoint" };
  }

  // Validate the method
  if (!ALLOWED_METHODS.has(req.body.method)) {
    return { valid: false, error: "Invalid method" };
  }

  // Validate project ID to ensure we're only proxying to our project
  if (!req.body.endpoint.includes(FIREBASE_PROJECT_ID)) {
    return { valid: false, error: "Invalid project" };
  }

  return { valid: true };
};

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Set CORS headers
  const origin = req.headers.origin;
  
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (req.method === "OPTIONS") {
    // For preflight requests only, allow any origin
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // For actual requests, if origin is not allowed, return 403
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
  
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
      // Set timeout to avoid hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    };
    
    // Add body for non-GET requests
    if (method !== "GET" && body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Make the request to Firebase
    const response = await fetch(endpoint, fetchOptions);
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with appropriate cache headers
    res.setHeader('Cache-Control', 'no-store, private');
    res.status(response.status).json(data);
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV !== 'production') {
      console.error("Firebase proxy error:", error);
    }
    
    // Check for timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway timeout' });
    }
    
    res.status(500).json({ error: "Failed to proxy request to Firebase" });
  }
}
