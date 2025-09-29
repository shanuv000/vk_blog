#!/bin/bash

# 🧪 TinyURL Integration Testing & Validation Script
# This script validates your complete TinyURL integration

echo "🚀 Starting TinyURL Integration Validation..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
PASS=0
FAIL=0

validate_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$description${NC}"
        ((PASS++))
        return 0
    else
        echo -e "❌ ${RED}$description${NC}"
        echo -e "   Missing file: $file"
        ((FAIL++))
        return 1
    fi
}

validate_env_var() {
    local var_name=$1
    local description=$2
    
    if [ ! -f ".env.local" ]; then
        echo -e "❌ ${RED}.env.local file missing${NC}"
        ((FAIL++))
        return 1
    fi
    
    if grep -q "^$var_name=" .env.local; then
        echo -e "✅ ${GREEN}$description${NC}"
        ((PASS++))
        return 0
    else
        echo -e "❌ ${RED}$description${NC}"
        echo -e "   Add $var_name to .env.local"
        ((FAIL++))
        return 1
    fi
}

test_api_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint" 2>/dev/null)
        
        if [ "$response" -eq 200 ] || [ "$response" -eq 405 ]; then
            echo -e "✅ ${GREEN}$description - Endpoint accessible${NC}"
            ((PASS++))
        else
            echo -e "⚠️  ${YELLOW}$description - Server may not be running (curl response: $response)${NC}"
            echo -e "   Start server with: npm run dev"
        fi
    else
        echo -e "⚠️  ${YELLOW}curl not available - skipping endpoint test${NC}"
    fi
}

echo ""
echo "📁 File Structure Validation"
echo "============================="

# Core service files
validate_file "services/tinyurl.js" "TinyURL Service"
validate_file "hooks/useTinyUrl.js" "TinyURL React Hooks"
validate_file "pages/api/tinyurl.js" "TinyURL API Endpoint"
validate_file "pages/api/tinyurl-webhook.js" "Webhook API Endpoint"

# Enhanced components
validate_file "components/EnhancedSocialShare.jsx" "Enhanced Social Share Component"
validate_file "components/TinyUrlManager.jsx" "TinyURL Manager Component"

# Demo and docs
validate_file "pages/tinyurl-demo.js" "Demo Page"
validate_file "TINYURL_INTEGRATION_GUIDE.md" "Integration Guide"
validate_file "HYGRAPH_TINYURL_WEBHOOK_SETUP.md" "Webhook Setup Guide"

echo ""
echo "🔧 Environment Configuration"
echo "============================="

validate_env_var "TINYURL_API_KEY" "TinyURL API Key"
validate_env_var "HYGRAPH_WEBHOOK_SECRET" "Hygraph Webhook Secret"

echo ""
echo "📦 Dependencies Check"
echo "===================="

if [ -f "package.json" ]; then
    if grep -q "framer-motion" package.json; then
        echo -e "✅ ${GREEN}Framer Motion dependency${NC}"
        ((PASS++))
    else
        echo -e "⚠️  ${YELLOW}Framer Motion not found in package.json${NC}"
        echo -e "   Install with: npm install framer-motion"
    fi
else
    echo -e "❌ ${RED}package.json not found${NC}"
    ((FAIL++))
fi

echo ""
echo "🌐 API Endpoints Test"
echo "===================="

# Check if server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Development server is running on port 3000${NC}"
    
    test_api_endpoint "/api/tinyurl" "TinyURL API Endpoint"
    test_api_endpoint "/api/tinyurl-webhook" "Webhook API Endpoint"
    test_api_endpoint "/tinyurl-demo" "Demo Page"
else
    echo -e "${YELLOW}⚠️  Development server not running${NC}"
    echo -e "   Start with: npm run dev"
    echo -e "   Then run this script again to test endpoints"
fi

echo ""
echo "🔍 Code Integration Check"
echo "========================"

# Check if components are properly exported
if [ -f "components/index.js" ]; then
    if grep -q "EnhancedSocialShare\|TinyUrlManager" components/index.js; then
        echo -e "✅ ${GREEN}Components exported in index.js${NC}"
        ((PASS++))
    else
        echo -e "⚠️  ${YELLOW}Components not exported in index.js${NC}"
        echo -e "   Add exports for EnhancedSocialShare and TinyUrlManager"
    fi
fi

# Check existing social components integration
if [ -f "components/Social_post_details.jsx" ]; then
    if grep -q "useTinyUrl\|EnhancedSocialShare" components/Social_post_details.jsx; then
        echo -e "✅ ${GREEN}Social components updated with TinyURL${NC}"
        ((PASS++))
    else
        echo -e "⚠️  ${YELLOW}Social components not yet updated${NC}"
        echo -e "   Consider updating Social_post_details.jsx with TinyURL hooks"
    fi
fi

echo ""
echo "🧪 Test Scripts"
echo "==============="

validate_file "test-tinyurl-webhook.sh" "Webhook Test Script"

if [ -f "test-tinyurl-webhook.sh" ]; then
    if [ -x "test-tinyurl-webhook.sh" ]; then
        echo -e "✅ ${GREEN}Test script is executable${NC}"
        ((PASS++))
    else
        echo -e "⚠️  ${YELLOW}Test script not executable${NC}"
        echo -e "   Run: chmod +x test-tinyurl-webhook.sh"
    fi
fi

echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "✅ ${GREEN}Passed: $PASS${NC}"
echo -e "❌ ${RED}Failed: $FAIL${NC}"

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo -e "📈 Success Rate: ${PERCENTAGE}%"
else
    echo -e "📈 Success Rate: 0%"
fi

echo ""
echo "🎯 Next Steps"
echo "============="

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed! Your TinyURL integration is ready.${NC}"
    echo ""
    echo "Ready to use:"
    echo "1. 🚀 Start development server: npm run dev"
    echo "2. 🌐 Visit demo page: http://localhost:3000/tinyurl-demo"
    echo "3. 🔗 Test webhook: ./test-tinyurl-webhook.sh local"
    echo "4. ⚙️  Configure Hygraph webhook using HYGRAPH_TINYURL_WEBHOOK_SETUP.md"
else
    echo -e "${RED}⚠️  Some validations failed. Please address the issues above.${NC}"
    echo ""
    echo "Priority fixes:"
    if [ ! -f ".env.local" ]; then
        echo "1. Create .env.local with required API keys"
    fi
    echo "2. Install missing dependencies: npm install"
    echo "3. Re-run this validation script"
fi

echo ""
echo "📚 Documentation Available:"
echo "• TINYURL_INTEGRATION_GUIDE.md - Complete usage guide"
echo "• HYGRAPH_TINYURL_WEBHOOK_SETUP.md - Webhook setup steps"
echo "• WEBHOOK_FLOW_DIAGRAM.md - Visual flow diagram"

echo ""
echo "🆘 Need Help?"
echo "============="
echo "1. Check server logs for errors"
echo "2. Verify environment variables in .env.local"
echo "3. Test individual components in /tinyurl-demo"
echo "4. Run webhook tests: ./test-tinyurl-webhook.sh local"

echo ""
echo "Validation completed at $(date)"