/**
 * API route to check caching status
 * This endpoint helps verify if caching headers are working correctly
 */

export default function handler(req, res) {
  // Get the timestamp from the query or use current time
  const timestamp = req.query.timestamp || Date.now();
  
  // Set cache headers based on the request
  if (req.query.cache === 'true') {
    // Set cache headers for 1 minute
    res.setHeader(
      'Cache-Control',
      'public, max-age=60, s-maxage=60, stale-while-revalidate=300'
    );
  } else {
    // No caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  
  // Add debug headers
  res.setHeader('X-Cache-Debug', 'true');
  res.setHeader('X-Response-Time', Date.now());
  
  // Return cache information
  res.status(200).json({
    timestamp,
    serverTime: Date.now(),
    cacheEnabled: req.query.cache === 'true',
    headers: {
      cacheControl: res.getHeader('Cache-Control'),
      responseTime: res.getHeader('X-Response-Time'),
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
    },
  });
}
