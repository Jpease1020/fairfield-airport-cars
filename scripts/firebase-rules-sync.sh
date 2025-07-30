#!/bin/bash

# Firebase Rules Sync Script
# This script helps manage Firebase Firestore rules between local and remote environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RULES_FILE="config/firestore.rules"
BACKUP_DIR="config/firestore-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🔥 Firebase Rules Sync Tool${NC}"
echo "=================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to backup current rules
backup_rules() {
    echo -e "${YELLOW}📦 Creating backup of current rules...${NC}"
    cp "$RULES_FILE" "$BACKUP_DIR/firestore.rules.backup.$TIMESTAMP"
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/firestore.rules.backup.$TIMESTAMP${NC}"
}

# Function to deploy rules
deploy_rules() {
    echo -e "${YELLOW}🚀 Deploying rules to Firebase...${NC}"
    firebase deploy --only firestore:rules
    echo -e "${GREEN}✅ Rules deployed successfully!${NC}"
}

# Function to pull rules from Firebase
pull_rules() {
    echo -e "${YELLOW}📥 Pulling rules from Firebase...${NC}"
    firebase firestore:rules:get > "$RULES_FILE.temp"
    
    if [ -s "$RULES_FILE.temp" ]; then
        mv "$RULES_FILE.temp" "$RULES_FILE"
        echo -e "${GREEN}✅ Rules pulled successfully!${NC}"
    else
        rm "$RULES_FILE.temp"
        echo -e "${RED}❌ Failed to pull rules from Firebase${NC}"
        exit 1
    fi
}

# Function to validate rules
validate_rules() {
    echo -e "${YELLOW}🔍 Validating rules syntax...${NC}"
    
    # Check if rules file exists
    if [ ! -f "$RULES_FILE" ]; then
        echo -e "${RED}❌ Rules file not found: $RULES_FILE${NC}"
        exit 1
    fi
    
    # Check basic syntax (look for common issues)
    if grep -q "rules_version" "$RULES_FILE" && grep -q "service cloud.firestore" "$RULES_FILE"; then
        echo -e "${GREEN}✅ Rules file structure looks valid${NC}"
        
        # Check for common syntax issues
        if grep -q "allow.*if.*request.auth" "$RULES_FILE"; then
            echo -e "${GREEN}✅ Authentication rules found${NC}"
        fi
        
        if grep -q "match.*documents" "$RULES_FILE"; then
            echo -e "${GREEN}✅ Collection rules found${NC}"
        fi
        
        echo -e "${GREEN}✅ Rules syntax appears valid!${NC}"
    else
        echo -e "${RED}❌ Rules file appears to have invalid structure${NC}"
        exit 1
    fi
}

# Function to show diff
show_diff() {
    echo -e "${YELLOW}📋 Showing diff with deployed rules...${NC}"
    firebase firestore:rules:get > /tmp/deployed_rules
    if diff "$RULES_FILE" /tmp/deployed_rules; then
        echo -e "${GREEN}✅ Local rules match deployed rules${NC}"
    else
        echo -e "${YELLOW}⚠️  Local rules differ from deployed rules${NC}"
    fi
    rm /tmp/deployed_rules
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy local rules to Firebase"
    echo "  pull      - Pull rules from Firebase to local"
    echo "  backup    - Create backup of current rules"
    echo "  validate  - Validate rules syntax"
    echo "  diff      - Show diff between local and deployed rules"
    echo "  sync      - Pull rules, backup, then deploy (full sync)"
    echo "  status    - Show current status"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy local rules"
    echo "  $0 pull      # Pull remote rules"
    echo "  $0 sync      # Full sync workflow"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Current Status:${NC}"
    echo "Local rules file: $RULES_FILE"
    echo "Backup directory: $BACKUP_DIR"
    echo ""
    
    if [ -f "$RULES_FILE" ]; then
        echo -e "${GREEN}✅ Local rules file exists${NC}"
        echo "Size: $(wc -c < "$RULES_FILE") bytes"
        echo "Last modified: $(stat -f "%Sm" "$RULES_FILE")"
    else
        echo -e "${RED}❌ Local rules file missing${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Recent backups:${NC}"
    ls -la "$BACKUP_DIR" | tail -5
}

# Function to perform full sync
full_sync() {
    echo -e "${BLUE}🔄 Performing full sync...${NC}"
    
    # Pull current rules
    pull_rules
    
    # Create backup
    backup_rules
    
    # Validate rules
    validate_rules
    
    # Show diff
    show_diff
    
    echo -e "${GREEN}✅ Full sync completed!${NC}"
}

# Main script logic
case "${1:-}" in
    "deploy")
        backup_rules
        validate_rules
        deploy_rules
        ;;
    "pull")
        backup_rules
        pull_rules
        validate_rules
        ;;
    "backup")
        backup_rules
        ;;
    "validate")
        validate_rules
        ;;
    "diff")
        show_diff
        ;;
    "sync")
        full_sync
        ;;
    "status")
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 