/**
 * Web Vitals Performance Monitoring Component
 * Tracks Core Web Vitals and sends data to Google Analytics
 */

import { event } from "../lib/analytics";

// Simple fallback implementation without external dependencies
const webVitalsAvailable = false; // Set to true when web-vitals is installed

// Track and report Core Web Vitals
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // Only track in production or when explicitly enabled
  const shouldTrack =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "true";

  if (!shouldTrack) return;

  try {
    if (webVitalsAvailable) {
      // TODO: Uncomment when web-vitals package is installed
      // const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      // ... implement web vitals tracking
      console.log("Web Vitals tracking would be enabled here");
    } else {
      // Fallback: Basic performance tracking
      trackBasicPerformance();
    }

    // Track additional performance metrics
    trackAdditionalMetrics();
  } catch (error) {
    console.error("Error tracking Web Vitals:", error);
  }
}

// Fallback performance tracking without external dependencies
function trackBasicPerformance() {
  if (!window.performance) return;

  // Track page load time
  window.addEventListener("load", () => {
    const loadTime = performance.now();
    event({
      action: "page_load_time",
      category: "Performance",
      label: "Basic Load Time",
      value: Math.round(loadTime),
    });
  });

  // Track DOM content loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const domTime = performance.now();
      event({
        action: "dom_content_loaded",
        category: "Performance",
        label: "DOM Ready",
        value: Math.round(domTime),
      });
    });
  }
}

// Track additional performance metrics
function trackAdditionalMetrics() {
  if (!window.performance) return;

  // Track page load time
  window.addEventListener("load", () => {
    const loadTime = performance.now();
    event({
      action: "page_load_time",
      category: "Performance",
      label: window.location.pathname,
      value: Math.round(loadTime),
    });
  });

  // Track DOM content loaded time
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const domLoadTime = performance.now();
      event({
        action: "dom_content_loaded",
        category: "Performance",
        label: window.location.pathname,
        value: Math.round(domLoadTime),
      });
    });
  }

  // Track resource loading performance
  setTimeout(() => {
    const resources = performance.getEntriesByType("resource");
    const slowResources = resources.filter(
      (resource) => resource.duration > 1000
    );

    if (slowResources.length > 0) {
      event({
        action: "slow_resources",
        category: "Performance",
        label: "Resources over 1s",
        value: slowResources.length,
      });
    }
  }, 5000); // Check after 5 seconds
}

// Performance observer for monitoring
export function initPerformanceObserver() {
  if (typeof window === "undefined" || !window.PerformanceObserver) return;

  try {
    // Observe long tasks (> 50ms)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          event({
            action: "long_task",
            category: "Performance",
            label: "Task over 50ms",
            value: Math.round(entry.duration),
          });
        }
      });
    });
    longTaskObserver.observe({ entryTypes: ["longtask"] });

    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      let cumulativeScore = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
        }
      });

      if (cumulativeScore > 0.1) {
        // Threshold for poor CLS
        event({
          action: "layout_shift",
          category: "Performance",
          label: "High CLS detected",
          value: Math.round(cumulativeScore * 1000),
        });
      }
    });
    layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
  } catch (error) {
    console.error("Error initializing Performance Observer:", error);
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  if (typeof window === "undefined") return;

  // Start tracking immediately
  reportWebVitals();

  // Initialize performance observer
  initPerformanceObserver();

  // Track on page visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      reportWebVitals();
    }
  });
}

export default initWebVitals;
