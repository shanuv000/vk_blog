#!/usr/bin/env node

/**
 * Hygraph API Performance Analysis Script
 * Run this to analyze and optimize your Hygraph API usage
 */

const fs = require("fs");
const path = require("path");

const ANALYSIS_CONFIG = {
  // Performance thresholds (in milliseconds)
  SLOW_QUERY_THRESHOLD: 2000,
  WARNING_THRESHOLD: 1000,

  // Cache hit rate targets
  MIN_CACHE_HIT_RATE: 60, // 60% minimum
  GOOD_CACHE_HIT_RATE: 80, // 80% good performance

  // Query complexity limits
  MAX_QUERY_DEPTH: 5,
  MAX_FIELDS_PER_QUERY: 20,
};

class HygraphAnalyzer {
  constructor() {
    this.queryPatterns = new Map();
    this.performanceMetrics = {
      totalQueries: 0,
      cachedQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
    };
  }

  analyzeServiceFiles() {
    console.log("🔍 Analyzing Hygraph service files...\n");

    const serviceFiles = [
      "services/hygraph.js",
      "services/index.js",
      "hooks/useApolloQueries.js",
      "services/pagination.js",
    ];

    const issues = [];
    const recommendations = [];

    serviceFiles.forEach((file) => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        this.analyzeFileContent(content, file, issues, recommendations);
      }
    });

    this.generateReport(issues, recommendations);
  }

  analyzeFileContent(content, filename, issues, recommendations) {
    // Check for performance anti-patterns
    const antiPatterns = [
      {
        pattern: /first:\s*\$?\{?\w*\}?(?:\s*,|\s*\))/g,
        message: `${filename}: Dynamic limits without validation detected`,
        severity: "HIGH",
        recommendation:
          "Add limit validation with Math.min(limit, MAX_SAFE_LIMIT)",
      },
      {
        pattern: /orderBy:\s*createdAt_DESC.*first:\s*[2-9]\d+/g,
        message: `${filename}: Large result sets (>20) detected`,
        severity: "HIGH",
        recommendation: "Use pagination instead of large single queries",
      },
      {
        pattern: /console\.log.*query/gi,
        message: `${filename}: Debug logging in production code`,
        severity: "LOW",
        recommendation: "Wrap debug logs with NODE_ENV checks",
      },
      {
        pattern: /\.request\(query.*without.*cache/gi,
        message: `${filename}: Queries without caching detected`,
        severity: "MEDIUM",
        recommendation: "Implement caching for all read queries",
      },
    ];

    antiPatterns.forEach((antiPattern) => {
      const matches = content.match(antiPattern.pattern);
      if (matches) {
        issues.push({
          file: filename,
          issue: antiPattern.message,
          severity: antiPattern.severity,
          count: matches.length,
        });
        recommendations.push(antiPattern.recommendation);
      }
    });

    // Check for optimization opportunities
    const optimizations = [
      {
        pattern: /featuredImage\s*\{\s*url\s*\}/g,
        message: `${filename}: Unoptimized image queries`,
        recommendation:
          "Add image transformations: url(transformation: { image: { resize: { width: 800 } } })",
      },
      {
        pattern: /gql`[^`]*query[^`]*\{[^}]*author[^}]*photo[^}]*url[^}]*\}/gs,
        message: `${filename}: Author photos without size optimization`,
        recommendation: "Optimize author photo sizes to 150x150px",
      },
    ];

    optimizations.forEach((optimization) => {
      const matches = content.match(optimization.pattern);
      if (matches) {
        recommendations.push(`${filename}: ${optimization.recommendation}`);
      }
    });
  }

  generateReport(issues, recommendations) {
    console.log("📊 HYGRAPH API OPTIMIZATION REPORT");
    console.log("=".repeat(50));
    console.log();

    // Summary
    console.log("📋 SUMMARY");
    console.log(`Total issues found: ${issues.length}`);
    console.log(
      `High priority: ${issues.filter((i) => i.severity === "HIGH").length}`
    );
    console.log(
      `Medium priority: ${issues.filter((i) => i.severity === "MEDIUM").length}`
    );
    console.log(
      `Low priority: ${issues.filter((i) => i.severity === "LOW").length}`
    );
    console.log();

    // Issues by priority
    ["HIGH", "MEDIUM", "LOW"].forEach((severity) => {
      const severityIssues = issues.filter((i) => i.severity === severity);
      if (severityIssues.length > 0) {
        console.log(`🚨 ${severity} PRIORITY ISSUES`);
        severityIssues.forEach((issue) => {
          console.log(
            `  • ${issue.issue} ${
              issue.count ? `(${issue.count} occurrences)` : ""
            }`
          );
        });
        console.log();
      }
    });

    // Recommendations
    if (recommendations.length > 0) {
      console.log("💡 OPTIMIZATION RECOMMENDATIONS");
      [...new Set(recommendations)].forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log();
    }

    // Performance tips
    console.log("🚀 PERFORMANCE OPTIMIZATION TIPS");
    console.log("  1. Use cursor-based pagination for large datasets");
    console.log("  2. Implement image transformations in GraphQL queries");
    console.log("  3. Add query result caching with appropriate TTLs");
    console.log("  4. Validate and cap query limits (max 50 items per query)");
    console.log("  5. Use CDN endpoints for read-only operations");
    console.log("  6. Implement connection pooling for high-traffic apps");
    console.log("  7. Monitor query performance and cache hit rates");
    console.log();

    // Generate optimization checklist
    this.generateOptimizationChecklist();
  }

  generateOptimizationChecklist() {
    const checklist = `
# Hygraph API Optimization Checklist

## ✅ Performance Optimizations
- [ ] All queries have limits validation (max 50)
- [ ] Image queries include transformation parameters
- [ ] Caching implemented with appropriate TTLs
- [ ] Connection-based pagination for large datasets
- [ ] Query result size monitoring
- [ ] Error handling with graceful fallbacks

## 🔧 Technical Improvements  
- [ ] Consolidated query fragments to reduce duplication
- [ ] Performance monitoring and logging
- [ ] Query complexity analysis
- [ ] Cache hit rate monitoring (target: >80%)
- [ ] Slow query detection and optimization

## 📈 Monitoring & Analytics
- [ ] Query performance dashboard
- [ ] Cache effectiveness metrics
- [ ] API usage tracking
- [ ] Error rate monitoring
- [ ] Response time analysis

## 🛡️ Production Readiness
- [ ] Rate limiting implementation
- [ ] Request deduplication
- [ ] Stale-while-revalidate caching
- [ ] Graceful degradation strategies
- [ ] Health check endpoints

Generated on: ${new Date().toISOString()}
    `.trim();

    fs.writeFileSync("HYGRAPH_OPTIMIZATION_CHECKLIST.md", checklist);
    console.log(
      "📝 Optimization checklist saved to: HYGRAPH_OPTIMIZATION_CHECKLIST.md"
    );
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new HygraphAnalyzer();
  analyzer.analyzeServiceFiles();
}

module.exports = HygraphAnalyzer;
