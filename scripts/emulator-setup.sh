#!/bin/bash

# Firebase Emulator Management Script
# This script helps you start, stop, and manage Firebase emulators

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Firebase Emulator Management Script${NC}"

# Function to check if emulators are running
check_emulators() {
    echo -e "${YELLOW}Checking emulator status...${NC}"
    
    if lsof -ti:8080 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Firestore emulator running on port 8080${NC}"
    else
        echo -e "${RED}❌ Firestore emulator not running${NC}"
    fi
    
    if lsof -ti:9099 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Auth emulator running on port 9099${NC}"
    else
        echo -e "${RED}❌ Auth emulator not running${NC}"
    fi
    
    if lsof -ti:5001 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Functions emulator running on port 5001${NC}"
    else
        echo -e "${RED}❌ Functions emulator not running${NC}"
    fi
    
    if lsof -ti:9199 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Storage emulator running on port 9199${NC}"
    else
        echo -e "${RED}❌ Storage emulator not running${NC}"
    fi
    
    if lsof -ti:4000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Emulator UI running on port 4000${NC}"
    else
        echo -e "${RED}❌ Emulator UI not running${NC}"
    fi
}

# Function to start all emulators
start_emulators() {
    echo -e "${BLUE}Starting Firebase emulators...${NC}"
    
    # Kill any existing processes on emulator ports
    echo -e "${YELLOW}Cleaning up existing processes...${NC}"
    kill -9 $(lsof -ti:8080) 2>/dev/null || true
    kill -9 $(lsof -ti:9099) 2>/dev/null || true
    kill -9 $(lsof -ti:5001) 2>/dev/null || true
    kill -9 $(lsof -ti:9199) 2>/dev/null || true
    kill -9 $(lsof -ti:4000) 2>/dev/null || true
    
    echo -e "${GREEN}Starting emulators in background...${NC}"
    firebase emulators:start &
    
    # Wait a moment for emulators to start
    sleep 5
    
    echo -e "${GREEN}🎉 Emulators started!${NC}"
    echo -e "${BLUE}📊 Emulator UI: http://localhost:4000${NC}"
    echo -e "${BLUE}🔥 Firestore: localhost:8080${NC}"
    echo -e "${BLUE}🔐 Auth: http://localhost:9099${NC}"
    echo -e "${BLUE}⚡ Functions: http://localhost:5001${NC}"
    echo -e "${BLUE}📁 Storage: http://localhost:9199${NC}"
}

# Function to stop emulators
stop_emulators() {
    echo -e "${YELLOW}Stopping Firebase emulators...${NC}"
    
    # Kill processes on emulator ports
    kill -9 $(lsof -ti:8080) 2>/dev/null || true
    kill -9 $(lsof -ti:9099) 2>/dev/null || true
    kill -9 $(lsof -ti:5001) 2>/dev/null || true
    kill -9 $(lsof -ti:9199) 2>/dev/null || true
    kill -9 $(lsof -ti:4000) 2>/dev/null || true
    
    echo -e "${GREEN}✅ Emulators stopped${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Usage: $0 [command]${NC}"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  start     - Start all Firebase emulators"
    echo -e "  stop      - Stop all Firebase emulators"
    echo -e "  status    - Check emulator status"
    echo -e "  help      - Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 start    # Start emulators"
    echo -e "  $0 stop     # Stop emulators"
    echo -e "  $0 status   # Check status"
}

# Main script logic
case "${1:-help}" in
    start)
        start_emulators
        ;;
    stop)
        stop_emulators
        ;;
    status)
        check_emulators
        ;;
    help|*)
        show_help
        ;;
esac
