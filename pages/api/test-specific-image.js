// Next.js API route for testing a specific problematic image
// This helps diagnose issues with image rendering

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

  // Define the problematic image URL
  const imageUrl = "https://ap-south-1.graphassets.com/A0wVMTJ4GQepRGqAydCKQz/resize=width:1000,height:621/cmaa1f3vm1x9j07pq02ewqp2v";
  
  try {
    // Try to fetch the image with different methods
    const results = {
      timestamp: new Date().toISOString(),
      imageUrl,
      tests: []
    };

    // Test 1: Simple HEAD request
    try {
      const headResponse = await fetch(imageUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 urTechy Blog Image Tester',
          'Origin': 'https://blog.urtechy.com',
          'Referer': 'https://blog.urtechy.com/'
        }
      });
      
      results.tests.push({
        name: "HEAD Request",
        success: headResponse.ok,
        status: headResponse.status,
        statusText: headResponse.statusText,
        headers: Object.fromEntries(headResponse.headers.entries())
      });
    } catch (error) {
      results.tests.push({
        name: "HEAD Request",
        success: false,
        error: error.message
      });
    }

    // Test 2: GET request
    try {
      const getResponse = await fetch(imageUrl, { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 urTechy Blog Image Tester',
          'Origin': 'https://blog.urtechy.com',
          'Referer': 'https://blog.urtechy.com/'
        }
      });
      
      // Don't read the full response body to avoid memory issues
      const contentType = getResponse.headers.get('content-type');
      const contentLength = getResponse.headers.get('content-length');
      
      results.tests.push({
        name: "GET Request",
        success: getResponse.ok,
        status: getResponse.status,
        statusText: getResponse.statusText,
        contentType,
        contentLength,
        headers: Object.fromEntries(getResponse.headers.entries())
      });
    } catch (error) {
      results.tests.push({
        name: "GET Request",
        success: false,
        error: error.message
      });
    }

    // Test 3: Try alternative URL formats
    const alternativeUrls = [
      // Without resize parameters
      `https://ap-south-1.graphassets.com/A0wVMTJ4GQepRGqAydCKQz/cmaa1f3vm1x9j07pq02ewqp2v`,
      // With different resize format
      `https://ap-south-1.graphassets.com/A0wVMTJ4GQepRGqAydCKQz?resize=width:1000,height:621&handle=cmaa1f3vm1x9j07pq02ewqp2v`,
      // CDN URL format
      `https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master/cmaa1f3vm1x9j07pq02ewqp2v`
    ];
    
    const alternativeResults = [];
    
    for (const url of alternativeUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 urTechy Blog Image Tester',
            'Origin': 'https://blog.urtechy.com',
            'Referer': 'https://blog.urtechy.com/'
          }
        });
        
        alternativeResults.push({
          url,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
      } catch (error) {
        alternativeResults.push({
          url,
          success: false,
          error: error.message
        });
      }
    }
    
    results.alternativeUrls = alternativeResults;

    // Return the results
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}
