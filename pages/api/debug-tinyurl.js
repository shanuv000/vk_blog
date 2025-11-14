/**
 * Debug endpoint to test TinyURL configuration
 */

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TINYURL_API_KEY;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyFirst10: apiKey ? `${apiKey.substring(0, 10)  }...` : "NOT_SET",
    allEnvKeys: Object.keys(process.env).filter(
      (key) => key.includes("TINYURL") || key.includes("tiny")
    ),
  };

  // Test a simple API call
  if (apiKey) {
    try {
      const testResponse = await fetch("https://api.tinyurl.com/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://blog.urtechy.com/test",
          alias: `test-${  Date.now()}`,
        }),
      });

      const testResult = await testResponse.json();

      debugInfo.apiTest = {
        status: testResponse.status,
        success: testResponse.ok,
        result: testResult,
      };
    } catch (error) {
      debugInfo.apiTest = {
        error: error.message,
      };
    }
  }

  res.status(200).json(debugInfo);
}
