#!/bin/bash

# Quick Firebase Contact Form Test
# This tests just the Firebase integration with improved error handling

echo "🧪 Testing Firebase Contact Form Integration..."
echo "=============================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Development server is not running!"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test Firebase proxy with a simple contact form submission
echo "📤 Submitting test contact form..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/firebase-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://firestore.googleapis.com/v1/projects/urtechy-35294/databases/(default)/documents/blog-contacts?key=AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w",
    "method": "POST",
    "body": {
      "fields": {
        "firstName": {"stringValue": "Test"},
        "lastName": {"stringValue": "User"},
        "fullName": {"stringValue": "Test User"},
        "email": {"stringValue": "test@example.com"},
        "phone": {"stringValue": "+1234567890"},
        "subject": {"stringValue": "Test Subject"},
        "message": {"stringValue": "This is a test message to verify Firebase integration is working correctly."},
        "source": {"stringValue": "contact_form"},
        "timestamp": {"timestampValue": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
        "submittedAt": {"timestampValue": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
      }
    }
  }')

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

echo "Response Status Code: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! Firebase integration is working!"
    echo ""
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo ""
    
    # Extract document ID if available
    doc_id=$(echo "$response_body" | jq -r '.name' 2>/dev/null | awk -F'/' '{print $NF}')
    if [ ! -z "$doc_id" ] && [ "$doc_id" != "null" ]; then
        echo "✅ Document created with ID: $doc_id"
        echo ""
        echo "📊 View in Firebase Console:"
        echo "https://console.firebase.google.com/project/urtechy-35294/firestore/data/blog-contacts/$doc_id"
    fi
else
    echo "❌ FAILED! Status code: $http_code"
    echo ""
    echo "Error Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "  1. Check that Firebase API key is correct in .env.local"
    echo "  2. Verify Firebase project ID is 'urtechy-35294'"
    echo "  3. Check server logs for detailed error messages"
    echo "  4. Ensure Firestore is enabled in Firebase Console"
fi

echo ""
echo "🔍 Check your terminal running 'npm run dev' for detailed logs"
