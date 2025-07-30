#!/bin/bash

# Development Server Management Script
# This script ensures only one dev server runs at a time

PORT=3000
PROJECT_NAME="fairfield-airport-cars"

echo "🔧 Checking for existing development server..."

# Check if dev server is already running
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "⚠️  Development server already running on port $PORT"
    echo "📊 Current processes:"
    lsof -ti:$PORT | xargs ps -p
    
    read -p "Do you want to kill existing processes and restart? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Killing existing processes..."
        kill -9 $(lsof -ti:$PORT) 2>/dev/null || true
        sleep 2
    else
        echo "✅ Keeping existing server running"
        exit 0
    fi
fi

# Clean build cache if needed
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning build cache..."
    rm -rf .next
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo "📍 URL: http://localhost:$PORT"
echo "🛑 Press Ctrl+C to stop"

# Start the development server
npm run dev 