/**
 * API route to check cache status
 * This endpoint helps verify if the service worker is properly caching requests
 */

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Set cache headers based on the request type
  const cacheType = req.query.type || 'default';
  
  switch (cacheType) {
    case 'long':
      // Long-term caching (1 day)
      res.setHeader(
        'Cache-Control',
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=172800'
      );
      res.setHeader('X-Cache-Type', 'LONG');
      break;
      
    case 'medium':
      // Medium-term caching (1 hour)
      res.setHeader(
        'Cache-Control',
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200'
      );
      res.setHeader('X-Cache-Type', 'MEDIUM');
      break;
      
    case 'short':
      // Short-term caching (5 minutes)
      res.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
      );
      res.setHeader('X-Cache-Type', 'SHORT');
      break;
      
    case 'none':
      // No caching
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.setHeader('X-Cache-Type', 'NONE');
      break;
      
    default:
      // Default caching (10 minutes)
      res.setHeader(
        'Cache-Control',
        'public, max-age=600, s-maxage=600, stale-while-revalidate=1200'
      );
      res.setHeader('X-Cache-Type', 'DEFAULT');
      break;
  }
  
  // Add timestamp and request ID for tracking
  const timestamp = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Return cache information
  res.status(200).json({
    timestamp,
    requestId,
    cacheType,
    headers: {
      cacheControl: res.getHeader('Cache-Control'),
      cacheType: res.getHeader('X-Cache-Type'),
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
