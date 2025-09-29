#!/bin/bash

# TinyURL Integration Setup Script for urTechy Blog
# This script helps set up the TinyURL integration

echo "🔗 Setting up TinyURL Integration for urTechy Blog..."
echo "=================================================="

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from your Next.js project root."
    exit 1
fi

print_status "Found Next.js project"

# Check if required files exist
echo ""
echo "Checking TinyURL integration files..."

files_to_check=(
    "services/tinyurl.js"
    "hooks/useTinyUrl.js"
    "components/EnhancedSocialShare.jsx"
    "components/TinyUrlManager.jsx"
    "pages/api/tinyurl.js"
    "pages/tinyurl-demo.js"
)

missing_files=()

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file"
    else
        print_error "$file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_warning "Some integration files are missing. Please ensure all files are properly created."
fi

# Check environment variables
echo ""
echo "Checking environment configuration..."

if [ -f ".env.local" ]; then
    if grep -q "TINYURL_API_KEY" .env.local; then
        print_status "TINYURL_API_KEY found in .env.local"
    else
        print_warning "TINYURL_API_KEY not found in .env.local"
        echo ""
        echo "Please add your TinyURL API key to .env.local:"
        echo "TINYURL_API_KEY=jGMS4dw09w4ozmeBnJ8RKlZD8u70bS9kFX4azrPK4A9G99Bi3pMRdh93uTyH"
    fi
else
    print_warning ".env.local not found"
    echo ""
    echo "Creating .env.local with TinyURL configuration..."
    echo "TINYURL_API_KEY=jGMS4dw09w4ozmeBnJ8RKlZD8u70bS9kFX4azrPK4A9G99Bi3pMRdh93uTyH" > .env.local
    print_status "Created .env.local with API key"
fi

# Update .env.example if it exists
if [ -f ".env.example" ]; then
    if grep -q "TINYURL_API_KEY" .env.example; then
        print_status "TINYURL_API_KEY already in .env.example"
    else
        echo "" >> .env.example
        echo "# TinyURL Configuration" >> .env.example
        echo "TINYURL_API_KEY=your-tinyurl-api-key-here" >> .env.example
        print_status "Added TINYURL_API_KEY to .env.example"
    fi
fi

# Check Node.js dependencies
echo ""
echo "Checking dependencies..."

required_deps=(
    "react"
    "next"
    "framer-motion"
    "react-icons"
)

missing_deps=()

for dep in "${required_deps[@]}"; do
    if npm list "$dep" &> /dev/null; then
        print_status "$dep"
    else
        print_warning "$dep (not installed or not found)"
        missing_deps+=("$dep")
    fi
done

if [ ${#missing_deps[@]} -gt 0 ]; then
    print_warning "Some dependencies might be missing. The integration should still work with your existing setup."
fi

# Test API connection
echo ""
echo "Testing TinyURL API connection..."

if command -v node &> /dev/null; then
    # Create a simple test script
    cat > test_tinyurl.js << 'EOF'
const https = require('https');

const API_KEY = process.env.TINYURL_API_KEY || 'jGMS4dw09w4ozmeBnJ8RKlZD8u70bS9kFX4azrPK4A9G99Bi3pMRdh93uTyH';

const testData = JSON.stringify({
  url: 'https://blog.urtechy.com/post/test',
  alias: 'urtechy-test-' + Date.now(),
  tags: ['urtechy-blog', 'test']
});

const options = {
  hostname: 'api.tinyurl.com',
  path: '/create',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200 && result.code === 0) {
        console.log('✓ TinyURL API connection successful');
        console.log('✓ Test short URL created:', result.data.tiny_url);
      } else {
        console.log('⚠ TinyURL API responded with:', result);
      }
    } catch (e) {
      console.log('✗ Failed to parse API response');
    }
  });
});

req.on('error', (error) => {
  console.log('✗ TinyURL API connection failed:', error.message);
});

req.write(testData);
req.end();
EOF

    # Run the test
    TINYURL_API_KEY="jGMS4dw09w4ozmeBnJ8RKlZD8u70bS9kFX4azrPK4A9G99Bi3pMRdh93uTyH" node test_tinyurl.js
    
    # Clean up test file
    rm test_tinyurl.js
else
    print_warning "Node.js not found. Skipping API test."
fi

# Development server instructions
echo ""
echo "=================================================="
echo "🚀 Setup Summary"
echo "=================================================="

echo ""
print_info "Integration Status:"
if [ ${#missing_files[@]} -eq 0 ]; then
    print_status "All integration files are present"
else
    print_warning "${#missing_files[@]} files need to be created"
fi

echo ""
print_info "Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Visit http://localhost:3000/tinyurl-demo to test the integration"
echo "3. Check existing posts to see automatic URL shortening"
echo "4. Review the integration guide: TINYURL_INTEGRATION_GUIDE.md"

echo ""
print_info "Usage Examples:"
echo "• Add to any post page: <EnhancedSocialShare post={post} enableTinyUrl={true} />"
echo "• Use the hook: const { shortUrl, isLoading } = useTinyUrl(post)"
echo "• Admin management: <TinyUrlManager posts={posts} showBulkActions={true} />"

echo ""
print_info "Resources:"
echo "• Demo page: /tinyurl-demo"
echo "• API endpoint: /api/tinyurl"
echo "• Integration guide: /TINYURL_INTEGRATION_GUIDE.md"
echo "• TinyURL Dashboard: https://tinyurl.com/app/myurls"

echo ""
print_status "TinyURL integration setup complete! 🎉"

# Optional: Open demo page if on macOS and browser is available
if [[ "$OSTYPE" == "darwin"* ]] && command -v open &> /dev/null; then
    echo ""
    read -p "Would you like to open the demo page in your browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Opening demo page..."
        sleep 2
        open "http://localhost:3000/tinyurl-demo" 2>/dev/null || print_warning "Could not open browser. Make sure your dev server is running."
    fi
fi