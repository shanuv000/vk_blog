#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * This script analyzes all images used in the application and provides
 * optimization recommendations for Hygraph image transformations.
 *
 * Run with: node scripts/optimize-images.js
 */

const fs = require("fs");
const path = require("path");

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           📸 Image Optimization Analyzer                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}\n`);

// Find all component files
const componentsDir = path.join(__dirname, "../components");
const pagesDir = path.join(__dirname, "../pages");

// Patterns to find image usage
const imagePatterns = {
  nextImage: /<Image[^>]*>/g,
  quality: /quality=\{?(\d+)\}?/g,
  priority: /priority=\{?(true|false)\}?/g,
  sizes: /sizes=["']([^"']*)["']/g,
  hygraphUrl: /featuredImage|photo\.url/g,
};

// Statistics
const stats = {
  totalImages: 0,
  withQuality: 0,
  withPriority: 0,
  withSizes: 0,
  needsOptimization: 0,
  qualityDistribution: {
    "90-100": 0,
    "75-89": 0,
    "60-74": 0,
    "below-60": 0,
  },
};

// Issues found
const issues = [];

/**
 * Analyze a file for image usage
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.relative(path.join(__dirname, ".."), filePath);

  // Find all Image components
  const images = content.match(imagePatterns.nextImage) || [];

  images.forEach((imageTag, index) => {
    stats.totalImages++;

    // Check quality
    const qualityMatch = imageTag.match(imagePatterns.quality);
    if (qualityMatch) {
      stats.withQuality++;
      const quality = parseInt(qualityMatch[1]);

      if (quality >= 90) {
        stats.qualityDistribution["90-100"]++;
        issues.push({
          file: fileName,
          type: "HIGH_QUALITY",
          message: `Image #${
            index + 1
          } has quality=${quality} (too high, use 65-75)`,
          severity: "warning",
        });
      } else if (quality >= 75) {
        stats.qualityDistribution["75-89"]++;
      } else if (quality >= 60) {
        stats.qualityDistribution["60-74"]++;
      } else {
        stats.qualityDistribution["below-60"]++;
      }
    } else {
      issues.push({
        file: fileName,
        type: "NO_QUALITY",
        message: `Image #${index + 1} missing quality attribute`,
        severity: "info",
      });
    }

    // Check priority
    const priorityMatch = imageTag.match(imagePatterns.priority);
    if (priorityMatch) {
      stats.withPriority++;
      if (
        priorityMatch[1] === "true" &&
        !fileName.includes("Hero") &&
        !fileName.includes("PostDetail")
      ) {
        issues.push({
          file: fileName,
          type: "UNNECESSARY_PRIORITY",
          message: `Image #${
            index + 1
          } has priority=true (should only be on hero/detail images)`,
          severity: "warning",
        });
      }
    }

    // Check sizes
    const sizesMatch = imageTag.match(imagePatterns.sizes);
    if (sizesMatch) {
      stats.withSizes++;
    } else {
      issues.push({
        file: fileName,
        type: "NO_SIZES",
        message: `Image #${index + 1} missing sizes attribute`,
        severity: "warning",
      });
      stats.needsOptimization++;
    }
  });
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      scanDirectory(filePath);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      analyzeFile(filePath);
    }
  });
}

// Run analysis
console.log(`${colors.blue}📊 Analyzing components...${colors.reset}\n`);
scanDirectory(componentsDir);

console.log(`${colors.blue}📊 Analyzing pages...${colors.reset}\n`);
scanDirectory(pagesDir);

// Print statistics
console.log(
  `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
);
console.log(`${colors.green}📈 Statistics:${colors.reset}\n`);
console.log(`   Total Images Found: ${stats.totalImages}`);
console.log(
  `   With Quality Set: ${stats.withQuality} (${Math.round(
    (stats.withQuality / stats.totalImages) * 100
  )}%)`
);
console.log(
  `   With Priority Set: ${stats.withPriority} (${Math.round(
    (stats.withPriority / stats.totalImages) * 100
  )}%)`
);
console.log(
  `   With Sizes Set: ${stats.withSizes} (${Math.round(
    (stats.withSizes / stats.totalImages) * 100
  )}%)`
);
console.log(`   Need Optimization: ${stats.needsOptimization}\n`);

console.log(`${colors.yellow}📊 Quality Distribution:${colors.reset}\n`);
console.log(
  `   90-100 (Too High): ${stats.qualityDistribution["90-100"]} ${
    stats.qualityDistribution["90-100"] > 0 ? "⚠️" : "✅"
  }`
);
console.log(`   75-89 (Good): ${stats.qualityDistribution["75-89"]} ✅`);
console.log(`   60-74 (Optimal): ${stats.qualityDistribution["60-74"]} ✅`);
console.log(
  `   Below 60 (Low): ${stats.qualityDistribution["below-60"]} ${
    stats.qualityDistribution["below-60"] > 0 ? "⚠️" : "✅"
  }\n`
);

// Print issues
if (issues.length > 0) {
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
  );
  console.log(
    `${colors.red}⚠️  Issues Found (${issues.length}):${colors.reset}\n`
  );

  // Group by severity
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  if (warnings.length > 0) {
    console.log(
      `${colors.yellow}Warnings (${warnings.length}):${colors.reset}\n`
    );
    warnings.slice(0, 10).forEach((issue) => {
      console.log(`   ${colors.yellow}▸${colors.reset} ${issue.file}`);
      console.log(`     ${issue.message}\n`);
    });
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more warnings\n`);
    }
  }

  if (infos.length > 0) {
    console.log(`${colors.blue}Info (${infos.length}):${colors.reset}\n`);
    infos.slice(0, 5).forEach((issue) => {
      console.log(`   ${colors.blue}ℹ${colors.reset} ${issue.file}`);
      console.log(`     ${issue.message}\n`);
    });
    if (infos.length > 5) {
      console.log(`   ... and ${infos.length - 5} more info items\n`);
    }
  }
}

// Recommendations
console.log(
  `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
);
console.log(`${colors.green}💡 Recommendations:${colors.reset}\n`);

if (stats.qualityDistribution["90-100"] > 0) {
  console.log(
    `   ${colors.yellow}1.${colors.reset} Reduce image quality from 90-100 to 65-75`
  );
  console.log(`      Expected savings: ~60-70% file size reduction\n`);
}

if (stats.totalImages - stats.withSizes > 0) {
  console.log(
    `   ${colors.yellow}2.${colors.reset} Add 'sizes' attribute to ${
      stats.totalImages - stats.withSizes
    } images`
  );
  console.log(`      This improves responsive image loading\n`);
}

if (issues.filter((i) => i.type === "UNNECESSARY_PRIORITY").length > 0) {
  console.log(
    `   ${colors.yellow}3.${colors.reset} Remove priority from non-critical images`
  );
  console.log(`      Only use priority on hero/above-fold images\n`);
}

console.log(`   ${colors.green}4.${colors.reset} Use the new image-config.js:`);
console.log(
  `      import { IMAGE_CONFIGS, getOptimizedImageUrl } from '@/lib/image-config';\n`
);

// Overall score
const score = Math.round(
  (stats.withQuality / stats.totalImages) * 30 +
    (stats.withSizes / stats.totalImages) * 40 +
    ((stats.totalImages - stats.qualityDistribution["90-100"]) /
      stats.totalImages) *
      30
);

console.log(
  `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
);
console.log(
  `${colors.green}🎯 Overall Optimization Score: ${score}/100${colors.reset}\n`
);

if (score >= 80) {
  console.log(
    `   ${colors.green}Excellent! Your images are well optimized. 🎉${colors.reset}\n`
  );
} else if (score >= 60) {
  console.log(
    `   ${colors.yellow}Good, but there's room for improvement. 📈${colors.reset}\n`
  );
} else {
  console.log(
    `   ${colors.red}Needs optimization. Follow recommendations above. ⚠️${colors.reset}\n`
  );
}

console.log(
  `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
);
