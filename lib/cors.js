// Shared CORS utility for API routes
// Supports urtechy.com domains, localhost, and Vercel deployments

const ALLOWED_ORIGINS = [
  // Production domains
  "https://urtechy.com",
  "https://www.urtechy.com",
  "https://blog.urtechy.com",
  "https://vkblog.vercel.app",
  // HTTP versions (for development/testing)
  "http://urtechy.com",
  "http://www.urtechy.com",
  "http://blog.urtechy.com",
];

/**
 * Check if the origin is allowed
 * @param {string} origin - The request origin
 * @returns {boolean}
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (same-origin, curl, etc.)
  
  // Allow all localhost ports (for development and PM2)
  if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
    return true;
  }
  
  // Allow 127.0.0.1 with any port
  if (origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
    return true;
  }
  
  // Check against allowed origins list
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Set CORS headers on response
 * @param {object} req - Next.js request object
 * @param {object} res - Next.js response object
 * @returns {boolean} - Returns true if it's a preflight request (OPTIONS)
 */
export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * CORS middleware wrapper for API handlers
 * @param {function} handler - The API handler function
 * @returns {function} - Wrapped handler with CORS support
 */
export function withCors(handler) {
  return async (req, res) => {
    // Handle preflight
    if (setCorsHeaders(req, res)) {
      return;
    }
    
    // Call the actual handler
    return handler(req, res);
  };
}

export default { isAllowedOrigin, setCorsHeaders, withCors };
