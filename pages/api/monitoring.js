/**
 * Advanced Production Monitoring API
 * Real-time performance tracking and alerting system
 */

import { PERFORMANCE_CONFIG } from "../../config/production";
import { performanceMonitor } from "../../services/hygraph";

// Performance metrics storage (in production, use Redis or database)
const performanceMetrics = {
  lastReset: Date.now(),
  apiCalls: {
    total: 0,
    successful: 0,
    failed: 0,
    timeouts: 0,
    totalResponseTime: 0,
  },
  cacheMetrics: {
    hits: 0,
    misses: 0,
    total: 0,
  },
  slowQueries: [],
  errorLog: [],
  deduplicationStats: {
    totalRequests: 0,
    uniqueRequests: 0,
    inFlightRequests: 0,
  },
};

// Helper function to calculate percentiles
const calculatePercentile = (arr, percentile) => {
  if (arr.length === 0) {return 0;}
  const sorted = arr.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
};

// Get comprehensive system metrics
const getSystemMetrics = () => {
  try {
    // Get performance monitor data if available
    const monitorData = performanceMonitor?.getMetrics?.() || {};

    // Calculate derived metrics
    const totalApiCalls = performanceMetrics.apiCalls.total || 1; // Avoid division by zero
    const successRate =
      (performanceMetrics.apiCalls.successful / totalApiCalls) * 100;
    const averageResponseTime =
      performanceMetrics.apiCalls.totalResponseTime / totalApiCalls;

    const totalCacheOperations = performanceMetrics.cacheMetrics.total || 1;
    const cacheHitRate =
      (performanceMetrics.cacheMetrics.hits / totalCacheOperations) * 100;

    // Performance status calculation
    const getApiStatus = () => {
      if (successRate < 90) {return "unhealthy";}
      if (successRate < 95) {return "degraded";}
      if (averageResponseTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD)
        {return "warning";}
      return "healthy";
    };

    const getCacheStatus = () => {
      if (cacheHitRate < 30) {return "unhealthy";}
      if (cacheHitRate < 50) {return "warning";}
      return "healthy";
    };

    return {
      status:
        getApiStatus() === "healthy" && getCacheStatus() === "healthy"
          ? "healthy"
          : getApiStatus() === "unhealthy" || getCacheStatus() === "unhealthy"
          ? "unhealthy"
          : "warning",
      timestamp: new Date().toISOString(),

      api: {
        status: getApiStatus(),
        requests: {
          total: performanceMetrics.apiCalls.total,
          successful: performanceMetrics.apiCalls.successful,
          failed: performanceMetrics.apiCalls.failed,
          timeouts: performanceMetrics.apiCalls.timeouts,
          successRate: successRate,
        },
        performance: {
          averageResponseTime: averageResponseTime,
          slowQueries: performanceMetrics.slowQueries.length,
          p95ResponseTime: calculatePercentile(
            performanceMetrics.slowQueries.map((q) => q.duration),
            95
          ),
          p99ResponseTime: calculatePercentile(
            performanceMetrics.slowQueries.map((q) => q.duration),
            99
          ),
        },
      },

      cache: {
        status: getCacheStatus(),
        hits: performanceMetrics.cacheMetrics.hits,
        misses: performanceMetrics.cacheMetrics.misses,
        total: performanceMetrics.cacheMetrics.total,
        hitRate: cacheHitRate,
        cacheStats: monitorData.cacheStats || {},
      },

      deduplication: {
        status: "healthy",
        stats: performanceMetrics.deduplicationStats,
      },

      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextjsVersion: process.env.NEXT_JS_VERSION || "Unknown",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },

      uptime: {
        seconds: process.uptime(),
        human: formatUptime(process.uptime()),
      },

      checks: [
        {
          name: "API Response Time",
          status:
            averageResponseTime < PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD
              ? "healthy"
              : "warning",
          value: averageResponseTime,
          threshold: PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD,
        },
        {
          name: "Success Rate",
          status:
            successRate >= 95
              ? "healthy"
              : successRate >= 90
              ? "warning"
              : "unhealthy",
          value: successRate,
          threshold: 95,
        },
        {
          name: "Cache Hit Rate",
          status:
            cacheHitRate >= 60
              ? "healthy"
              : cacheHitRate >= 30
              ? "warning"
              : "unhealthy",
          value: cacheHitRate,
          threshold: 60,
        },
        {
          name: "Error Rate",
          status:
            (performanceMetrics.apiCalls.failed / totalApiCalls) * 100 <= 5
              ? "healthy"
              : "warning",
          value: (performanceMetrics.apiCalls.failed / totalApiCalls) * 100,
          threshold: 5,
        },
      ],

      recentErrors: performanceMetrics.errorLog.slice(-10),
      metricsWindow: {
        startTime: new Date(performanceMetrics.lastReset).toISOString(),
        duration: Date.now() - performanceMetrics.lastReset,
      },
    };
  } catch (error) {
    console.error("Error generating system metrics:", error);
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

// Format uptime in human readable format
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {return `${days}d ${hours}h ${minutes}m`;}
  if (hours > 0) {return `${hours}h ${minutes}m ${secs}s`;}
  if (minutes > 0) {return `${minutes}m ${secs}s`;}
  return `${secs}s`;
};

// Update metrics (called by services)
export const updateMetrics = {
  recordApiCall: (success, responseTime, error = null) => {
    performanceMetrics.apiCalls.total++;
    if (success) {
      performanceMetrics.apiCalls.successful++;
    } else {
      performanceMetrics.apiCalls.failed++;
      if (error) {
        performanceMetrics.errorLog.push({
          timestamp: new Date().toISOString(),
          error: error.message || error,
          type: "api_error",
        });
        // Keep only last 100 errors
        if (performanceMetrics.errorLog.length > 100) {
          performanceMetrics.errorLog = performanceMetrics.errorLog.slice(-100);
        }
      }
    }

    if (responseTime) {
      performanceMetrics.apiCalls.totalResponseTime += responseTime;

      // Track slow queries
      if (responseTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
        performanceMetrics.slowQueries.push({
          timestamp: new Date().toISOString(),
          duration: responseTime,
        });
        // Keep only last 50 slow queries
        if (performanceMetrics.slowQueries.length > 50) {
          performanceMetrics.slowQueries =
            performanceMetrics.slowQueries.slice(-50);
        }
      }
    }
  },

  recordCacheHit: () => {
    performanceMetrics.cacheMetrics.hits++;
    performanceMetrics.cacheMetrics.total++;
  },

  recordCacheMiss: () => {
    performanceMetrics.cacheMetrics.misses++;
    performanceMetrics.cacheMetrics.total++;
  },

  recordTimeout: () => {
    performanceMetrics.apiCalls.timeouts++;
  },

  updateDeduplicationStats: (stats) => {
    performanceMetrics.deduplicationStats = { ...stats };
  },

  reset: () => {
    performanceMetrics.lastReset = Date.now();
    performanceMetrics.apiCalls = {
      total: 0,
      successful: 0,
      failed: 0,
      timeouts: 0,
      totalResponseTime: 0,
    };
    performanceMetrics.cacheMetrics = {
      hits: 0,
      misses: 0,
      total: 0,
    };
    performanceMetrics.slowQueries = [];
    performanceMetrics.errorLog = [];
    performanceMetrics.deduplicationStats = {
      totalRequests: 0,
      uniqueRequests: 0,
      inFlightRequests: 0,
    };
  },
};

// API Handler
export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    // CORS headers for dashboard access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method === "GET") {
      const { action, format } = req.query;

      switch (action) {
        case "reset":
          // Reset metrics (admin only in production)
          if (
            process.env.NODE_ENV === "production" &&
            !req.headers["x-admin-key"]
          ) {
            return res.status(403).json({ error: "Admin access required" });
          }
          updateMetrics.reset();
          return res.status(200).json({
            message: "Metrics reset successfully",
            timestamp: new Date().toISOString(),
          });

        case "quick":
          // Quick health check
          const quickStatus =
            performanceMetrics.apiCalls.successful > 0 ? "healthy" : "unknown";
          return res.status(200).json({
            status: quickStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
          });

        default:
          // Full metrics
          const metrics = getSystemMetrics();

          if (format === "prometheus") {
            // Prometheus format for monitoring systems
            const prometheusMetrics = `
# HELP hygraph_api_requests_total Total number of API requests
# TYPE hygraph_api_requests_total counter
hygraph_api_requests_total{status="successful"} ${metrics.api.requests.successful}
hygraph_api_requests_total{status="failed"} ${metrics.api.requests.failed}

# HELP hygraph_api_response_time_ms API response time in milliseconds
# TYPE hygraph_api_response_time_ms gauge
hygraph_api_response_time_ms ${metrics.api.performance.averageResponseTime}

# HELP hygraph_cache_hit_rate Cache hit rate percentage
# TYPE hygraph_cache_hit_rate gauge
hygraph_cache_hit_rate ${metrics.cache.hitRate}

# HELP hygraph_cache_operations_total Total cache operations
# TYPE hygraph_cache_operations_total counter
hygraph_cache_operations_total{type="hit"} ${metrics.cache.hits}
hygraph_cache_operations_total{type="miss"} ${metrics.cache.misses}
            `.trim();

            res.setHeader("Content-Type", "text/plain");
            return res.status(200).send(prometheusMetrics);
          }

          return res.status(200).json(metrics);
      }
    }

    if (req.method === "POST") {
      // Accept metrics updates from services
      const { type, data } = req.body;

      switch (type) {
        case "api_call":
          updateMetrics.recordApiCall(
            data.success,
            data.responseTime,
            data.error
          );
          break;
        case "cache_hit":
          updateMetrics.recordCacheHit();
          break;
        case "cache_miss":
          updateMetrics.recordCacheMiss();
          break;
        case "timeout":
          updateMetrics.recordTimeout();
          break;
        case "deduplication":
          updateMetrics.updateDeduplicationStats(data);
          break;
        default:
          return res.status(400).json({ error: "Invalid metric type" });
      }

      return res.status(200).json({
        message: "Metric recorded",
        timestamp: new Date().toISOString(),
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Monitoring API error:", error);

    const responseTime = Date.now() - startTime;
    updateMetrics.recordApiCall(false, responseTime, error);

    return res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Monitoring service unavailable",
      timestamp: new Date().toISOString(),
    });
  }
}
