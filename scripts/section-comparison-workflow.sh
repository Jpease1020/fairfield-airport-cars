#!/bin/bash

# Section Comparison Workflow Script
# This script helps you capture before/after snapshots of sections for design comparison

set -e

echo "🎨 Section Comparison Workflow"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if dev server is running
check_dev_server() {
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Dev server is running on port 3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Dev server is not running on port 3000${NC}"
        return 1
    fi
}

# Function to start dev server
start_dev_server() {
    echo -e "${BLUE}🚀 Starting dev server...${NC}"
    npm run dev &
    sleep 10
    echo -e "${GREEN}✅ Dev server started${NC}"
}

# Function to capture before snapshots
capture_before() {
    echo -e "${BLUE}📸 Capturing BEFORE snapshots...${NC}"
    npx playwright test tests/e2e/section-comparison.spec.ts --grep "Capture section snapshot before changes" --config=config/playwright.config.ts
    echo -e "${GREEN}✅ Before snapshots captured${NC}"
}

# Function to capture book page specific sections
capture_book_page() {
    echo -e "${BLUE}📸 Capturing BOOK PAGE specific sections...${NC}"
    npx playwright test tests/e2e/section-comparison.spec.ts --grep "Capture book page specific sections" --config=config/playwright.config.ts
    echo -e "${GREEN}✅ Book page snapshots captured${NC}"
}

# Function to capture after snapshots
capture_after() {
    echo -e "${BLUE}📸 Capturing AFTER snapshots...${NC}"
    npx playwright test tests/e2e/section-comparison.spec.ts --grep "Capture section snapshot after changes" --config=config/playwright.config.ts
    echo -e "${GREEN}✅ After snapshots captured${NC}"
}

# Function to capture custom section
capture_custom() {
    local selector=$1
    if [ -z "$selector" ]; then
        echo -e "${YELLOW}⚠️  Please provide a CSS selector for the custom section${NC}"
        echo "Usage: $0 custom '.your-selector'"
        exit 1
    fi
    
    echo -e "${BLUE}📸 Capturing custom section: $selector${NC}"
    # Update the test file with the custom selector
    sed -i.bak "s/const customSelector = '.*';/const customSelector = '$selector';/" tests/e2e/section-comparison.spec.ts
    npx playwright test tests/e2e/section-comparison.spec.ts --grep "Compare specific section with custom selector" --config=config/playwright.config.ts
    # Restore the original selector
    mv tests/e2e/section-comparison.spec.ts.bak tests/e2e/section-comparison.spec.ts
    echo -e "${GREEN}✅ Custom section snapshot captured${NC}"
}

# Function to generate comparison report
generate_report() {
    echo -e "${BLUE}📊 Generating comparison report...${NC}"
    npx playwright test tests/e2e/section-comparison.spec.ts --grep "Generate comparison report" --config=config/playwright.config.ts
    echo -e "${GREEN}✅ Comparison report generated${NC}"
    echo -e "${BLUE}📁 Report location: test-results/section-comparison/comparison-report.html${NC}"
}

# Function to open comparison report
open_report() {
    if [ -f "test-results/section-comparison/comparison-report.html" ]; then
        echo -e "${BLUE}🌐 Opening comparison report...${NC}"
        open test-results/section-comparison/comparison-report.html
    else
        echo -e "${RED}❌ Comparison report not found${NC}"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  before     - Capture BEFORE snapshots of all sections"
    echo "  book       - Capture BOOK PAGE specific sections"
    echo "  after      - Capture AFTER snapshots of all sections"
    echo "  custom     - Capture a specific section (requires CSS selector)"
    echo "  report     - Generate comparison report"
    echo "  open       - Open comparison report in browser"
    echo "  workflow   - Run complete workflow (before -> make changes -> after)"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 before                    # Capture before snapshots"
    echo "  $0 book                      # Capture book page sections"
    echo "  $0 custom '.hero-section'    # Capture specific section"
    echo "  $0 workflow                  # Run complete workflow"
}

# Main script logic
case "${1:-help}" in
    "before")
        if ! check_dev_server; then
            start_dev_server
        fi
        capture_before
        ;;
    "book")
        if ! check_dev_server; then
            start_dev_server
        fi
        capture_book_page
        ;;
    "after")
        if ! check_dev_server; then
            start_dev_server
        fi
        capture_after
        ;;
    "custom")
        if ! check_dev_server; then
            start_dev_server
        fi
        capture_custom "$2"
        ;;
    "report")
        generate_report
        ;;
    "open")
        open_report
        ;;
    "workflow")
        echo -e "${BLUE}🔄 Starting complete workflow...${NC}"
        echo ""
        echo -e "${YELLOW}Step 1: Capturing BEFORE snapshots${NC}"
        if ! check_dev_server; then
            start_dev_server
        fi
        capture_before
        echo ""
        echo -e "${YELLOW}Step 2: Make your design changes now${NC}"
        echo -e "${BLUE}💡 Edit your components, then press Enter to continue...${NC}"
        read -p "Press Enter when you're ready to capture AFTER snapshots..."
        echo ""
        echo -e "${YELLOW}Step 3: Capturing AFTER snapshots${NC}"
        capture_after
        echo ""
        echo -e "${YELLOW}Step 4: Generating comparison report${NC}"
        generate_report
        echo ""
        echo -e "${GREEN}🎉 Workflow complete!${NC}"
        echo -e "${BLUE}📁 Check test-results/section-comparison/ for snapshots${NC}"
        echo -e "${BLUE}📊 Open test-results/section-comparison/comparison-report.html for comparison${NC}"
        ;;
    "help"|*)
        show_help
        ;;
esac 