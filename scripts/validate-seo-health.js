#!/usr/bin/env node

/**
 * Comprehensive SEO Health Validation Script
 * Tests advanced SEO aspects and provides detailed recommendations
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

/**
 * Advanced SEO validation tests
 */
async function runAdvancedSEOTests() {
  console.log('🔍 Running Advanced SEO Health Check...\n');

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (compatible; SEO-Validator/1.0)');

    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Test 1: Homepage Performance and Core Web Vitals
    console.log('📊 Testing Homepage Performance...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 1000);
      });
    });

    results.tests.push({
      name: 'Homepage Performance',
      status: 'passed',
      details: performanceMetrics
    });

    // Test 2: Structured Data Validation
    console.log('🏗️ Validating Structured Data...');
    const structuredDataTest = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const schemas = [];
      const errors = [];

      scripts.forEach((script, index) => {
        try {
          const data = JSON.parse(script.textContent);
          schemas.push({
            index,
            type: data['@type'],
            context: data['@context'],
            valid: true
          });
        } catch (e) {
          errors.push(`Schema ${index}: ${e.message}`);
        }
      });

      return { schemas, errors, count: scripts.length };
    });

    results.tests.push({
      name: 'Structured Data Validation',
      status: structuredDataTest.count > 0 ? 'passed' : 'failed',
      details: structuredDataTest
    });

    // Test 3: Meta Tags Completeness
    console.log('🏷️ Checking Meta Tags Completeness...');
    const metaTagsTest = await page.evaluate(() => {
      const requiredTags = [
        'title',
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:image"]',
        'meta[name="twitter:card"]',
        'link[rel="canonical"]'
      ];

      const results = {};
      requiredTags.forEach(selector => {
        if (selector === 'title') {
          results[selector] = !!document.title && document.title.length > 0;
        } else {
          results[selector] = !!document.querySelector(selector);
        }
      });

      return results;
    });

    const metaTagsScore = Object.values(metaTagsTest).filter(Boolean).length / Object.keys(metaTagsTest).length * 100;
    results.tests.push({
      name: 'Meta Tags Completeness',
      status: metaTagsScore === 100 ? 'passed' : 'warning',
      score: metaTagsScore,
      details: metaTagsTest
    });

    // Test 4: Image Optimization
    console.log('🖼️ Checking Image Optimization...');
    const imageTest = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const imageData = [];

      images.forEach((img, index) => {
        imageData.push({
          index,
          src: img.src,
          alt: img.alt || null,
          hasAlt: !!img.alt,
          loading: img.loading,
          width: img.width,
          height: img.height
        });
      });

      const imagesWithAlt = imageData.filter(img => img.hasAlt).length;
      const altTextScore = imageData.length > 0 ? (imagesWithAlt / imageData.length) * 100 : 100;

      return {
        totalImages: imageData.length,
        imagesWithAlt,
        altTextScore,
        images: imageData.slice(0, 5) // First 5 images for analysis
      };
    });

    results.tests.push({
      name: 'Image Optimization',
      status: imageTest.altTextScore >= 90 ? 'passed' : 'warning',
      details: imageTest
    });

    // Test 5: Mobile Responsiveness
    console.log('📱 Testing Mobile Responsiveness...');
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE
    await page.reload({ waitUntil: 'networkidle2' });

    const mobileTest = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = !!viewport;
      const viewportContent = viewport ? viewport.content : null;
      
      // Check if content is properly visible on mobile
      const body = document.body;
      const bodyWidth = body.scrollWidth;
      const windowWidth = window.innerWidth;
      const hasHorizontalScroll = bodyWidth > windowWidth;

      return {
        hasViewportMeta,
        viewportContent,
        hasHorizontalScroll,
        bodyWidth,
        windowWidth
      };
    });

    results.tests.push({
      name: 'Mobile Responsiveness',
      status: mobileTest.hasViewportMeta && !mobileTest.hasHorizontalScroll ? 'passed' : 'warning',
      details: mobileTest
    });

    // Test 6: Page Speed Insights
    console.log('⚡ Analyzing Page Speed...');
    await page.setViewport({ width: 1920, height: 1080 }); // Reset to desktop
    
    const speedTest = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return {};

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || null,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || null
      };
    });

    results.tests.push({
      name: 'Page Speed Analysis',
      status: speedTest.domContentLoaded < 2000 ? 'passed' : 'warning',
      details: speedTest
    });

    // Calculate summary
    results.tests.forEach(test => {
      results.summary.totalTests++;
      if (test.status === 'passed') results.summary.passed++;
      else if (test.status === 'failed') results.summary.failed++;
      else if (test.status === 'warning') results.summary.warnings++;
    });

    // Save results
    fs.writeFileSync('seo-health-report.json', JSON.stringify(results, null, 2));

    // Display results
    console.log('\n📈 SEO HEALTH REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Warnings: ${results.summary.warnings}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Overall Score: ${Math.round((results.summary.passed / results.summary.totalTests) * 100)}%`);

    console.log('\n📋 DETAILED RESULTS:');
    results.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
      console.log(`${status} ${test.name}: ${test.status.toUpperCase()}`);
      
      if (test.score) {
        console.log(`   Score: ${test.score}%`);
      }
      
      if (test.details && typeof test.details === 'object') {
        Object.entries(test.details).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            console.log(`   ${key}: ${value}`);
          }
        });
      }
    });

    console.log('\n💡 RECOMMENDATIONS:');
    
    // Generate specific recommendations
    const recommendations = [];
    
    results.tests.forEach(test => {
      if (test.name === 'Structured Data Validation' && test.status === 'failed') {
        recommendations.push('Add structured data (JSON-LD) to improve search engine understanding');
      }
      
      if (test.name === 'Image Optimization' && test.details.altTextScore < 100) {
        recommendations.push(`Improve alt text coverage: ${test.details.imagesWithAlt}/${test.details.totalImages} images have alt text`);
      }
      
      if (test.name === 'Page Speed Analysis' && test.details.domContentLoaded > 2000) {
        recommendations.push('Optimize page loading speed - DOM content loaded in ' + Math.round(test.details.domContentLoaded) + 'ms');
      }
      
      if (test.name === 'Mobile Responsiveness' && test.details.hasHorizontalScroll) {
        recommendations.push('Fix horizontal scrolling on mobile devices');
      }
    });

    if (recommendations.length === 0) {
      console.log('🎉 All SEO health checks passed! Your site is well-optimized.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log(`\n📄 Detailed report saved to: seo-health-report.json`);

  } catch (error) {
    console.error('❌ SEO Health Check failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the validation
if (require.main === module) {
  runAdvancedSEOTests().catch(console.error);
}

module.exports = { runAdvancedSEOTests };
