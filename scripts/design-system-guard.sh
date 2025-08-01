#!/bin/bash

# 🛡️ Design System Protection Script
# This script ensures the design directory remains clean and compliant

set -e

echo "🔒 Checking Design System Integrity..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

# Check design directory ESLint errors
DESIGN_ERRORS=$(npx eslint src/design/ --quiet 2>&1 | grep -c "error" || echo "0")

if [ "$DESIGN_ERRORS" -gt 0 ]; then
    echo "❌ Design system has $DESIGN_ERRORS ESLint errors!"
    echo "🚨 Design system must be clean before proceeding."
    echo ""
    echo "🔧 To fix design system errors:"
    echo "   npx eslint src/design/ --fix"
    echo ""
    echo "📋 Current design system errors:"
    npx eslint src/design/ --quiet
    exit 1
fi

echo "✅ Design system is clean!"
echo "🛡️ Design system protection active"

# Optional: Check for any new files in design directory
NEW_DESIGN_FILES=$(git diff --cached --name-only --diff-filter=A | grep "^src/design/" || true)

if [ -n "$NEW_DESIGN_FILES" ]; then
    echo "📝 New files in design directory:"
    echo "$NEW_DESIGN_FILES"
    echo ""
    echo "⚠️  Please ensure new design files follow the 4-layer architecture:"
    echo "   - Layer 1: Grid System (Grid, Row, Col)"
    echo "   - Layer 2: Content Layout (Box, Stack)"
    echo "   - Layer 3: Layout System (Container, Section)"
    echo "   - Layer 4: Page Layout (PageLayout)"
fi

echo "🎯 Design system protection complete" 