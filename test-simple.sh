#!/bin/bash

# Simple webhook test - just one request

echo "🧪 Testing Hygraph Telegram Webhook"
echo "===================================="
echo ""

WEBHOOK_URL="http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398"

echo "📍 Sending test POST request..."
echo ""

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "id": "test-001",
      "slug": "test-post",
      "title": "Test Webhook Integration",
      "__typename": "Post"
    }
  }' \
  -i

echo ""
echo ""
echo "✅ Request sent! Check your Telegram for notification"
echo "📱 Chat ID: 866021016"
