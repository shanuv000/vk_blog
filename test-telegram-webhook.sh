#!/bin/bash

# Test script for Hygraph to Telegram Webhook Integration
# This script tests various scenarios to ensure the webhook works correctly

echo "🧪 Testing Hygraph to Telegram Webhook Integration"
echo "=================================================="
echo ""

# Configuration
WEBHOOK_SECRET="67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398"
BASE_URL="${1:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/hygraph-telegram-webhook?secret=${WEBHOOK_SECRET}"

echo "📍 Testing endpoint: ${ENDPOINT}"
echo ""

# Test 1: Post Published
echo "Test 1: 📰 Post Published"
echo "-------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "id": "test-post-001",
      "slug": "test-webhook-integration",
      "title": "Testing Hygraph Webhook Integration",
      "__typename": "Post"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "✅ Check your Telegram for notification"
echo ""
sleep 2

# Test 2: Category Created
echo "Test 2: 📁 Category Created"
echo "-------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create",
    "data": {
      "id": "test-cat-001",
      "slug": "test-category",
      "name": "Test Category",
      "__typename": "Category"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "✅ Check your Telegram for notification"
echo ""
sleep 2

# Test 3: Author Updated
echo "Test 3: 👤 Author Updated"
echo "-------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "update",
    "data": {
      "id": "test-author-001",
      "name": "John Doe",
      "__typename": "Author"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "✅ Check your Telegram for notification"
echo ""
sleep 2

# Test 4: Comment Created
echo "Test 4: 💬 Comment Created"
echo "-------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create",
    "data": {
      "id": "test-comment-001",
      "__typename": "Comment"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "✅ Check your Telegram for notification"
echo ""
sleep 2

# Test 5: Post Unpublished
echo "Test 5: 📦 Post Unpublished"
echo "-------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "unpublish",
    "data": {
      "id": "test-post-002",
      "slug": "unpublished-post",
      "title": "Post Being Unpublished",
      "__typename": "Post"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "✅ Check your Telegram for notification"
echo ""
sleep 2

# Test 6: Invalid Secret (Should Fail)
echo "Test 6: 🔒 Invalid Secret (Expected to fail)"
echo "-------------------------------------------"
curl -X POST "${BASE_URL}/api/hygraph-telegram-webhook?secret=invalid-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "id": "test-001",
      "__typename": "Post"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "❌ This should have returned 401 Unauthorized"
echo ""

# Test 7: Invalid Method (Should Fail)
echo "Test 7: 🚫 GET Method (Expected to fail)"
echo "--------------------------------------"
curl -X GET "${ENDPOINT}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "❌ This should have returned 405 Method Not Allowed"
echo ""

# Summary
echo ""
echo "=================================================="
echo "🎉 Test Suite Complete!"
echo "=================================================="
echo ""
echo "Summary:"
echo "--------"
echo "✅ 5 successful webhook calls should have been made"
echo "💬 Check your Telegram for 5 notifications"
echo "❌ 2 expected failures (invalid secret, wrong method)"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Verify you received 5 Telegram messages"
echo "2. Check that each message has the correct format"
echo "3. Verify emojis and content types are correct"
echo "4. If all tests passed, configure the webhook in Hygraph"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md"
echo ""
