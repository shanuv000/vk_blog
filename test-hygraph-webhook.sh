#!/bin/bash

# Quick test script for Hygraph Telegram Webhook
# Tests both query parameter and header authentication methods
# Uses: HYGRAPH_TELEGRAM_WEBHOOK_SECRET environment variable

echo "🧪 Testing Hygraph to Telegram Webhook"
echo "======================================="
echo ""

# Configuration
WEBHOOK_URL="http://localhost:3000/api/hygraph-telegram-webhook"
SECRET="67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398"
echo "ℹ️  Using HYGRAPH_TELEGRAM_WEBHOOK_SECRET for authentication"
echo ""

# Test 1: Query Parameter Authentication
echo "Test 1: 🔑 Query Parameter Authentication"
echo "----------------------------------------"
curl -s -X POST "${WEBHOOK_URL}?secret=${SECRET}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "__typename": "Post",
      "id": "test-query-auth",
      "title": "Test: Query Parameter Authentication",
      "slug": "test-query-auth",
      "excerpt": "Testing webhook with query parameter",
      "featuredpost": false,
      "stage": "PUBLISHED",
      "tags": []
    }
  }' | jq '.'

echo ""
echo "✅ Test 1 complete - Check Telegram for notification"
echo ""
sleep 2

# Test 2: Header Authentication
echo "Test 2: 🔑 Header Authentication"
echo "--------------------------------"
curl -s -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "x-hygraph-signature: ${SECRET}" \
  -d '{
    "operation": "unpublish",
    "data": {
      "__typename": "Post",
      "id": "test-header-auth",
      "title": "Test: Header Authentication",
      "slug": "test-header-auth",
      "excerpt": "Testing webhook with header signature",
      "featuredpost": true,
      "stage": "PUBLISHED",
      "author": {
        "__typename": "Author",
        "id": "test-author-123"
      },
      "tags": [
        {
          "__typename": "Tag",
          "id": "test-tag-456"
        }
      ]
    }
  }' | jq '.'

echo ""
echo "✅ Test 2 complete - Check Telegram for notification"
echo ""
sleep 2

# Test 3: Category Creation
echo "Test 3: 📁 Category Creation"
echo "----------------------------"
curl -s -X POST "${WEBHOOK_URL}?secret=${SECRET}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create",
    "data": {
      "__typename": "Category",
      "id": "test-category-789",
      "name": "Test Category",
      "slug": "test-category"
    }
  }' | jq '.'

echo ""
echo "✅ Test 3 complete - Check Telegram for notification"
echo ""
sleep 2

# Test 4: Invalid Secret (Should Fail)
echo "Test 4: ❌ Invalid Secret (Expected to Fail)"
echo "-------------------------------------------"
curl -s -X POST "${WEBHOOK_URL}?secret=wrong-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "__typename": "Post",
      "id": "should-fail",
      "title": "This Should Not Work"
    }
  }' | jq '.'

echo ""
echo "✅ Test 4 complete - Should show error (not reach Telegram)"
echo ""

# Summary
echo ""
echo "======================================="
echo "📊 Test Summary"
echo "======================================="
echo "✅ 3 successful tests should send Telegram notifications"
echo "❌ 1 failed test should show 401 error"
echo ""
echo "📱 Check your Telegram (Chat ID: 866021016)"
echo "   You should have received 3 notifications"
echo ""
echo "🎯 If all tests passed:"
echo "   1. Deploy your app to production"
echo "   2. Add environment variables to hosting"
echo "   3. Configure webhook in Hygraph dashboard"
echo "   4. Use: HYGRAPH_WEBHOOK_SETUP.md for instructions"
echo ""
