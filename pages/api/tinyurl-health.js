/**
 * TinyURL Service Health Check API
 * Monitors TinyURL service status for free version
 */
import tinyUrlService from "../../services/tinyurl";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get comprehensive service status
    const stats = tinyUrlService.getStats();
    const rateLimitStatus = tinyUrlService.getRateLimitStatus();

    // Determine overall health
    const isHealthy = stats.isConfigured && rateLimitStatus.canMakeRequest;
    const warnings = [];

    if (!stats.isConfigured) {
      warnings.push("TinyURL API key not configured");
    }

    if (!rateLimitStatus.canMakeRequest) {
      warnings.push("Rate limit exceeded");
    }

    if (rateLimitStatus.requestsInWindow >= rateLimitStatus.maxRequests * 0.8) {
      warnings.push("Approaching rate limit");
    }

    // Health status response
    const healthStatus = {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      service: "TinyURL Free Version",
      configuration: {
        apiKeyConfigured: stats.apiKeyExists,
        serviceConfigured: stats.isConfigured,
      },
      rateLimit: {
        requestsInWindow: rateLimitStatus.requestsInWindow,
        maxRequests: rateLimitStatus.maxRequests,
        canMakeRequest: rateLimitStatus.canMakeRequest,
        utilizationPercent: Math.round(
          (rateLimitStatus.requestsInWindow / rateLimitStatus.maxRequests) * 100
        ),
        nextResetInMs: rateLimitStatus.nextResetIn,
        windowMs: 60000, // 1 minute window
      },
      cache: {
        size: stats.cacheSize,
        enabled: true,
      },
      warnings,
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
      service: "TinyURL Free Version",
    });
  }
}
