# 🛠️ Scripts Directory

This directory contains utility scripts organized by category for the Fairfield Airport Cars application.

## 📁 Directory Structure

### `/setup/` - Initialization & Setup Scripts
Scripts for setting up the application and admin users.

- **`setup-test-user.js`** - Creates test user accounts
- **`setup-admin-user.js`** - Creates admin user accounts  
- **`setup-admin.js`** - General admin setup utilities
- **`init-cms.js`** - Initializes CMS with default content

### `/cleanup/` - Maintenance & Cleanup Scripts
Scripts for cleaning up code, files, and maintaining code quality.

- **`add-missing-content.js`** - Adds missing content to CMS
- **`add-use-client.js`** - Adds 'use client' directives where needed
- **`cleanup-obsolete-files.js`** - Removes obsolete files
- **`structural-cleanup.js`** - Cleans up file structure
- **`reorganize-layout-design.js`** - Reorganizes layout and design files

### `/testing/` - Testing & Quality Assurance Scripts
Scripts for running tests, checking code quality, and validation.

- **`run-tests.js`** - Runs the complete test suite
- **`test-suite.js`** - Test suite utilities
- **`cleanup-tests.js`** - Cleans up test files
- **`test-analytics.js`** - Tests analytics functionality
- **`test-square-payment-flow.js`** - Tests Square payment integration
- **`check-component-rules.js`** - Validates component rules
- **`check-css-size.js`** - Checks CSS bundle size
- **`enforce-styled-components.js`** - Enforces styled-components usage

### `/deployment/` - Deployment Scripts
Scripts for deploying the application to production.

- **`deploy-production.sh`** - Production deployment script

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

### `/archive/` - Completed or Obsolete Scripts
Scripts that have been completed or are no longer needed.

- **`remove-tailwind.js`** - ✅ Completed - Removed Tailwind CSS
- **`migrate-to-unified-layout.js`** - ✅ Completed - Migrated to unified layout
- **`standardize-all-pages.js`** - ✅ Completed - Standardized all pages
- **`fix-cms-permissions.js`** - ✅ Completed - Fixed CMS permissions
- **`migrate-content-to-cms.js`** - ✅ Completed - Migrated content to CMS
- **`fix-ui-components.js`** - ✅ Completed - Fixed UI components

## 🚀 Quick Start

### Setup Environment
```bash
# Initialize CMS with default content
node scripts/setup/init-cms.js

# Setup admin user
node scripts/setup/setup-admin.js
```

### Run Tests
```bash
# Run complete test suite
node scripts/testing/run-tests.js

# Check component rules
node scripts/testing/check-component-rules.js
```

### Cleanup & Maintenance
```bash
# Add missing content
node scripts/cleanup/add-missing-content.js

# Clean up obsolete files
node scripts/cleanup/cleanup-obsolete-files.js
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

# Setup cron job for daily analysis
bash scripts/setup-cron.sh
```

## 🔧 Configuration

### ESLint Ignore
Scripts are excluded from ESLint checking via `.eslintignore`:
```
scripts/
scripts/**/*
```

### Script Categories
- **Setup**: One-time initialization scripts
- **Cleanup**: Maintenance and code quality scripts  
- **Testing**: Quality assurance and validation scripts
- **Deployment**: Production deployment scripts
- **Monitoring**: Health check and monitoring scripts
- **Archive**: Completed or obsolete scripts

## 📈 Usage Guidelines

### When to Use Each Category

**Setup Scripts**: Use for initial project setup or when adding new environments
**Cleanup Scripts**: Use regularly for code maintenance and quality assurance
**Testing Scripts**: Use before deployments or when making significant changes
**Deployment Scripts**: Use for production deployments
**Monitoring Scripts**: Use for ongoing application health monitoring

### Best Practices

1. **Always backup** before running cleanup scripts
2. **Test in development** before running in production
3. **Review script output** for any errors or warnings
4. **Document changes** made by scripts
5. **Archive completed scripts** to keep the directory clean

## 🚨 Important Notes

- Scripts in `/archive/` are completed and should not be run again
- Always review script contents before running
- Some scripts may require specific environment variables
- Monitor script output for any errors or warnings

---

*Last Updated: January 27, 2025*
*Status: ✅ Organized and Documented* 