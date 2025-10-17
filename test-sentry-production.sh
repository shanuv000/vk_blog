#!/bin/bash

# Sentry Production Test Script
# This script temporarily sets production environment to test Sentry

echo "🧪 Sentry Production Mode Test"
echo "================================"
echo ""
echo "This will:"
echo "1. Set NEXT_PUBLIC_SENTRY_ENVIRONMENT=production"
echo "2. Build the project"
echo "3. Start production server"
echo "4. Test page will send real events to Sentry"
echo ""
echo "⚠️  WARNING: This will consume your Sentry quota!"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Test cancelled"
    exit 1
fi

echo ""
echo "📦 Building project in production mode..."
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting production server..."
echo "📍 Visit: http://localhost:3000/sentry-example-page"
echo ""
echo "🧪 How to test:"
echo "1. Open http://localhost:3000/sentry-example-page"
echo "2. Click any test button"
echo "3. Wait 1-2 minutes"
echo "4. Check Sentry dashboard: https://sentry.io/organizations/urtechy-r0/issues/"
echo ""
echo "⏱️  Starting server in 3 seconds..."
sleep 3

NEXT_PUBLIC_SENTRY_ENVIRONMENT=production npm start
