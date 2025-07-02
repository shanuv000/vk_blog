/**
 * Health Check API Endpoint
 * Provides system health status for monitoring and uptime checks
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {},
    responseTime: 0,
  };

  try {
    // Check environment variables
    healthCheck.checks.environment = {
      status: 'healthy',
      required_vars: {
        NEXT_PUBLIC_HYGRAPH_CONTENT_API: !!process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API,
        NEXT_PUBLIC_HYGRAPH_CDN_API: !!process.env.NEXT_PUBLIC_HYGRAPH_CDN_API,
        NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_GOOGLE_ANALYTICS: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
      }
    };

    // Check if any required environment variables are missing
    const missingVars = Object.entries(healthCheck.checks.environment.required_vars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      healthCheck.checks.environment.status = 'warning';
      healthCheck.checks.environment.missing_vars = missingVars;
    }

    // Check Hygraph API connectivity
    try {
      const hygraphResponse = await fetch(process.env.NEXT_PUBLIC_HYGRAPH_CDN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }',
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      healthCheck.checks.hygraph = {
        status: hygraphResponse.ok ? 'healthy' : 'unhealthy',
        response_code: hygraphResponse.status,
        response_time: Date.now() - startTime,
      };
    } catch (error) {
      healthCheck.checks.hygraph = {
        status: 'unhealthy',
        error: error.message,
      };
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      status: 'healthy',
      usage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      }
    };

    // Check if memory usage is too high (over 512MB heap used)
    if (memoryUsage.heapUsed > 512 * 1024 * 1024) {
      healthCheck.checks.memory.status = 'warning';
      healthCheck.checks.memory.message = 'High memory usage detected';
    }

    // Overall health status
    const allChecks = Object.values(healthCheck.checks);
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy');
    const hasWarnings = allChecks.some(check => check.status === 'warning');

    if (hasUnhealthy) {
      healthCheck.status = 'unhealthy';
    } else if (hasWarnings) {
      healthCheck.status = 'warning';
    }

    // Calculate total response time
    healthCheck.responseTime = Date.now() - startTime;

    // Set appropriate HTTP status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'warning' ? 200 : 503;

    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(statusCode).json(healthCheck);

  } catch (error) {
    // If health check itself fails
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime,
    };

    return res.status(503).json(errorResponse);
  }
}
