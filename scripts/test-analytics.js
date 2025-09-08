#!/usr/bin/env node

/**
 * Analytics Testing Script
 * This script tests all analytics implementations in the application
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_GOOGLE_ANALYTICS',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV'
  ];
  
  let allRequired = true;
  
  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log('✅ .env file found', 'green');
  } else {
    log('❌ .env file not found', 'red');
    return false;
  }
  
  // Parse environment variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (envVars[varName] && envVars[varName] !== 'your-ga-tracking-id' && envVars[varName] !== 'your-firebase-api-key') {
      log(`✅ ${varName}: ${envVars[varName]}`, 'green');
    } else {
      log(`❌ ${varName}: Missing or placeholder value`, 'red');
      allRequired = false;
    }
  });
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (envVars[varName]) {
      log(`ℹ️  ${varName}: ${envVars[varName]}`, 'yellow');
    } else {
      log(`ℹ️  ${varName}: Not set (using default)`, 'yellow');
    }
  });
  
  return allRequired;
}

function checkAnalyticsFiles() {
  log('\n📁 Checking Analytics Files...', 'blue');
  
  const requiredFiles = [
    'lib/analytics.js',
    'lib/firebase-analytics.js',
    'components/AnalyticsProvider.js',
    'hooks/useAnalytics.js',
    'hooks/usePostAnalytics.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${filePath}`, 'green');
    } else {
      log(`❌ ${filePath} - Missing`, 'red');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkAnalyticsIntegration() {
  log('\n🔗 Checking Analytics Integration...', 'blue');
  
  const appJsPath = path.join(process.cwd(), 'pages/_app.js');
  
  if (!fs.existsSync(appJsPath)) {
    log('❌ pages/_app.js not found', 'red');
    return false;
  }
  
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  const checks = [
    {
      name: 'AnalyticsProvider import',
      pattern: /import.*AnalyticsProvider.*from.*AnalyticsProvider/,
      required: true
    },
    {
      name: 'AnalyticsProvider usage',
      pattern: /<AnalyticsProvider/,
      required: true
    },
    {
      name: 'Google Analytics ID configuration',
      pattern: /NEXT_PUBLIC_GOOGLE_ANALYTICS/,
      required: true
    },
    {
      name: 'Microsoft Clarity script',
      pattern: /clarity\.ms/,
      required: false
    },
    {
      name: 'Google Analytics preconnect',
      pattern: /googletagmanager\.com/,
      required: true
    }
  ];
  
  let integrationScore = 0;
  const totalRequired = checks.filter(check => check.required).length;
  
  checks.forEach(check => {
    if (check.pattern.test(appJsContent)) {
      log(`✅ ${check.name}`, 'green');
      if (check.required) integrationScore++;
    } else {
      const status = check.required ? '❌' : '⚠️';
      const color = check.required ? 'red' : 'yellow';
      log(`${status} ${check.name} - ${check.required ? 'Missing (Required)' : 'Missing (Optional)'}`, color);
    }
  });
  
  return integrationScore === totalRequired;
}

function checkPackageDependencies() {
  log('\n📦 Checking Package Dependencies...', 'blue');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    'firebase',
    'next'
  ];
  
  const optionalPackages = [
    'web-vitals'
  ];
  
  let allRequired = true;
  
  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      log(`✅ ${pkg}: ${dependencies[pkg]}`, 'green');
    } else {
      log(`❌ ${pkg}: Missing`, 'red');
      allRequired = false;
    }
  });
  
  optionalPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      log(`✅ ${pkg}: ${dependencies[pkg]}`, 'green');
    } else {
      log(`⚠️  ${pkg}: Not installed (optional)`, 'yellow');
    }
  });
  
  return allRequired;
}

function generateReport(envCheck, filesCheck, integrationCheck, depsCheck) {
  log('\n📊 Analytics Health Report', 'bold');
  log('================================', 'blue');
  
  const checks = [
    { name: 'Environment Variables', status: envCheck },
    { name: 'Analytics Files', status: filesCheck },
    { name: 'Integration', status: integrationCheck },
    { name: 'Dependencies', status: depsCheck }
  ];
  
  let passedChecks = 0;
  
  checks.forEach(check => {
    const status = check.status ? '✅ PASS' : '❌ FAIL';
    const color = check.status ? 'green' : 'red';
    log(`${check.name}: ${status}`, color);
    if (check.status) passedChecks++;
  });
  
  log('\n📈 Overall Status:', 'blue');
  const overallStatus = passedChecks === checks.length;
  const statusText = overallStatus ? '🎉 ALL ANALYTICS WORKING' : `⚠️  ${passedChecks}/${checks.length} CHECKS PASSED`;
  const statusColor = overallStatus ? 'green' : 'yellow';
  
  log(statusText, statusColor);
  
  if (!overallStatus) {
    log('\n🔧 Recommendations:', 'yellow');
    if (!envCheck) log('• Check and update environment variables in .env file');
    if (!filesCheck) log('• Ensure all analytics files are present');
    if (!integrationCheck) log('• Verify AnalyticsProvider is properly integrated in _app.js');
    if (!depsCheck) log('• Install missing package dependencies');
  }
  
  return overallStatus;
}

// Main execution
async function main() {
  log('🚀 Starting Analytics Health Check...', 'bold');
  
  const envCheck = checkEnvironmentVariables();
  const filesCheck = checkAnalyticsFiles();
  const integrationCheck = checkAnalyticsIntegration();
  const depsCheck = checkPackageDependencies();
  
  const overallHealth = generateReport(envCheck, filesCheck, integrationCheck, depsCheck);
  
  process.exit(overallHealth ? 0 : 1);
}

main().catch(console.error);
