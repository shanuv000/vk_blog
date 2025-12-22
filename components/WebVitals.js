/**
 * Web Vitals Performance Monitoring Component
 * Tracks Core Web Vitals (LCP, INP, CLS) and supplementary metrics (FCP, TTFB)
 * Sends data to Google Analytics for performance monitoring
 *
 * Core Web Vitals (2024):
 * - LCP (Largest Contentful Paint): measures loading performance
 * - INP (Interaction to Next Paint): measures interactivity (replaced FID)
 * - CLS (Cumulative Layout Shift): measures visual stability
 */

import { event } from "../lib/analytics";

// Check if we're in debug mode (development or explicitly enabled)
const isDebugMode = () => {
  if (typeof window === "undefined") return false;
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "true"
  );
};

// Metric thresholds for rating (good/needs-improvement/poor)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // score
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  TTFB: { good: 800, poor: 1800 }, // milliseconds
};

/**
 * Get rating for a metric based on its value
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @returns {string} - Rating: 'good', 'needs-improvement', or 'poor'
 */
function getMetricRating(name, value) {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "unknown";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Send Web Vitals metric to Google Analytics
 * @param {Object} metric - Web Vitals metric object
 */
function sendToAnalytics(metric) {
  const { name, value, delta, id, rating } = metric;

  // Round values for cleaner reporting
  const roundedValue = Math.round(name === "CLS" ? value * 1000 : value);
  const roundedDelta = Math.round(name === "CLS" ? delta * 1000 : delta);

  // Log in debug mode
  if (isDebugMode()) {
    const displayValue = name === "CLS" ? value.toFixed(3) : `${roundedValue}ms`;
    console.log(
      `[Web Vitals] ${name}: ${displayValue} (${rating || getMetricRating(name, value)})`
    );
  }

  // Send to Google Analytics
  event({
    action: name,
    category: "Web Vitals",
    label: id,
    value: roundedValue,
    // Additional non-interaction event parameters
    metric_id: id,
    metric_value: roundedValue,
    metric_delta: roundedDelta,
    metric_rating: rating || getMetricRating(name, value),
    non_interaction: true,
  });
}

/**
 * Track and report Core Web Vitals using the web-vitals library
 */
export async function reportWebVitals() {
  if (typeof window === "undefined") return;

  // Only track in production or when explicitly enabled
  const shouldTrack =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "true";

  if (!shouldTrack) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Web Vitals] Tracking disabled. Set NEXT_PUBLIC_ENABLE_WEB_VITALS=true to enable in development."
      );
    }
    return;
  }

  try {
    // Dynamically import web-vitals to reduce bundle size
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");

    // Core Web Vitals (the three main metrics)
    onCLS(sendToAnalytics); // Cumulative Layout Shift
    onINP(sendToAnalytics); // Interaction to Next Paint (replaced FID)
    onLCP(sendToAnalytics); // Largest Contentful Paint

    // Supplementary metrics
    onFCP(sendToAnalytics); // First Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte

    if (isDebugMode()) {
      console.log("[Web Vitals] Core Web Vitals tracking initialized");
    }
  } catch (error) {
    console.error("[Web Vitals] Error initializing tracking:", error);
  }
}

/**
 * Initialize Performance Observer for additional performance monitoring
 * Tracks long tasks and layout shifts for debugging
 */
export function initPerformanceObserver() {
  if (typeof window === "undefined" || !window.PerformanceObserver) return;

  try {
    // Observe long tasks (> 50ms) that may cause jank
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          event({
            action: "long_task",
            category: "Performance",
            label: "Task over 50ms",
            value: Math.round(entry.duration),
            non_interaction: true,
          });

          if (isDebugMode()) {
            console.log(
              `[Performance] Long task detected: ${Math.round(entry.duration)}ms`
            );
          }
        }
      });
    });

    // Only observe if supported
    if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      longTaskObserver.observe({ entryTypes: ["longtask"] });
    }

    // Track slow resources (> 1s load time)
    const resourceObserver = new PerformanceObserver((list) => {
      const slowResources = list
        .getEntries()
        .filter((entry) => entry.duration > 1000);

      if (slowResources.length > 0 && isDebugMode()) {
        slowResources.forEach((resource) => {
          console.log(
            `[Performance] Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`
          );
        });
      }
    });

    if (PerformanceObserver.supportedEntryTypes?.includes("resource")) {
      resourceObserver.observe({ entryTypes: ["resource"], buffered: true });
    }
  } catch (error) {
    console.error("[Performance] Error initializing Performance Observer:", error);
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this in _app.js useEffect
 */
export function initWebVitals() {
  if (typeof window === "undefined") return;

  // Start tracking immediately
  reportWebVitals();

  // Initialize performance observer for additional metrics
  initPerformanceObserver();

  // Re-report metrics when page becomes hidden (final values)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      reportWebVitals();
    }
  });
}

export default initWebVitals;
