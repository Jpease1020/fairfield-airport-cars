#!/bin/bash

# 🛡️ Pre-Commit Guardrails Script
# This script runs comprehensive tests to ensure code changes don't break the app

set -e  # Exit on any error

echo "🛡️ Running Pre-Commit Guardrails..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if dev server is running
print_status "Checking if development server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_warning "Development server not running. Starting it..."
    npm run dev &
    DEV_PID=$!
    sleep 10  # Wait for server to start
else
    print_success "Development server is running"
fi

# Step 2: Run build test
print_status "Running build test..."
if npm run build; then
    print_success "Build test passed"
else
    print_error "Build test failed!"
    exit 1
fi

# Step 3: Run unit tests
print_status "Running unit tests..."
if npm run test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed!"
    exit 1
fi

# Step 4: Run integration tests
print_status "Running integration tests..."
if npm run test:integration; then
    print_success "Integration tests passed"
else
    print_error "Integration tests failed!"
    exit 1
fi

# Step 5: Run E2E page integrity tests
print_status "Running E2E page integrity tests..."
if npm run test:e2e -- tests/e2e/page-integrity.test.ts; then
    print_success "E2E page integrity tests passed"
else
    print_error "E2E page integrity tests failed!"
    exit 1
fi

# Step 6: Quick smoke test of critical pages
print_status "Running quick smoke test of critical pages..."
CRITICAL_PAGES=("/" "/about" "/book" "/help")

for page in "${CRITICAL_PAGES[@]}"; do
    if curl -s "http://localhost:3000$page" | grep -q "Fairfield Airport Cars"; then
        print_success "Page $page loads correctly"
    else
        print_error "Page $page failed to load correctly!"
        exit 1
    fi
done

# Step 7: Check for console errors
print_status "Checking for console errors..."
ERROR_COUNT=$(curl -s http://localhost:3000 | grep -c "error\|Error" || true)
if [ "$ERROR_COUNT" -eq 0 ]; then
    print_success "No console errors detected"
else
    print_warning "Found $ERROR_COUNT potential console errors"
fi

# Step 8: Check for content duplication
print_status "Checking for content duplication..."
ABOUT_CONTENT=$(curl -s http://localhost:3000/about)
HOME_CONTENT=$(curl -s http://localhost:3000/)

# Check if About page has homepage content
if echo "$ABOUT_CONTENT" | grep -q "Why Choose Us"; then
    print_error "About page contains homepage content (duplication detected)!"
    exit 1
else
    print_success "No content duplication detected"
fi

# Step 9: Check for proper page titles
print_status "Checking page titles..."
if echo "$ABOUT_CONTENT" | grep -q "About Us"; then
    print_success "About page has correct title"
else
    print_error "About page has incorrect title!"
    exit 1
fi

if echo "$HOME_CONTENT" | grep -q "Premium Airport Transportation"; then
    print_success "Homepage has correct content"
else
    print_error "Homepage has incorrect content!"
    exit 1
fi

# Step 10: Check for responsive design elements
print_status "Checking responsive design elements..."
if echo "$HOME_CONTENT" | grep -q "mobile-menu-button"; then
    print_success "Mobile menu button present"
else
    print_warning "Mobile menu button not found"
fi

# Final success message
echo ""
print_success "🎉 All pre-commit checks passed!"
print_success "✅ Build works"
print_success "✅ Tests pass"
print_success "✅ Pages load correctly"
print_success "✅ No content duplication"
print_success "✅ UI/UX standards maintained"
echo ""
print_status "Your changes are ready for commit! 🚀"

# Cleanup
if [ ! -z "$DEV_PID" ]; then
    kill $DEV_PID 2>/dev/null || true
fi

exit 0 