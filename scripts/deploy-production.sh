#!/bin/bash

# =============================================================================
# Fairfield Airport Cars - Production Deployment Script
# =============================================================================
# This script automates the production deployment process with safety checks
# Usage: ./scripts/deploy-production.sh
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Fairfield Airport Cars Production Deployment..."
echo "=================================================="

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =============================================================================
# SAFETY CHECKS
# =============================================================================

echo -e "${YELLOW}🔍 Running pre-deployment safety checks...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check Node.js version (should be 18.x or higher)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js version 18.x or higher required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version check passed${NC}"

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================

echo -e "${YELLOW}🔧 Checking environment configuration...${NC}"

# Check if critical environment variables are set
REQUIRED_VARS=(
    "NEXT_PUBLIC_BASE_URL"
    "SQUARE_ACCESS_TOKEN"
    "SQUARE_LOCATION_ID"
    "NEXT_PUBLIC_GOOGLE_API_KEY"
)

missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Error: Missing required environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo -e "${YELLOW}💡 Tip: Check your .env.local file or deployment platform environment settings${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables check passed${NC}"

# =============================================================================
# CODE QUALITY CHECKS
# =============================================================================

echo -e "${YELLOW}🧪 Running code quality checks...${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Run TypeScript checks
echo "🔍 Running TypeScript checks..."
if ! npm run type-check > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: TypeScript errors found${NC}"
    echo "Run 'npm run type-check' to see details"
    exit 1
fi

echo -e "${GREEN}✅ TypeScript check passed${NC}"

# Build the application
echo "🏗️ Building application..."
if ! npm run build; then
    echo -e "${RED}❌ Error: Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# =============================================================================
# DEPLOYMENT CONFIRMATION
# =============================================================================

echo ""
echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT CONFIRMATION${NC}"
echo "=================================================="
echo "Domain: ${NEXT_PUBLIC_BASE_URL}"
echo "Environment: ${NODE_ENV:-production}"
echo "Square Environment: $(if [[ $SQUARE_ACCESS_TOKEN == *"sandbox"* ]]; then echo "SANDBOX"; else echo "PRODUCTION"; fi)"
echo ""

read -p "🚨 Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# =============================================================================
# DEPLOYMENT EXECUTION
# =============================================================================

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Detect deployment platform and deploy accordingly
if command -v vercel &> /dev/null; then
    echo "📡 Deploying with Vercel..."
    vercel --prod --yes
elif [ -f "netlify.toml" ]; then
    echo "📡 Deploying with Netlify..."
    netlify deploy --prod
else
    echo -e "${YELLOW}⚠️  No automatic deployment platform detected${NC}"
    echo "📝 Manual deployment steps:"
    echo "1. Upload the .next folder to your server"
    echo "2. Set environment variables on your server"
    echo "3. Start the application with: npm start"
fi

# =============================================================================
# POST-DEPLOYMENT CHECKS
# =============================================================================

echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Wait for deployment to be live
sleep 30

# Check if the site is responding
if curl -f -s "${NEXT_PUBLIC_BASE_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Site is responding${NC}"
else
    echo -e "${RED}❌ Warning: Site not responding${NC}"
fi

# Check critical pages
CRITICAL_PAGES=("/" "/book" "/admin")
for page in "${CRITICAL_PAGES[@]}"; do
    if curl -f -s "${NEXT_PUBLIC_BASE_URL}${page}" > /dev/null; then
        echo -e "${GREEN}✅ ${page} is accessible${NC}"
    else
        echo -e "${RED}❌ Warning: ${page} not accessible${NC}"
    fi
done

# =============================================================================
# SUCCESS MESSAGE
# =============================================================================

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo "🌐 Your site is live at: ${NEXT_PUBLIC_BASE_URL}"
echo ""
echo -e "${YELLOW}📋 Post-Deployment Checklist:${NC}"
echo "  □ Test complete booking flow"
echo "  □ Verify payment processing"
echo "  □ Check admin dashboard access"
echo "  □ Test on mobile devices"
echo "  □ Monitor error logs for 24 hours"
echo "  □ Set up monitoring/alerts"
echo ""
echo -e "${YELLOW}📊 Monitoring URLs:${NC}"
echo "  • Main site: ${NEXT_PUBLIC_BASE_URL}"
echo "  • Booking form: ${NEXT_PUBLIC_BASE_URL}/book"
echo "  • Admin dashboard: ${NEXT_PUBLIC_BASE_URL}/admin"
echo ""
echo -e "${GREEN}🚀 Happy launching! Your customers can now book rides!${NC}" 