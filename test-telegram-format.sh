#!/bin/bash

# Test Telegram Message Format
# This script sends a test message to show the new URTECHY BLOGS header format

echo "📱 Testing New Telegram Message Format with URTECHY BLOGS Header..."
echo "=================================================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Development server is not running!"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Send test notification with new format
echo "📤 Sending test notification with new header format..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "subject": "Website Inquiry",
    "message": "Hi! I am interested in learning more about your blog content and would like to discuss potential collaboration opportunities. Looking forward to hearing from you!"
  }')

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

echo "Response Status Code: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! Test message sent to Telegram!"
    echo ""
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Check your Telegram chat to see the new format!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Expected message format:"
    echo ""
    echo "╔═══════════════════════════╗"
    echo "║   🚀 URTECHY BLOGS 🚀   ║"
    echo "╚═══════════════════════════╝"
    echo ""
    echo "🔔 New Contact Form Submission"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "👤 Name: John Doe"
    echo "📧 Email: john.doe@example.com"
    echo "📱 Phone: +1 (555) 123-4567"
    echo "📋 Subject: Website Inquiry"
    echo ""
    echo "💬 Message:"
    echo "┌─────────────────────────┐"
    echo "Hi! I am interested in..."
    echo "└─────────────────────────┘"
    echo ""
    echo "⏰ Received: [timestamp]"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ blog.urtechy.com ✨"
    echo ""
else
    echo "❌ FAILED! Status code: $http_code"
    echo ""
    echo "Error Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "  1. Check Telegram bot token and chat ID in .env.local"
    echo "  2. Verify bot is started in Telegram (send /start)"
    echo "  3. Check server logs for detailed error messages"
fi

echo ""
echo "🔍 For detailed logs, check the terminal running 'npm run dev'"
