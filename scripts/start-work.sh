#!/bin/bash

# Fairfield Airport Cars - Work Distribution Starter
# Immediately starts the multi-agent orchestration for task execution

set -e

echo "🚀 Fairfield Airport Cars - Work Distribution"
echo "============================================="
echo ""

# Check if we're ready to start
echo "🔍 Pre-flight checks..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if [ ! -f "scripts/orchestrate-agents.js" ]; then
    echo "❌ Orchestration script not found"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Show the task breakdown
echo "📋 TASK BREAKDOWN BY PRIORITY:"
echo ""

echo "🔴 CRITICAL TASKS (Revenue Blocking):"
echo "  • Payment Integration Testing (Payment Engineer)"
echo "  • Email/SMS Communication Testing (Communication Manager)"
echo "  • Admin Dashboard Testing (Admin Dashboard Developer)"
echo ""

echo "🟡 IMPORTANT TASKS (Business Operations):"
echo "  • Booking Management System (Booking Specialist)"
echo "  • Mobile Experience Testing (QA Tester)"
echo "  • Error Handling & Recovery (QA Tester)"
echo ""

echo "🟢 ENHANCEMENT TASKS (Nice-to-Have):"
echo "  • Analytics & Reporting (Business Analyst)"
echo "  • Advanced Features (Multiple Agents)"
echo ""

# Ask user which phase to start
echo "🎯 Which phase would you like to start?"
echo ""
echo "1) Phase 1: Critical Gaps (3 agents, parallel)"
echo "2) Phase 2: Important Features (2 agents, sequential)"
echo "3) Phase 3: Full System (6 agents, sequential)"
echo "4) Business Analysis (2 agents, sequential)"
echo "5) Custom scenario"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting Phase 1: Critical Gaps (Parallel Mode)"
        echo "This will test the 3 most critical areas simultaneously:"
        echo "  • Payment Engineer - Test Square integration"
        echo "  • Communication Manager - Test email/SMS delivery"
        echo "  • Admin Dashboard Developer - Test admin interface"
        echo ""
        ./scripts/launch-agents.sh critical-gaps parallel
        ;;
    2)
        echo "🚀 Starting Phase 2: Important Features (Sequential Mode)"
        echo "This will test booking management and mobile experience:"
        echo "  • Booking Specialist - Test booking management"
        echo "  • QA Tester - Test mobile experience and error handling"
        echo ""
        ./scripts/launch-agents.sh business-analysis sequential
        ;;
    3)
        echo "🚀 Starting Phase 3: Full System (Sequential Mode)"
        echo "This will test all 6 agents working together:"
        echo "  • All agents for comprehensive validation"
        echo ""
        ./scripts/launch-agents.sh full-system sequential
        ;;
    4)
        echo "🚀 Starting Business Analysis (Sequential Mode)"
        echo "This will analyze current status and performance:"
        echo "  • Business Analyst - Generate status report"
        echo "  • QA Tester - Validate current functionality"
        echo ""
        ./scripts/launch-agents.sh business-analysis sequential
        ;;
    5)
        echo "🚀 Starting Custom Scenario"
        echo "Available scenarios:"
        echo "  • critical-gaps"
        echo "  • comprehensive-testing"
        echo "  • business-analysis"
        echo "  • full-system"
        echo ""
        read -p "Enter scenario name: " scenario
        read -p "Enter mode (parallel/sequential): " mode
        ./scripts/launch-agents.sh $scenario $mode
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🏁 Work distribution completed!"
echo ""
echo "📊 Next Steps:"
echo "1) Review the results above"
echo "2) Check the task list in docs/TASK_LIST.md"
echo "3) Update progress in docs/CURRENT_STATUS.md"
echo "4) Run the next phase when ready"
echo ""
echo "💡 Tips:"
echo "• Use 'parallel' mode for speed, 'sequential' for debugging"
echo "• Check agent output for specific issues"
echo "• Monitor system resources during parallel execution"
echo "• Use 'node scripts/quick-kill.js' if processes hang" 