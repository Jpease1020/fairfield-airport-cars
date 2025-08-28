# 🚀 Scripts Directory - Fairfield Airport Cars

This directory contains utility scripts for development, testing, and maintenance.

## 📁 Directory Structure

### `/` - Root Scripts
Core scripts for development and maintenance.

- **`fetch-all-cms-data.js`** - 🚀 **MAIN TOOL** - Fetches all CMS data from Firebase
- **`FIREBASE_DATA_FETCHING.md`** - 📖 Documentation for Firebase data fetching
- **`eslint-automation.js`** - ESLint automation and rule enforcement
- **`firebase-rules-sync.sh`** - Syncs Firebase security rules
- **`setup-push-notifications.sh`** - Sets up push notification configuration

### `/eslint-rules/` - ESLint Configuration
Custom ESLint rules and configurations.

- **`architecture-guardrails.js`** - Enforces architectural patterns
- **`design-system-guard.sh`** - Protects design system integrity
- **`enforce-styled-components.js`** - Enforces styled-components usage

### `/monitoring/` - Monitoring & Health Check Scripts
Scripts for monitoring application health and performance.

- **`monitor-agents.js`** - Monitors AI agents
- **`monitor-cursor-agents-progress.js`** - Tracks agent progress
- **`monitor-processes.js`** - Monitors running processes
- **`monitor-app.js`** - Monitors application health
- **`health-check.js`** - Performs health checks
- **`smoke-test.js`** - Runs smoke tests
- **`dev-server-manager.sh`** - Manages development server
- **`dev-server.sh`** - Starts development server
- **`check-dev-status.sh`** - Checks development environment status

## 🚀 Quick Start

### Fetch All CMS Data (Main Use Case)
```bash
# Start dev server first
npm run dev

# Fetch ALL CMS data from Firebase
node scripts/fetch-all-cms-data.js
```

### Run Tests
```bash
# Run complete test suite
npm test

# Check component rules
node scripts/eslint-rules/check-component-rules.js
```

### Monitor Application
```bash
# Check development status
bash scripts/monitoring/check-dev-status.sh

# Run health check
node scripts/monitoring/health-check.js
```

## 📊 Daily Analysis System

The daily analysis system provides comprehensive analysis of the application:

```bash
# Run daily analysis
node scripts/daily-analysis.js
```

## 🔧 Maintenance

### ESLint Automation
```bash
# Run ESLint automation
node scripts/eslint-automation.js
```

### Firebase Rules Sync
```bash
# Sync Firebase security rules
bash scripts/firebase-rules-sync.sh
```

## 📝 Notes

- **`fetch-all-cms-data.js`** is the primary tool for getting CMS data from Firebase
- All scripts require the development server to be running (`npm run dev`)
- The consolidated Firebase data route (`/api/admin/firebase-data`) handles all data fetching
- Empty/unused directories have been cleaned up for simplicity

---

*Last Updated: January 27, 2025*
*Status: ✅ Cleaned Up & Consolidated* 