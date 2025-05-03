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

    // Alternative API endpoints to try if the primary one fails
    const backupApiUrls = [
      `https://cricket-api.vercel.app/api/${endpoint}`,
      `https://cricket-live-data.p.rapidapi.com/${endpoint}`,
    ];

    // Add a timestamp to bypass caching
    const url = new URL(apiUrl);
    url.searchParams.append("_t", Date.now());

    console.log(`Fetching cricket data from: ${url.toString()}`);

    // Try the primary API first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "urTechy-Blog/1.0",
          Origin: "https://blog.urtechy.com",
          Referer: "https://blog.urtechy.com/",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If successful, return the response
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      // If not successful, throw an error to try backup APIs
      throw new Error(`Primary API responded with status: ${response.status}`);
    } catch (primaryError) {
      console.warn(
        `Primary cricket API failed: ${primaryError.message}, trying backups...`
      );

      // Try backup APIs in sequence
      for (const backupUrl of backupApiUrls) {
        try {
          console.log(`Trying backup cricket API: ${backupUrl}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const backupResponse = await fetch(backupUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "User-Agent": "urTechy-Blog/1.0",
              Origin: "https://blog.urtechy.com",
              Referer: "https://blog.urtechy.com/",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (backupResponse.ok) {
            const data = await backupResponse.json();
            return res.status(200).json(data);
          }
        } catch (backupError) {
          console.warn(`Backup cricket API failed: ${backupError.message}`);
          // Continue to the next backup
        }
      }

      // If we get here, all APIs failed, throw an error to be caught by the outer catch
      throw new Error("All cricket APIs failed");
    }

    // This code is no longer needed as we handle responses in the try/catch blocks above
  } catch (error) {
    console.error(
      `Error proxying request to cricket API (${endpoint}):`,
      error
    );

    // Return a more user-friendly error with fallback data
    return res.status(200).json({
      message: "Error fetching data from cricket API",
      error: error.message || "Unknown error",
      // Return status 200 with fallback data so the UI doesn't break
      fallback: {
        matches: [],
        fixtures: [],
        liveScores: [],
        recentMatches: [],
        upcomingMatches: [],
        status: "error",
        timestamp: new Date().toISOString(),
      },
      // Include the endpoint for debugging
      endpoint,
    });
  }
}
