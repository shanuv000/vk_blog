#!/bin/bash

# TinyURL Webhook Test Script
# This script helps test your Hygraph webhook integration

echo "🔗 Testing TinyURL Webhook Integration"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if .env.local exists and has required variables
echo "Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found"
    exit 1
fi

# Check for required environment variables
required_vars=(
    "TINYURL_API_KEY"
    "HYGRAPH_WEBHOOK_SECRET"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env.local; then
        print_status "$var is configured"
    else
        print_error "$var is missing from .env.local"
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Missing required environment variables. Please add them to .env.local"
    exit 1
fi

# Get the webhook secret for testing
WEBHOOK_SECRET=$(grep "^HYGRAPH_WEBHOOK_SECRET=" .env.local | cut -d'=' -f2)

# Determine the base URL
if [ "$1" = "production" ]; then
    BASE_URL="https://blog.urtechy.com"
    print_info "Testing production webhook"
elif [ "$1" = "local" ]; then
    BASE_URL="http://localhost:3000"
    print_info "Testing local development webhook"
else
    echo "Usage: $0 [local|production]"
    echo "  local      - Test webhook on localhost:3000"
    echo "  production - Test webhook on blog.urtechy.com"
    echo ""
    echo "Example: $0 local"
    exit 1
fi

WEBHOOK_URL="$BASE_URL/api/tinyurl-webhook?secret=$WEBHOOK_SECRET"

echo ""
echo "Testing webhook endpoint: $WEBHOOK_URL"
echo ""

# Test 1: Basic endpoint connectivity
print_info "Test 1: Basic endpoint connectivity"
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$WEBHOOK_URL")

if [ "$response" -eq "405" ]; then
    print_status "Endpoint is accessible (returns 405 Method Not Allowed as expected)"
elif [ "$response" -eq "200" ] || [ "$response" -eq "404" ]; then
    print_warning "Endpoint responded with $response (check if endpoint exists)"
else
    print_error "Endpoint returned unexpected status: $response"
fi

# Test 2: POST with invalid secret
print_info "Test 2: Security test (invalid secret)"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$BASE_URL/api/tinyurl-webhook?secret=invalid-secret" \
    -H "Content-Type: application/json" \
    -d '{
        "operation": "publish",
        "data": {
            "__typename": "Post",
            "slug": "test-post",
            "title": "Test Post"
        }
    }')

if [ "$response" -eq "401" ]; then
    print_status "Security works correctly (rejects invalid secret)"
else
    print_warning "Security test returned $response (expected 401)"
fi

# Test 3: Valid webhook payload
print_info "Test 3: Valid webhook simulation"
temp_file=$(mktemp)

response=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{
        "operation": "publish",
        "data": {
            "id": "test-id-12345",
            "slug": "webhook-test-post",
            "title": "Webhook Test Post",
            "__typename": "Post",
            "stage": "PUBLISHED"
        }
    }' \
    -o "$temp_file")

echo "Response Status: $response"
echo "Response Body:"
cat "$temp_file"
echo ""

if [ "$response" -eq "200" ]; then
    print_status "Webhook processed successfully"
    
    # Check if the response indicates success
    if grep -q '"success":true' "$temp_file"; then
        print_status "TinyURL creation reported as successful"
    elif grep -q '"skipped":true' "$temp_file"; then
        print_warning "Webhook was skipped (check operation/model filters)"
    else
        print_warning "Webhook processed but check response for details"
    fi
else
    print_error "Webhook failed with status $response"
fi

# Clean up temp file
rm "$temp_file"

# Test 4: Non-Post model (should be skipped)
print_info "Test 4: Non-Post model test (should be skipped)"
temp_file2=$(mktemp)

response=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{
        "operation": "publish",
        "data": {
            "id": "category-test",
            "slug": "test-category",
            "name": "Test Category",
            "__typename": "Category"
        }
    }' \
    -o "$temp_file2")

if grep -q '"skipped":true' "$temp_file2"; then
    print_status "Non-Post model correctly skipped"
elif [ "$response" -eq "200" ]; then
    print_warning "Non-Post model was processed (check model filtering)"
else
    print_error "Unexpected response for non-Post model test"
fi

rm "$temp_file2"

# Summary
echo ""
echo "======================================"
print_info "Test Summary"
echo "======================================"

if [ "$1" = "local" ]; then
    echo "Local testing completed."
    echo ""
    echo "Next steps:"
    echo "1. If tests passed, your webhook endpoint is working locally"
    echo "2. Deploy your changes to production"
    echo "3. Run: $0 production"
    echo "4. Configure the webhook in Hygraph dashboard"
else
    echo "Production testing completed."
    echo ""
    echo "Next steps:"
    echo "1. If tests passed, configure webhook in Hygraph:"
    echo "   URL: $WEBHOOK_URL"
    echo "2. Test by publishing a post in Hygraph"
    echo "3. Check TinyURL dashboard for new shortened URLs"
fi

echo ""
echo "Webhook Configuration for Hygraph:"
echo "URL: $WEBHOOK_URL"
echo "Method: POST"
echo "Content-Type: application/json"
echo "Body: {\"operation\": \"{{operation}}\", \"data\": {\"id\": \"{{id}}\", \"slug\": \"{{slug}}\", \"title\": \"{{title}}\", \"__typename\": \"{{__typename}}\"}}"

echo ""
print_info "For more details, see: HYGRAPH_TINYURL_WEBHOOK_SETUP.md"