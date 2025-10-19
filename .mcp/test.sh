#!/bin/bash

# Test script for Hygraph MCP Server
echo "🧪 Testing Hygraph MCP Server..."
echo ""

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo "❌ Error: .env.local not found in project root"
    exit 1
fi

# Check if required env vars are set
source ../.env.local

if [ -z "$NEXT_PUBLIC_HYGRAPH_CONTENT_API" ]; then
    echo "❌ Error: NEXT_PUBLIC_HYGRAPH_CONTENT_API not set in .env.local"
    exit 1
fi

echo "✅ Environment configured"
echo "   API: $NEXT_PUBLIC_HYGRAPH_CONTENT_API"

if [ -z "$HYGRAPH_AUTH_TOKEN" ]; then
    echo "⚠️  Warning: HYGRAPH_AUTH_TOKEN not set (write operations disabled)"
else
    echo "✅ Auth token configured"
fi

echo ""
echo "🚀 Starting MCP server (Press Ctrl+C to stop)..."
echo ""

node hygraph-server.js
