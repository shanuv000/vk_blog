/**
 * API Call Monitor for Homepage Loading
 * This script helps track and analyze Hygraph API calls during homepage loading
 */

class ApiCallMonitor {
  constructor() {
    this.calls = [];
    this.startTime = null;
    this.isMonitoring = false;
  }

  start() {
    this.calls = [];
    this.startTime = Date.now();
    this.isMonitoring = true;

    // Intercept fetch calls
    this.originalFetch = window.fetch;
    window.fetch = this.interceptFetch.bind(this);

    console.log("🔍 [API Monitor] Started monitoring API calls...");
  }

  stop() {
    if (!this.isMonitoring) return;

    // Restore original fetch
    window.fetch = this.originalFetch;
    this.isMonitoring = false;

    const totalTime = Date.now() - this.startTime;
    console.log("⏹️ [API Monitor] Stopped monitoring after", totalTime + "ms");

    return this.generateReport();
  }

  interceptFetch(url, options = {}) {
    const startTime = Date.now();

    // Check if this is a Hygraph-related call
    const isHygraphCall =
      url.includes("hygraph") ||
      url.includes("/api/direct-graphql") ||
      url.includes("/api/hygraph-proxy");

    if (isHygraphCall) {
      const callInfo = {
        url,
        method: options.method || "GET",
        timestamp: startTime - this.startTime,
        startTime,
      };

      // Try to extract query info from POST body
      if (options.body) {
        try {
          const body = JSON.parse(options.body);
          if (body.query) {
            callInfo.queryType = this.extractQueryType(body.query);
          }
          if (body.type) {
            callInfo.queryType = body.type;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // For GET requests, extract from URL
      if (url.includes("type=")) {
        const urlObj = new URL(url, window.location.origin);
        callInfo.queryType = urlObj.searchParams.get("type");
      }

      this.calls.push(callInfo);

      console.log("📡 [API Monitor] Hygraph call detected:", {
        type: callInfo.queryType || "unknown",
        url: url.substring(url.lastIndexOf("/") + 1),
        timestamp: callInfo.timestamp + "ms",
      });
    }

    // Make the actual request and track completion
    return this.originalFetch(url, options)
      .then((response) => {
        if (isHygraphCall) {
          const endTime = Date.now();
          const call = this.calls.find((c) => c.startTime === startTime);
          if (call) {
            call.endTime = endTime;
            call.duration = endTime - startTime;
            call.success = response.ok;
            call.status = response.status;
          }
        }
        return response;
      })
      .catch((error) => {
        if (isHygraphCall) {
          const call = this.calls.find((c) => c.startTime === startTime);
          if (call) {
            call.endTime = Date.now();
            call.duration = call.endTime - startTime;
            call.success = false;
            call.error = error.message;
          }
        }
        throw error;
      });
  }

  extractQueryType(query) {
    if (query.includes("GetFeaturedPosts")) return "featuredPosts";
    if (query.includes("GetRecentPosts")) return "recentPosts";
    if (query.includes("GetCategories")) return "categories";
    if (query.includes("GetPosts")) return "posts";
    if (query.includes("GetSimilarPosts")) return "similarPosts";
    return "unknown";
  }

  generateReport() {
    const report = {
      totalCalls: this.calls.length,
      totalDuration: Date.now() - this.startTime,
      hygraphCalls: this.calls,
      callsByType: {},
      duplicateCalls: [],
      performance: {
        fastest: null,
        slowest: null,
        average: 0,
      },
    };

    // Analyze calls by type
    this.calls.forEach((call) => {
      const type = call.queryType || "unknown";
      if (!report.callsByType[type]) {
        report.callsByType[type] = [];
      }
      report.callsByType[type].push(call);
    });

    // Find duplicate calls (same type within short time window)
    const typeTimestamps = {};
    this.calls.forEach((call) => {
      const type = call.queryType || "unknown";
      if (!typeTimestamps[type]) {
        typeTimestamps[type] = [];
      }
      typeTimestamps[type].push(call.timestamp);
    });

    Object.entries(typeTimestamps).forEach(([type, timestamps]) => {
      if (timestamps.length > 1) {
        // Check if calls are within 1 second of each other
        for (let i = 1; i < timestamps.length; i++) {
          if (timestamps[i] - timestamps[i - 1] < 1000) {
            report.duplicateCalls.push({
              type,
              timestamps: [timestamps[i - 1], timestamps[i]],
              timeDiff: timestamps[i] - timestamps[i - 1],
            });
          }
        }
      }
    });

    // Performance analysis
    const durations = this.calls
      .filter((call) => call.duration)
      .map((call) => call.duration);

    if (durations.length > 0) {
      report.performance.fastest = Math.min(...durations);
      report.performance.slowest = Math.max(...durations);
      report.performance.average =
        durations.reduce((a, b) => a + b) / durations.length;
    }

    this.printReport(report);
    return report;
  }

  printReport(report) {
    console.group("📊 [API Monitor] Homepage Loading Analysis");

    console.log("📈 Summary:");
    console.log(`  • Total API calls: ${report.totalCalls}`);
    console.log(`  • Total loading time: ${report.totalDuration}ms`);
    console.log(
      `  • Unique call types: ${Object.keys(report.callsByType).length}`
    );

    if (report.duplicateCalls.length > 0) {
      console.warn("⚠️ Potential Issues:");
      console.log(
        `  • Duplicate calls detected: ${report.duplicateCalls.length}`
      );
      report.duplicateCalls.forEach((dup) => {
        console.log(`    - ${dup.type}: ${dup.timeDiff}ms apart`);
      });
    }

    console.log("🎯 Call Breakdown:");
    Object.entries(report.callsByType).forEach(([type, calls]) => {
      console.log(`  • ${type}: ${calls.length} calls`);
      if (calls.length > 1) {
        console.warn(
          `    ⚠️ Multiple calls for ${type} - consider deduplication`
        );
      }
    });

    if (report.performance.average) {
      console.log("⚡ Performance:");
      console.log(`  • Fastest: ${report.performance.fastest}ms`);
      console.log(`  • Slowest: ${report.performance.slowest}ms`);
      console.log(`  • Average: ${Math.round(report.performance.average)}ms`);
    }

    console.groupEnd();
  }
}

// Create global instance
window.apiMonitor = new ApiCallMonitor();

// Auto-start monitoring when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.apiMonitor.start();

    // Stop monitoring after 10 seconds or when page is fully loaded
    setTimeout(() => {
      window.apiMonitor.stop();
    }, 10000);
  });
} else {
  // Page already loaded
  window.apiMonitor.start();
  setTimeout(() => {
    window.apiMonitor.stop();
  }, 5000);
}

export default ApiCallMonitor;
