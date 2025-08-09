#!/bin/bash

echo "🧹 Performance Optimization Script"
echo "=================================="

# Kill any running dev servers
echo "🛑 Stopping development servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Clean cache directories
echo "🗑️  Cleaning cache directories..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .firebase/hosting.*.cache 2>/dev/null || true

# Clean temporary files
echo "🧽 Cleaning temporary files..."
find . -name "*.log" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true

# Clean node_modules if it's too large
NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
echo "📦 Current node_modules size: $NODE_MODULES_SIZE"

if [[ "$NODE_MODULES_SIZE" == *"G"* ]]; then
    echo "⚠️  Large node_modules detected. Consider running: npm ci"
fi

# Check for running processes
echo "🔍 Checking for heavy processes..."
ps aux | grep -E "(node|next|npm)" | grep -v grep | head -5

echo "✅ Performance optimization complete!"
echo ""
echo "💡 Tips for better performance:"
echo "   - Only start dev server when needed: npm run dev"
echo "   - Use 'npm ci' instead of 'npm install' for faster installs"
echo "   - Consider using pnpm for smaller node_modules"
echo "   - Restart Cursor if it becomes slow" 