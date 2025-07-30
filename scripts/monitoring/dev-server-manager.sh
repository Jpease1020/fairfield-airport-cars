#!/bin/bash

# Dev Server Manager - Prevents caching issues and ensures clean development
# Usage: ./scripts/dev-server-manager.sh [start|stop|restart|clean]

set -e

PORT=3000
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if dev server is running
is_server_running() {
    lsof -ti:$PORT >/dev/null 2>&1
}

# Get server PIDs
get_server_pids() {
    lsof -ti:$PORT 2>/dev/null || echo ""
}

# Stop all dev servers
stop_server() {
    local pids=$(get_server_pids)
    if [ -n "$pids" ]; then
        log_info "Stopping dev server(s) on port $PORT..."
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 1
        log_success "Dev server stopped"
    else
        log_info "No dev server running on port $PORT"
    fi
}

# Clean build cache
clean_cache() {
    log_info "Cleaning build cache..."
    cd "$PROJECT_DIR"
    
    # Remove Next.js cache
    if [ -d ".next" ]; then
        rm -rf .next
        log_success "Removed .next cache"
    fi
    
    # Remove node_modules/.cache if exists
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_success "Removed node_modules cache"
    fi
    
    # Clear npm cache if needed
    # npm cache clean --force
    
    log_success "Cache cleaning complete"
}

# Start dev server
start_server() {
    if is_server_running; then
        log_warning "Dev server already running on port $PORT"
        local pids=$(get_server_pids)
        log_info "Server PIDs: $pids"
        return 1
    fi
    
    log_info "Starting dev server..."
    cd "$PROJECT_DIR"
    
    # Clean cache before starting
    clean_cache
    
    # Start the server
    npm run dev &
    local server_pid=$!
    
    # Wait for server to start
    log_info "Waiting for server to start..."
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if is_server_running; then
            log_success "Dev server started successfully on http://localhost:$PORT"
            log_info "Server PID: $(get_server_pids)"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    log_error "Failed to start dev server"
    return 1
}

# Restart dev server
restart_server() {
    log_info "Restarting dev server..."
    stop_server
    sleep 2
    start_server
}

# Show server status
show_status() {
    if is_server_running; then
        local pids=$(get_server_pids)
        log_success "Dev server is running on port $PORT"
        log_info "Server PIDs: $pids"
        log_info "URL: http://localhost:$PORT"
    else
        log_warning "No dev server running on port $PORT"
    fi
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            start_server
            ;;
        "stop")
            stop_server
            ;;
        "restart")
            restart_server
            ;;
        "clean")
            clean_cache
            ;;
        "status")
            show_status
            ;;
        "kill-all")
            log_info "Killing all Node.js processes..."
            pkill -f "next dev" 2>/dev/null || true
            pkill -f "node.*dev" 2>/dev/null || true
            log_success "All Node.js dev processes killed"
            ;;
        *)
            echo "Usage: $0 [start|stop|restart|clean|status|kill-all]"
            echo ""
            echo "Commands:"
            echo "  start     - Start dev server (with cache cleaning)"
            echo "  stop      - Stop dev server"
            echo "  restart   - Restart dev server (with cache cleaning)"
            echo "  clean     - Clean build cache only"
            echo "  status    - Show server status"
            echo "  kill-all  - Kill all Node.js dev processes"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 