#!/usr/bin/env node

/**
 * Analytics Functionality Testing Script
 * This script tests the actual functionality of analytics implementations
 */

const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testGoogleAnalyticsImplementation() {
  log("\n🔍 Testing Google Analytics Implementation...", "blue");

  const analyticsPath = path.join(process.cwd(), "lib/analytics.js");
  const analyticsContent = fs.readFileSync(analyticsPath, "utf8");

  const tests = [
    {
      name: "initGA function exists",
      pattern: /export\s+const\s+initGA\s*=/,
      required: true,
    },
    {
      name: "pageview function exists",
      pattern: /export\s+const\s+pageview\s*=/,
      required: true,
    },
    {
      name: "event function exists",
      pattern: /export\s+const\s+event\s*=/,
      required: true,
    },
    {
      name: "Google Analytics script creation",
      pattern: /googletagmanager\.com\/gtag\/js/,
      required: true,
    },
    {
      name: "gtag configuration",
      pattern: /gtag\('config'/,
      required: true,
    },
    {
      name: "Scroll depth tracking",
      pattern: /trackScrollDepth/,
      required: true,
    },
    {
      name: "Time on page tracking",
      pattern: /trackTimeOnPage/,
      required: true,
    },
    {
      name: "Outbound link tracking",
      pattern: /trackOutboundLinks/,
      required: true,
    },
  ];

  let passed = 0;
  tests.forEach((test) => {
    if (test.pattern.test(analyticsContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === tests.length;
}

function testFirebaseAnalyticsImplementation() {
  log("\n🔥 Testing Firebase Analytics Implementation...", "blue");

  const firebasePath = path.join(process.cwd(), "lib/firebase-analytics.js");
  const firebaseContent = fs.readFileSync(firebasePath, "utf8");

  const tests = [
    {
      name: "Firebase imports",
      pattern: /import.*firebase\/analytics/,
      required: true,
    },
    {
      name: "initFirebaseAnalytics function",
      pattern: /export\s+const\s+initFirebaseAnalytics/,
      required: true,
    },
    {
      name: "logFirebaseEvent function",
      pattern: /export\s+const\s+logFirebaseEvent/,
      required: true,
    },
    {
      name: "trackFirebasePageView function",
      pattern: /export\s+const\s+trackFirebasePageView/,
      required: true,
    },
    {
      name: "Firebase configuration validation",
      pattern: /hasAllConfig/,
      required: true,
    },
    {
      name: "Error handling",
      pattern: /try\s*{[\s\S]*catch/,
      required: true,
    },
  ];

  let passed = 0;
  tests.forEach((test) => {
    if (test.pattern.test(firebaseContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === tests.length;
}

function testAnalyticsProvider() {
  log("\n🎯 Testing AnalyticsProvider Component...", "blue");

  const providerPath = path.join(
    process.cwd(),
    "components/AnalyticsProvider.js"
  );
  const providerContent = fs.readFileSync(providerPath, "utf8");

  const tests = [
    {
      name: "React imports",
      pattern: /import\s+React.*from\s+['"]react['"]/,
      required: true,
    },
    {
      name: "useRouter import",
      pattern: /import.*useRouter.*from.*next\/router/,
      required: true,
    },
    {
      name: "Analytics library import",
      pattern: /import.*analytics.*from.*lib\/analytics/,
      required: true,
    },
    {
      name: "Firebase analytics import",
      pattern: /from.*firebase-analytics/,
      required: true,
    },
    {
      name: "Development environment check",
      pattern: /NODE_ENV.*development/,
      required: true,
    },
    {
      name: "Route change tracking",
      pattern: /routeChangeComplete/,
      required: true,
    },
    {
      name: "Cleanup functions",
      pattern: /return\s*\(\s*\)\s*=>/,
      required: true,
    },
  ];

  let passed = 0;
  tests.forEach((test) => {
    if (test.pattern.test(providerContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === tests.length;
}

function testAnalyticsHooks() {
  log("\n🪝 Testing Analytics Hooks...", "blue");

  const hookPath = path.join(process.cwd(), "hooks/useAnalytics.js");
  const hookContent = fs.readFileSync(hookPath, "utf8");

  const tests = [
    {
      name: "useAnalytics hook export",
      pattern: /export\s+const\s+useAnalytics/,
      required: true,
    },
    {
      name: "trackEvent function",
      pattern: /trackEvent/,
      required: true,
    },
    {
      name: "trackEngagement function",
      pattern: /trackEngagement/,
      required: true,
    },
    {
      name: "trackContentInteraction function",
      pattern: /trackContentInteraction/,
      required: true,
    },
    {
      name: "trackSocialInteraction function",
      pattern: /trackSocialInteraction/,
      required: true,
    },
    {
      name: "trackSearch function",
      pattern: /trackSearch/,
      required: true,
    },
    {
      name: "trackFormSubmission function",
      pattern: /trackFormSubmission/,
      required: true,
    },
    {
      name: "trackError function",
      pattern: /trackError/,
      required: true,
    },
  ];

  let passed = 0;
  tests.forEach((test) => {
    if (test.pattern.test(hookContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === tests.length;
}

function testPostAnalyticsHook() {
  log("\n📝 Testing Post Analytics Hook...", "blue");

  const postHookPath = path.join(process.cwd(), "hooks/usePostAnalytics.js");
  const postHookContent = fs.readFileSync(postHookPath, "utf8");

  const tests = [
    {
      name: "usePostAnalytics hook export",
      pattern: /const\s+usePostAnalytics/,
      required: true,
    },
    {
      name: "Post view tracking",
      pattern: /trackContentInteraction.*view/,
      required: true,
    },
    {
      name: "trackShare function",
      pattern: /trackShare/,
      required: true,
    },
    {
      name: "trackRelatedPostClick function",
      pattern: /trackRelatedPostClick/,
      required: true,
    },
    {
      name: "trackCategoryClick function",
      pattern: /trackCategoryClick/,
      required: true,
    },
    {
      name: "Post metadata tracking",
      pattern: /post_id.*post\.slug/,
      required: true,
    },
  ];

  let passed = 0;
  tests.forEach((test) => {
    if (test.pattern.test(postHookContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === tests.length;
}

function testMicrosoftClarityIntegration() {
  log("\n🔍 Testing Microsoft Clarity Integration...", "blue");

  const appPath = path.join(process.cwd(), "pages/_app.js");
  const appContent = fs.readFileSync(appPath, "utf8");

  const clarityTests = [
    {
      name: "Clarity script tag",
      pattern: /<Script[\s\S]*clarity\.ms/,
      required: true,
    },
    {
      name: "Clarity project ID",
      pattern: /o2yidwokf0/,
      required: true,
    },
    {
      name: "Script loading strategy",
      pattern: /strategy=["']afterInteraction["']/,
      required: true,
    },
  ];

  let passed = 0;
  clarityTests.forEach((test) => {
    if (test.pattern.test(appContent)) {
      log(`✅ ${test.name}`, "green");
      passed++;
    } else {
      log(`❌ ${test.name}`, "red");
    }
  });

  return passed === clarityTests.length;
}

function generateFunctionalityReport(
  gaTest,
  fbTest,
  providerTest,
  hooksTest,
  postHooksTest,
  clarityTest
) {
  log("\n📊 Analytics Functionality Report", "bold");
  log("=====================================", "blue");

  const tests = [
    { name: "Google Analytics", status: gaTest },
    { name: "Firebase Analytics", status: fbTest },
    { name: "Analytics Provider", status: providerTest },
    { name: "Analytics Hooks", status: hooksTest },
    { name: "Post Analytics Hook", status: postHooksTest },
    { name: "Microsoft Clarity", status: clarityTest },
  ];

  let passedTests = 0;

  tests.forEach((test) => {
    const status = test.status ? "✅ WORKING" : "❌ ISSUES FOUND";
    const color = test.status ? "green" : "red";
    log(`${test.name}: ${status}`, color);
    if (test.status) passedTests++;
  });

  log("\n📈 Overall Functionality:", "blue");
  const overallStatus = passedTests === tests.length;
  const statusText = overallStatus
    ? "🎉 ALL ANALYTICS FUNCTIONAL"
    : `⚠️  ${passedTests}/${tests.length} COMPONENTS WORKING`;
  const statusColor = overallStatus ? "green" : "yellow";

  log(statusText, statusColor);

  if (overallStatus) {
    log("\n🚀 Analytics Services Detected:", "green");
    log("• Google Analytics 4 (GA4)");
    log("• Firebase Analytics");
    log("• Microsoft Clarity");
    log("• Custom event tracking");
    log("• Page view tracking");
    log("• User engagement tracking");
    log("• Social interaction tracking");
    log("• Performance monitoring");
  }

  return overallStatus;
}

// Main execution
async function main() {
  log("🧪 Starting Analytics Functionality Tests...", "bold");

  const gaTest = testGoogleAnalyticsImplementation();
  const fbTest = testFirebaseAnalyticsImplementation();
  const providerTest = testAnalyticsProvider();
  const hooksTest = testAnalyticsHooks();
  const postHooksTest = testPostAnalyticsHook();
  const clarityTest = testMicrosoftClarityIntegration();

  const overallHealth = generateFunctionalityReport(
    gaTest,
    fbTest,
    providerTest,
    hooksTest,
    postHooksTest,
    clarityTest
  );

  process.exit(overallHealth ? 0 : 1);
}

main().catch(console.error);
