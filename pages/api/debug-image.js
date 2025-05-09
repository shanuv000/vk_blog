// Next.js API route for debugging image loading issues
// This provides a way to test if an image URL is accessible

export default async function handler(req, res) {
  // Set CORS headers to allow requests from specific domains
  const allowedOrigins = [
    'https://blog.urtechy.com',
    'https://urtechy.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get the image URL from the query parameter
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "URL parameter is required" });
  }

  try {
    // Try to fetch the image
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 urTechy Blog Image Checker',
        'Origin': 'https://blog.urtechy.com',
        'Referer': 'https://blog.urtechy.com/'
      }
    });

    // Check if the image is accessible
    const result = {
      url,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      success: response.ok,
      contentType: response.headers.get('content-type') || 'unknown'
    };

    // Return the result
    return res.status(200).json(result);
  } catch (error) {
    // Return error information
    return res.status(200).json({
      url,
      timestamp: new Date().toISOString(),
      error: true,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
