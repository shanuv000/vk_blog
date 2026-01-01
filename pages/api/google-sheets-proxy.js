// API route to proxy Google Sheets CSV requests
// This bypasses CORS restrictions by fetching from the server
import { setCorsHeaders } from "../../lib/cors";

export default async function handler(req, res) {
  // Handle CORS for external domains
  if (setCorsHeaders(req, res)) return;
  
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  // Validate that it's a Google Sheets URL
  if (!url.includes("docs.google.com/spreadsheets")) {
    return res.status(400).json({ error: "Invalid Google Sheets URL" });
  }

  try {
    // Decode the URL (in case it's encoded)
    const decodedUrl = decodeURIComponent(url);
    
    // Build the CSV export URL
    let csvUrl;
    
    // Handle pubhtml format: /d/e/XXXX/pubhtml
    const pubhtmlMatch = decodedUrl.match(/\/d\/e\/([^/?]+)/);
    if (pubhtmlMatch) {
      csvUrl = `https://docs.google.com/spreadsheets/d/e/${pubhtmlMatch[1]}/pub?output=csv`;
    } else {
      // Handle regular format: /d/XXXX/edit
      const regularMatch = decodedUrl.match(/\/d\/([^/?]+)/);
      if (regularMatch) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${regularMatch[1]}/gviz/tq?tqx=out:csv`;
      } else {
        return res.status(400).json({ error: "Could not extract sheet ID from URL" });
      }
    }

    // Fetch the CSV data from Google Sheets
    const response = await fetch(csvUrl, {
      headers: {
        'Accept': 'text/csv,application/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch spreadsheet: ${response.statusText}` 
      });
    }

    const csvText = await response.text();

    // Set cache headers for performance
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    
    return res.status(200).send(csvText);
  } catch (error) {
    console.error("Error fetching Google Sheets:", error);
    return res.status(500).json({ error: error.message });
  }
}
