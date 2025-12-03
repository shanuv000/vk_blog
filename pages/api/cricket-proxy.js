// Next.js API route to proxy requests to the cricket API
// This avoids CORS issues when fetching from the client side

/**
 * Extract tournament heading from match data for filtering
 * @param {Object} match - Match data object
 * @returns {string} - Tournament heading/category
 */
function extractHeading(match) {
  const matchDetails = match.matchDetails || match.title || "";
  const location = match.location || "";

  // Test matches
  if (matchDetails.includes("Test") || location.includes("Test")) {
    return "Test Matches";
  }

  // ODI matches
  if (matchDetails.includes("ODI") || location.includes("ODI")) {
    return "ODI Matches";
  }

  // T20 matches (including T20I, WBBL, etc.)
  if (
    matchDetails.includes("T20") ||
    location.includes("T20") ||
    matchDetails.includes("Big Bash") ||
    location.includes("Big Bash")
  ) {
    return "T20 Matches";
  }

  // Group stage matches (World Cup, Asia Cup, etc.)
  if (matchDetails.includes("Group") || location.includes("Group")) {
    return "Tournament Matches";
  }

  // Warm-up/Practice matches
  if (
    matchDetails.includes("Warm-up") ||
    matchDetails.includes("Practice") ||
    location.includes("Warm-up")
  ) {
    return "Warm-up Matches";
  }

  // Women's cricket
  if (
    matchDetails.includes("Women") ||
    location.includes("Women") ||
    match.playingTeamBat?.includes("Women") ||
    match.playingTeamBall?.includes("Women")
  ) {
    return "Women's Cricket";
  }

  // Default category
  return "Other Matches";
}

/**
 * Add heading field to all matches in the response data
 * @param {Object} data - API response data
 * @returns {Object} - Modified data with heading field added
 */
function addHeadingToMatches(data) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return data;
  }

  return {
    ...data,
    data: data.data.map((match) => ({
      ...match,
      heading: extractHeading(match),
    })),
  };
}

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
    // Add enhanced cache control headers for better performance
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=600, max-age=60"
    );

    // Add performance headers
    res.setHeader("X-Cricket-API-Optimized", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

      // If successful, return the response with heading added
      if (response.ok) {
        const data = await response.json();

        // Limit recent scores to top 20 to prevent "too much data" errors
        if (endpoint === "recent-scores" && data.data && Array.isArray(data.data)) {
          data.data = data.data.slice(0, 20);
        }

        const dataWithHeadings = addHeadingToMatches(data);
        return res.status(200).json(dataWithHeadings);
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
            const dataWithHeadings = addHeadingToMatches(data);
            return res.status(200).json(dataWithHeadings);
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
