#!/bin/bash

# Development Server Status Check
# This script checks if the dev server is running and shows its status

PORT=3000

echo "🔧 Development Server Status Check"
echo "=================================="

# Check if dev server is running
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "✅ Development server is running on port $PORT"
    echo ""
    echo "📊 Process Details:"
    lsof -ti:$PORT | xargs ps -p
    echo ""
    echo "🌐 Server URL: http://localhost:$PORT"
    echo "🛑 To stop: kill -9 \$(lsof -ti:$PORT)"
else
    echo "❌ No development server running on port $PORT"
    echo ""
    echo "🚀 To start: npm run dev:safe"
fi

echo ""
echo "📋 Available commands:"
echo "  npm run dev:safe     - Start dev server safely"
echo "  npm run dev:clean    - Start dev server with clean cache"
echo "  npm run dev          - Start dev server directly" 