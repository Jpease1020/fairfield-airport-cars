#!/bin/bash

# Layout Tests Runner
# Runs comprehensive layout tests for our perfected pages

echo "🎯 Running Layout Tests..."
echo "=========================="

# Check if dev server is running
if ! lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️  Dev server not running on port 3000"
    echo "🚀 Starting dev server..."
    npm run dev:clean &
    sleep 10
fi

# Run the layout tests
echo "🧪 Running simple page layout tests..."
npm run test:layout

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All layout tests passed!"
    echo "📊 Test Summary:"
    echo "   - Design system compliance verified"
    echo "   - No inline styles found"
    echo "   - All pages use UnifiedLayout"
    echo "   - Responsive design working"
else
    echo "❌ Some layout tests failed"
    echo "🔍 Check the test report for details"
    exit 1
fi

echo "🎉 Layout tests completed!" 