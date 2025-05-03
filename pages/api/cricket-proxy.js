// Next.js API route to proxy requests to the cricket API
// This avoids CORS issues when fetching from the client side

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get the endpoint from the query parameter
  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ message: "Endpoint parameter is required" });
  }

  // Validate the endpoint to prevent abuse
  const allowedEndpoints = [
    "schedule",
    "live-scores",
    "recent-scores",
    "upcoming-matches",
  ];

  if (!allowedEndpoints.includes(endpoint)) {
    return res.status(400).json({ message: "Invalid endpoint" });
  }

  try {
    // Add cache control headers
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );

    // Forward the request to the cricket API
    const apiUrl = `https://api-sync.vercel.app/api/cricket/${endpoint}`;

    // Add a timestamp to bypass caching
    const url = new URL(apiUrl);
    url.searchParams.append("_t", Date.now());

    console.log(`Fetching cricket data from: ${url.toString()}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "urTechy-Blog/1.0",
      },
      signal: controller.signal,
      // Add timeout to prevent hanging requests
      timeout: 8000,
    });

    clearTimeout(timeoutId);

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // Get the response data
    const data = await response.json();

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error(
      `Error proxying request to cricket API (${endpoint}):`,
      error
    );

    // Return a more user-friendly error with fallback data
    return res.status(500).json({
      message: "Error fetching data from cricket API",
      error: error.message || "Unknown error",
      fallback: {
        // Provide some fallback data so the UI doesn't break
        matches: [],
        status: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }
}
