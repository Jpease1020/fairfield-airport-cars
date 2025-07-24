#!/usr/bin/env node

/**
 * Project Cleanup Script
 * 
 * This script helps reorganize and clean up the project structure:
 * 1. Moves lib files into organized subdirectories
 * 2. Consolidates duplicate components
 * 3. Updates imports
 * 4. Removes unused files
 */

const fs = require('fs');
const path = require('path');

const LIB_REORGANIZATION = {
  'src/lib/services/': [
    'auth-service.ts',
    'booking-service.ts', 
    'cms-service.ts',
    'email-service.ts',
    'square-service.ts',
    'twilio-service.ts',
    'ai-assistant.ts',
    'promo-service.ts',
    'feedback-service.ts',
    'backup-service.ts',
    'notification-service.ts'
  ],
  'src/lib/utils/': [
    'utils.ts',
    'firebase.ts',
    'firebase-client.ts',
    'firebase-admin.ts',
    'firebase-test.ts',
    'session-storage.ts',
    'test-utils.tsx'
  ],
  'src/lib/validation/': [
    'booking-validation.ts',
    'content-validation.ts'
  ],
  'src/lib/business/': [
    'cost-tracking.ts',
    'real-cost-tracking.ts',
    'settings-service.ts',
    'performance-monitor.ts',
    'error-monitoring.ts',
    'interaction-tracker.ts',
    'version-control.ts',
    'security.ts',
    'confluence-comments.ts'
  ]
};

const API_REORGANIZATION = {
  'src/app/api/booking/': [
    'create-booking-server/route.ts',
    'create-booking-simple/route.ts',
    'get-booking/[id]/route.ts',
    'get-bookings-simple/route.ts',
    'cancel-booking/route.ts',
    'check-time-slot/route.ts',
    'estimate-fare/route.ts'
  ],
  'src/app/api/payment/': [
    'create-checkout-session/route.ts',
    'complete-payment/route.ts',
    'square-webhook/route.ts'
  ],
  'src/app/api/notifications/': [
    'send-confirmation/route.ts',
    'send-feedback-request/route.ts',
    'send-reminders/route.ts'
  ],
  'src/app/api/admin/': [
    'ai-assistant/route.ts',
    'analytics/error/route.ts',
    'analytics/interaction/route.ts',
    'analytics/summary/route.ts',
    'cms/pages/route.ts',
    'init-cms/route.ts',
    'promos/[id]/route.ts',
    'promos/route.ts',
    'validate-promo/route.ts'
  ]
};

function createDirectories() {
  console.log('📁 Creating directories...');
  
  // Create lib subdirectories
  Object.keys(LIB_REORGANIZATION).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    }
  });
  
  // Create API subdirectories
  Object.keys(API_REORGANIZATION).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    }
  });
}

function moveFiles() {
  console.log('\n📦 Moving files...');
  
  // Move lib files
  Object.entries(LIB_REORGANIZATION).forEach(([destDir, files]) => {
    files.forEach(file => {
      const sourcePath = path.join('src/lib', file);
      const destPath = path.join(destDir, file);
      
      if (fs.existsSync(sourcePath)) {
        // Create subdirectory if needed
        const destDirPath = path.dirname(destPath);
        if (!fs.existsSync(destDirPath)) {
          fs.mkdirSync(destDirPath, { recursive: true });
        }
        
        fs.renameSync(sourcePath, destPath);
        console.log(`  ✓ Moved ${sourcePath} → ${destPath}`);
      }
    });
  });
  
  // Move API files
  Object.entries(API_REORGANIZATION).forEach(([destDir, files]) => {
    files.forEach(file => {
      const sourcePath = path.join('src/app/api', file);
      const destPath = path.join(destDir, file);
      
      if (fs.existsSync(sourcePath)) {
        // Create subdirectory if needed
        const destDirPath = path.dirname(destPath);
        if (!fs.existsSync(destDirPath)) {
          fs.mkdirSync(destDirPath, { recursive: true });
        }
        
        fs.renameSync(sourcePath, destPath);
        console.log(`  ✓ Moved ${sourcePath} → ${destPath}`);
      }
    });
  });
}

function updateIndexFiles() {
  console.log('\n📝 Updating index files...');
  
  // Create new lib index files
  const libIndexes = {
    'src/lib/services/index.ts': 'export * from "./auth-service";\nexport * from "./booking-service";\nexport * from "./cms-service";\nexport * from "./email-service";\nexport * from "./square-service";\nexport * from "./twilio-service";\nexport * from "./ai-assistant";\nexport * from "./promo-service";\nexport * from "./feedback-service";\nexport * from "./backup-service";\nexport * from "./notification-service";',
    'src/lib/utils/index.ts': 'export * from "./utils";\nexport * from "./firebase";\nexport * from "./firebase-client";\nexport * from "./firebase-admin";\nexport * from "./firebase-test";\nexport * from "./session-storage";\nexport * from "./test-utils";',
    'src/lib/validation/index.ts': 'export * from "./booking-validation";\nexport * from "./content-validation";',
    'src/lib/business/index.ts': 'export * from "./cost-tracking";\nexport * from "./real-cost-tracking";\nexport * from "./settings-service";\nexport * from "./performance-monitor";\nexport * from "./error-monitoring";\nexport * from "./interaction-tracker";\nexport * from "./version-control";\nexport * from "./security";\nexport * from "./confluence-comments";'
  };
  
  Object.entries(libIndexes).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${filePath}`);
  });
}

function cleanupTempFiles() {
  console.log('\n🧹 Cleaning up temporary files...');
  
  const tempFiles = [
    '.next',
    'test-results',
    'playwright-report',
    'reports',
    'tsconfig.tsbuildinfo',
    'firebase-debug.log',
    'pglite-debug.log'
  ];
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`  ✓ Removed ${file}`);
    }
  });
}

function main() {
  console.log('🚀 Starting project cleanup...\n');
  
  try {
    createDirectories();
    moveFiles();
    updateIndexFiles();
    cleanupTempFiles();
    
    console.log('\n✅ Project cleanup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Update imports in your code to use new paths');
    console.log('  2. Run npm run lint to check for any issues');
    console.log('  3. Run npm run test to ensure everything works');
    console.log('  4. Update documentation to reflect new structure');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 