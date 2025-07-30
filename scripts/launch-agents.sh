#!/bin/bash

# Multi-Agent Orchestration Launcher
# Launches different scenarios of coordinated agent testing

set -e

echo "🤖 Fairfield Airport Cars - Multi-Agent Orchestration"
echo "=================================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [scenario] [mode]"
    echo ""
    echo "Scenarios:"
    echo "  critical-gaps      - Test payment, email, and admin (3 agents)"
    echo "  comprehensive      - Full testing with QA, booking, payment, communication (4 agents)"
    echo "  business-analysis  - Business analysis and QA testing (2 agents)"
    echo "  full-system       - All 6 agents working together"
    echo ""
    echo "Modes:"
    echo "  parallel          - Run agents simultaneously (default)"
    echo "  sequential        - Run agents one after another"
    echo ""
    echo "Examples:"
    echo "  $0 critical-gaps parallel"
    echo "  $0 full-system sequential"
    echo "  $0 comprehensive"
}

# Check if help is requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

# Default values
SCENARIO=${1:-critical-gaps}
MODE=${2:-parallel}

echo "🎯 Scenario: $SCENARIO"
echo "⚡ Mode: $MODE"
echo ""

# Validate scenario
case $SCENARIO in
    critical-gaps|comprehensive|business-analysis|full-system)
        ;;
    *)
        echo "❌ Unknown scenario: $SCENARIO"
        show_usage
        exit 1
        ;;
esac

# Validate mode
case $MODE in
    parallel|sequential)
        ;;
    *)
        echo "❌ Unknown mode: $MODE"
        show_usage
        exit 1
        ;;
esac

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Check if the orchestration script exists
if [ ! -f "scripts/orchestrate-agents.js" ]; then
    echo "❌ Orchestration script not found: scripts/orchestrate-agents.js"
    exit 1
fi

# Check if development server is running
echo "🔍 Checking if development server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Development server not running on port 3000"
    echo "💡 Starting development server in background..."
    npm run dev > /dev/null 2>&1 &
    DEV_PID=$!
    echo "⏳ Waiting for server to start..."
    sleep 10
    
    # Check again
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ Failed to start development server"
        exit 1
    fi
    echo "✅ Development server started"
else
    echo "✅ Development server is running"
fi

echo ""
echo "🚀 Launching Multi-Agent Orchestration..."
echo "=========================================="

# Run the orchestration
node scripts/orchestrate-agents.js $SCENARIO $MODE

# Capture exit code
EXIT_CODE=$?

echo ""
echo "🏁 Orchestration completed with exit code: $EXIT_CODE"

# Clean up if we started the dev server
if [ ! -z "$DEV_PID" ]; then
    echo "🧹 Cleaning up development server..."
    kill $DEV_PID 2>/dev/null || true
fi

exit $EXIT_CODE 