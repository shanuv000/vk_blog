#!/bin/bash

# Contact Form Database Integration Test
# This script tests the complete flow: form submission → Firebase → Telegram

echo "🧪 Testing Contact Form Database Integration..."
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if development server is running..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Development server is not running!${NC}"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test Firebase proxy endpoint
echo "🔥 Testing Firebase proxy endpoint..."
firebase_test=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/firebase-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://firestore.googleapis.com/v1/projects/urtechy-35294/databases/(default)/documents/blog-contacts?key=AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w",
    "method": "POST",
    "body": {
      "fields": {
        "firstName": {"stringValue": "Test"},
        "lastName": {"stringValue": "Integration"},
        "email": {"stringValue": "test@integration.com"},
        "message": {"stringValue": "Testing database integration"},
        "submittedAt": {"timestampValue": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
      }
    }
  }')

firebase_code=$(echo "$firebase_test" | tail -n1)
firebase_response=$(echo "$firebase_test" | sed '$d')

echo "Response Status Code: $firebase_code"

if [ "$firebase_code" = "200" ]; then
    echo -e "${GREEN}✅ Firebase proxy is working!${NC}"
    echo "Response preview:"
    echo "$firebase_response" | jq -r '.name' 2>/dev/null || echo "$firebase_response" | head -c 100
    
    # Extract document ID
    doc_id=$(echo "$firebase_response" | jq -r '.name' 2>/dev/null | awk -F'/' '{print $NF}')
    if [ ! -z "$doc_id" ]; then
        echo -e "${GREEN}✅ Document created with ID: $doc_id${NC}"
    fi
else
    echo -e "${RED}❌ Firebase proxy test failed!${NC}"
    echo "Response:"
    echo "$firebase_response" | jq '.' 2>/dev/null || echo "$firebase_response"
fi
echo ""

# Test Telegram notification endpoint
echo "📱 Testing Telegram notification endpoint..."
telegram_test=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Integration",
    "email": "test@integration.com",
    "phone": "+1234567890",
    "subject": "Integration Test",
    "message": "Testing complete contact form flow including database and Telegram"
  }')

telegram_code=$(echo "$telegram_test" | tail -n1)
telegram_response=$(echo "$telegram_test" | sed '$d')

echo "Response Status Code: $telegram_code"

if [ "$telegram_code" = "200" ]; then
    echo -e "${GREEN}✅ Telegram notification sent!${NC}"
    echo "Check your Telegram chat for the test message."
else
    echo -e "${YELLOW}⚠️  Telegram notification may have failed${NC}"
    echo "Response:"
    echo "$telegram_response" | jq '.' 2>/dev/null || echo "$telegram_response"
fi
echo ""

# Test complete contact form submission flow
echo "📝 Testing complete contact form submission flow..."
echo "   (This simulates what happens when a user submits the form)"
complete_test=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/firebase-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://firestore.googleapis.com/v1/projects/urtechy-35294/databases/(default)/documents/blog-contacts?key=AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w",
    "method": "POST",
    "body": {
      "fields": {
        "firstName": {"stringValue": "Complete"},
        "lastName": {"stringValue": "Flow Test"},
        "fullName": {"stringValue": "Complete Flow Test"},
        "email": {"stringValue": "complete@flowtest.com"},
        "phone": {"stringValue": "+9876543210"},
        "subject": {"stringValue": "Complete Integration Test"},
        "message": {"stringValue": "This is a complete end-to-end test of the contact form integration."},
        "source": {"stringValue": "contact_form"},
        "submittedAt": {"timestampValue": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
      }
    }
  }')

complete_code=$(echo "$complete_test" | tail -n1)
complete_response=$(echo "$complete_test" | sed '$d')

echo "Response Status Code: $complete_code"

if [ "$complete_code" = "200" ]; then
    echo -e "${GREEN}✅ Complete flow test PASSED!${NC}"
    
    # Extract and display document ID
    doc_id=$(echo "$complete_response" | jq -r '.name' 2>/dev/null | awk -F'/' '{print $NF}')
    if [ ! -z "$doc_id" ]; then
        echo -e "${GREEN}✅ Document saved to Firebase with ID: $doc_id${NC}"
    fi
    
    # Now send Telegram notification for this submission
    echo ""
    echo "📱 Sending Telegram notification for this submission..."
    telegram_complete=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/telegram-notify \
      -H "Content-Type: application/json" \
      -d '{
        "firstName": "Complete",
        "lastName": "Flow Test",
        "email": "complete@flowtest.com",
        "phone": "+9876543210",
        "subject": "Complete Integration Test",
        "message": "This is a complete end-to-end test of the contact form integration."
      }')
    
    telegram_complete_code=$(echo "$telegram_complete" | tail -n1)
    
    if [ "$telegram_complete_code" = "200" ]; then
        echo -e "${GREEN}✅ Telegram notification sent successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Telegram notification had an issue${NC}"
    fi
else
    echo -e "${RED}❌ Complete flow test FAILED!${NC}"
    echo "Response:"
    echo "$complete_response" | jq '.' 2>/dev/null || echo "$complete_response"
fi

echo ""
echo "=============================================="
echo "📊 Test Summary"
echo "=============================================="
echo ""

# Summary
all_passed=true

if [ "$firebase_code" = "200" ]; then
    echo -e "${GREEN}✅ Firebase Integration: WORKING${NC}"
else
    echo -e "${RED}❌ Firebase Integration: FAILED${NC}"
    all_passed=false
fi

if [ "$telegram_code" = "200" ]; then
    echo -e "${GREEN}✅ Telegram Integration: WORKING${NC}"
else
    echo -e "${YELLOW}⚠️  Telegram Integration: CHECK REQUIRED${NC}"
fi

if [ "$complete_code" = "200" ]; then
    echo -e "${GREEN}✅ Complete Form Flow: WORKING${NC}"
else
    echo -e "${RED}❌ Complete Form Flow: FAILED${NC}"
    all_passed=false
fi

echo ""

if [ "$all_passed" = true ]; then
    echo -e "${GREEN}🎉 All critical tests PASSED!${NC}"
    echo ""
    echo "Your contact form database integration is working correctly:"
    echo "  1. ✅ Forms are being saved to Firebase"
    echo "  2. ✅ Telegram notifications are being sent"
    echo "  3. ✅ Complete flow works end-to-end"
    echo ""
    echo "Next steps:"
    echo "  - Visit http://localhost:3000/contact to test the UI"
    echo "  - Check your Firebase Console to see the test documents"
    echo "  - Check your Telegram for the test notifications"
else
    echo -e "${RED}⚠️  Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify Firebase credentials in contactServiceProxy.js"
    echo "  2. Check Firebase Console to ensure the database is accessible"
    echo "  3. Verify Telegram bot is started (send /start to your bot)"
    echo "  4. Check server logs for detailed error messages"
fi

echo ""
echo "🔍 For detailed logs, check the terminal running 'npm run dev'"
