#!/usr/bin/env node

/**
 * Comprehensive Metatags and Head Elements Test Script
 * Tests all SEO-related elements across different page types
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Configuration
const BASE_URL = "http://localhost:3001";
const OUTPUT_FILE = "metatags-test-results.json";

// Test pages configuration
const TEST_PAGES = [
  {
    name: "Homepage",
    url: "/",
    type: "homepage",
    expectedElements: [
      "title",
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'meta[property="og:url"]',
      'meta[property="og:type"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
      'link[rel="canonical"]',
      'script[type="application/ld+json"]',
    ],
  },
  {
    name: "Post Page",
    url: "/post/nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram",
    type: "post",
    expectedElements: [
      "title",
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'meta[property="og:url"]',
      'meta[property="og:type"]',
      'meta[property="article:published_time"]',
      'meta[property="article:modified_time"]',
      'meta[property="article:author"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
      'link[rel="canonical"]',
      'script[type="application/ld+json"]',
    ],
  },
  {
    name: "Category Page",
    url: "/category/marvel",
    type: "category",
    expectedElements: [
      "title",
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'meta[property="og:url"]',
      'meta[property="og:type"]',
      'meta[name="twitter:card"]',
      'link[rel="canonical"]',
      'script[type="application/ld+json"]',
    ],
  },
];

// Essential head elements that should be present on all pages
const ESSENTIAL_HEAD_ELEMENTS = [
  "meta[charset]",
  'meta[name="viewport"]',
  'link[rel="icon"]',
  'meta[name="theme-color"]',
  'link[rel="preconnect"]',
];

/**
 * Extract metatags and head elements from a page
 */
async function extractMetatags(page, url) {
  console.log(`\n🔍 Testing: ${url}`);

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const results = await page.evaluate(() => {
      const extractedData = {
        title: document.title,
        metaTags: {},
        linkTags: {},
        structuredData: [],
        headElements: [],
        errors: [],
      };

      // Extract all meta tags
      const metaTags = document.querySelectorAll("meta");
      metaTags.forEach((meta) => {
        const name =
          meta.getAttribute("name") ||
          meta.getAttribute("property") ||
          meta.getAttribute("http-equiv");
        const content = meta.getAttribute("content");
        if (name && content) {
          extractedData.metaTags[name] = content;
        }
      });

      // Extract all link tags
      const linkTags = document.querySelectorAll("link");
      linkTags.forEach((link) => {
        const rel = link.getAttribute("rel");
        const href = link.getAttribute("href");
        if (rel) {
          if (!extractedData.linkTags[rel]) {
            extractedData.linkTags[rel] = [];
          }
          extractedData.linkTags[rel].push({
            href: href,
            type: link.getAttribute("type"),
            sizes: link.getAttribute("sizes"),
            media: link.getAttribute("media"),
          });
        }
      });

      // Extract structured data (JSON-LD)
      const jsonLdScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      jsonLdScripts.forEach((script) => {
        try {
          const data = JSON.parse(script.textContent);
          extractedData.structuredData.push(data);
        } catch (e) {
          extractedData.errors.push(`Invalid JSON-LD: ${e.message}`);
        }
      });

      // Extract all head elements for comprehensive analysis
      const headElements = document.head.children;
      Array.from(headElements).forEach((element) => {
        extractedData.headElements.push({
          tagName: element.tagName,
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          textContent: element.textContent
            ? element.textContent.substring(0, 100)
            : null,
        });
      });

      return extractedData;
    });

    return results;
  } catch (error) {
    console.error(`❌ Error testing ${url}:`, error.message);
    return {
      error: error.message,
      title: null,
      metaTags: {},
      linkTags: {},
      structuredData: [],
      headElements: [],
    };
  }
}

/**
 * Validate essential SEO elements
 */
function validateSEOElements(data, expectedElements, pageName) {
  const validation = {
    pageName,
    passed: [],
    failed: [],
    warnings: [],
    score: 0,
  };

  // Check for expected elements
  expectedElements.forEach((selector) => {
    let found = false;

    if (selector === "title") {
      found = !!data.title && data.title.length > 0;
      if (found) {
        validation.passed.push(`✅ Title: "${data.title}"`);
        if (data.title.length > 60) {
          validation.warnings.push(
            `⚠️ Title too long (${data.title.length} chars): "${data.title}"`
          );
        }
      } else {
        validation.failed.push(`❌ Missing or empty title`);
      }
    } else if (
      selector.startsWith('meta[name="') ||
      selector.startsWith('meta[property="')
    ) {
      const attrMatch = selector.match(/\[(name|property)="([^"]+)"\]/);
      if (attrMatch) {
        const [, attrType, attrValue] = attrMatch;
        found = !!data.metaTags[attrValue];
        if (found) {
          validation.passed.push(
            `✅ ${attrValue}: "${data.metaTags[attrValue]}"`
          );

          // Check description length
          if (
            attrValue === "description" &&
            data.metaTags[attrValue].length > 160
          ) {
            validation.warnings.push(
              `⚠️ Description too long (${data.metaTags[attrValue].length} chars)`
            );
          }
        } else {
          validation.failed.push(`❌ Missing ${attrValue} meta tag`);
        }
      }
    } else if (selector.startsWith('link[rel="')) {
      const relMatch = selector.match(/rel="([^"]+)"/);
      if (relMatch) {
        const relValue = relMatch[1];
        found = !!data.linkTags[relValue] && data.linkTags[relValue].length > 0;
        if (found) {
          validation.passed.push(`✅ ${relValue} link found`);
        } else {
          validation.failed.push(`❌ Missing ${relValue} link`);
        }
      }
    } else if (selector === 'script[type="application/ld+json"]') {
      found = data.structuredData.length > 0;
      if (found) {
        validation.passed.push(
          `✅ Structured data found (${data.structuredData.length} schemas)`
        );
      } else {
        validation.failed.push(`❌ Missing structured data`);
      }
    }
  });

  // Calculate score
  validation.score = Math.round(
    (validation.passed.length / expectedElements.length) * 100
  );

  return validation;
}

/**
 * Generate detailed report
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: results.length,
      averageScore: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalWarnings: 0,
    },
    pages: results,
    recommendations: [],
  };

  // Calculate summary statistics
  results.forEach((result) => {
    if (result.validation) {
      report.summary.totalPassed += result.validation.passed.length;
      report.summary.totalFailed += result.validation.failed.length;
      report.summary.totalWarnings += result.validation.warnings.length;
    }
  });

  const validResults = results.filter(
    (r) => r.validation && typeof r.validation.score === "number"
  );
  if (validResults.length > 0) {
    report.summary.averageScore = Math.round(
      validResults.reduce((sum, r) => sum + r.validation.score, 0) /
        validResults.length
    );
  }

  // Generate recommendations
  const commonIssues = {};
  results.forEach((result) => {
    if (result.validation && result.validation.failed) {
      result.validation.failed.forEach((issue) => {
        commonIssues[issue] = (commonIssues[issue] || 0) + 1;
      });
    }
  });

  Object.entries(commonIssues).forEach(([issue, count]) => {
    if (count > 1) {
      report.recommendations.push(
        `Fix common issue appearing on ${count} pages: ${issue}`
      );
    }
  });

  return report;
}

/**
 * Main test function
 */
async function runMetatagsTest() {
  console.log("🚀 Starting Metatags and Head Elements Test...\n");

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)");

    const results = [];

    for (const testPage of TEST_PAGES) {
      const data = await extractMetatags(page, testPage.url);
      const validation = validateSEOElements(
        data,
        testPage.expectedElements,
        testPage.name
      );

      results.push({
        ...testPage,
        data,
        validation,
        timestamp: new Date().toISOString(),
      });

      // Display immediate results
      console.log(`\n📊 Results for ${testPage.name}:`);
      console.log(`Score: ${validation.score}%`);
      console.log(`Passed: ${validation.passed.length}`);
      console.log(`Failed: ${validation.failed.length}`);
      console.log(`Warnings: ${validation.warnings.length}`);
    }

    // Generate and save report
    const report = generateReport(results);

    // Save detailed results to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed results saved to: ${OUTPUT_FILE}`);

    // Display summary
    console.log("\n📈 SUMMARY REPORT");
    console.log("=".repeat(50));
    console.log(`Total Pages Tested: ${report.summary.totalPages}`);
    console.log(`Average Score: ${report.summary.averageScore}%`);
    console.log(`Total Passed: ${report.summary.totalPassed}`);
    console.log(`Total Failed: ${report.summary.totalFailed}`);
    console.log(`Total Warnings: ${report.summary.totalWarnings}`);

    if (report.recommendations.length > 0) {
      console.log("\n🔧 RECOMMENDATIONS:");
      report.recommendations.forEach((rec) => console.log(`• ${rec}`));
    }

    // Display individual page results
    console.log("\n📋 INDIVIDUAL PAGE RESULTS:");
    results.forEach((result) => {
      console.log(`\n${result.name} (${result.validation.score}%):`);

      if (result.validation.failed.length > 0) {
        console.log("  Failed checks:");
        result.validation.failed.forEach((fail) => console.log(`    ${fail}`));
      }

      if (result.validation.warnings.length > 0) {
        console.log("  Warnings:");
        result.validation.warnings.forEach((warn) =>
          console.log(`    ${warn}`)
        );
      }
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  runMetatagsTest().catch(console.error);
}

module.exports = { runMetatagsTest };
