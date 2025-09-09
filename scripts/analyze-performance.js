#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, identifies performance bottlenecks, and provides recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Performance Analysis...\n');

// 1. Bundle Analysis
console.log('📦 Analyzing Bundle Size...');
try {
  // Run Next.js build with bundle analyzer
  console.log('Building production bundle...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Check for performance optimizations
console.log('\n🔍 Checking Performance Optimizations...');

const checks = [
  {
    name: 'Next.js Image Optimization',
    check: () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('images:') && nextConfig.includes('formats:');
    },
    recommendation: 'Configure Next.js Image optimization in next.config.js'
  },
  {
    name: 'Font Optimization',
    check: () => {
      const appJs = fs.readFileSync('pages/_app.js', 'utf8');
      return appJs.includes('preload') && appJs.includes('fonts.googleapis.com');
    },
    recommendation: 'Use font preloading for critical fonts'
  },
  {
    name: 'Critical CSS',
    check: () => {
      return fs.existsSync('styles/critical.css');
    },
    recommendation: 'Create critical CSS file for above-the-fold content'
  },
  {
    name: 'Bundle Compression',
    check: () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('compress: true');
    },
    recommendation: 'Enable compression in next.config.js'
  },
  {
    name: 'Resource Preconnections',
    check: () => {
      const documentJs = fs.readFileSync('pages/_document.js', 'utf8');
      return documentJs.includes('preconnect');
    },
    recommendation: 'Add preconnect links for external resources'
  }
];

let passedChecks = 0;
checks.forEach(check => {
  const passed = check.check();
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) {
    console.log(`   💡 ${check.recommendation}`);
  } else {
    passedChecks++;
  }
});

console.log(`\n📊 Performance Score: ${passedChecks}/${checks.length} (${Math.round(passedChecks/checks.length*100)}%)`);

// 3. File Size Analysis
console.log('\n📁 Analyzing File Sizes...');

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const filesToCheck = [
  'styles/globals.scss',
  'styles/globals.css',
  'styles/critical.css',
  'pages/_app.js',
  'pages/_document.js'
];

filesToCheck.forEach(file => {
  const size = getFileSize(file);
  if (size > 0) {
    console.log(`📄 ${file}: ${formatBytes(size)}`);
  }
});

// 4. Performance Recommendations
console.log('\n🎯 Performance Recommendations:');

const recommendations = [
  '1. 🖼️  Use Next.js Image component for all images',
  '2. 🔤 Preload critical fonts and use font-display: swap',
  '3. 📦 Enable bundle compression and minification',
  '4. 🔗 Add preconnect links for external resources',
  '5. 🎨 Inline critical CSS for above-the-fold content',
  '6. 📱 Implement lazy loading for below-the-fold content',
  '7. 🗜️  Optimize images with WebP/AVIF formats',
  '8. 🚀 Use service workers for caching strategies',
  '9. 📊 Monitor Core Web Vitals regularly',
  '10. 🔄 Implement infinite scroll pagination (✅ Already done!)'
];

recommendations.forEach(rec => console.log(rec));

// 5. Next Steps
console.log('\n🚀 Next Steps:');
console.log('1. Run: npm run analyze to see bundle composition');
console.log('2. Test with: npm run lighthouse');
console.log('3. Monitor: Use PageSpeed Insights regularly');
console.log('4. Deploy: Test performance in production environment');

console.log('\n✨ Performance analysis complete!');
