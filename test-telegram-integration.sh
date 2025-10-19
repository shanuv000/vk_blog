#!/bin/bash

# Telegram Bot Integration Test Script
# This script tests the Telegram notification functionality

echo "🧪 Testing Telegram Bot Integration..."
echo "======================================="
echo ""

# Check if server is running
echo "📡 Checking if development server is running..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Development server is not running!"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test the Telegram notification API
echo "📤 Sending test notification to Telegram..."
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "subject": "Test Subject",
    "message": "This is a test message from the Telegram integration test script."
  }')

# Extract status code
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

echo ""
echo "Response Status Code: $http_code"
echo "Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo ""

# Check result
if [ "$http_code" = "200" ]; then
    echo "✅ Test PASSED! Check your Telegram chat for the notification."
    echo ""
    echo "Expected message format:"
    echo "========================"
    echo "🔔 New Contact Form Submission"
    echo ""
    echo "👤 Name: Test User"
    echo "📧 Email: test@example.com"
    echo "📱 Phone: +1234567890"
    echo "📋 Subject: Test Subject"
    echo ""
    echo "💬 Message:"
    echo "This is a test message from the Telegram integration test script."
    echo ""
    echo "⏰ Received: [timestamp]"
    echo "========================"
else
    echo "❌ Test FAILED!"
    echo "   Please check the error message above and verify:"
    echo "   1. Environment variables are set correctly in .env.local"
    echo "   2. Telegram bot is started (send /start to your bot)"
    echo "   3. Bot token and chat ID are correct"
fi

echo ""
echo "🔍 For more details, check the terminal where your dev server is running."
