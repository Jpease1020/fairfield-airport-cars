#!/usr/bin/env node

/**
 * 🔄 Import Path Update Script
 * Updates import paths after file reorganization
 */

const fs = require('fs');
const path = require('path');

// Import path mappings after reorganization
const importMappings = {
  // Services
  '@/lib/auth-service': '@/lib/services/auth-service',
  '@/lib/backup-service': '@/lib/services/backup-service',
  '@/lib/booking-service': '@/lib/services/booking-service',
  '@/lib/cms-service': '@/lib/services/cms-service',
  '@/lib/email-service': '@/lib/services/email-service',
  '@/lib/square-service': '@/lib/services/square-service',
  '@/lib/twilio-service': '@/lib/services/twilio-service',
  '@/lib/ai-assistant': '@/lib/services/ai-assistant',
  '@/lib/promo-service': '@/lib/services/promo-service',
  '@/lib/feedback-service': '@/lib/services/feedback-service',
  '@/lib/notification-service': '@/lib/services/notification-service',
  
  // Utils
  '@/lib/utils/firebase': '@/lib/utils/firebase',
  '@/lib/utils/firebase-test': '@/lib/utils/firebase-test',
  '@/lib/firebase': '@/lib/utils/firebase',
  '@/lib/firebase-client': '@/lib/utils/firebase-client',
  '@/lib/firebase-admin': '@/lib/utils/firebase-admin',
  '@/lib/firebase-test': '@/lib/utils/firebase-test',
  '@/lib/session-storage': '@/lib/utils/session-storage',
  '@/lib/test-utils': '@/lib/utils/test-utils',
  
  // Validation
  '@/lib/booking-validation': '@/lib/validation/booking-validation',
  '@/lib/content-validation': '@/lib/validation/content-validation',
  
  // Business
  '@/lib/cost-tracking': '@/lib/business/cost-tracking',
  '@/lib/real-cost-tracking': '@/lib/business/real-cost-tracking',
  '@/lib/settings-service': '@/lib/business/settings-service',
  '@/lib/performance-monitor': '@/lib/business/performance-monitor',
  '@/lib/error-monitoring': '@/lib/business/error-monitoring',
  '@/lib/interaction-tracker': '@/lib/business/interaction-tracker',
  '@/lib/version-control': '@/lib/business/version-control',
  '@/lib/security': '@/lib/business/security',
  '@/lib/confluence-comments': '@/lib/business/confluence-comments',
  
  // Relative imports
  '../../../lib/auth-service': '../../../lib/services/auth-service',
  '../../../lib/booking-service': '../../../lib/services/booking-service',
  '../../../lib/cms-service': '../../../lib/services/cms-service',
  '../../../lib/backup-service': '../../../lib/services/backup-service',
  '../../../lib/email-service': '../../../lib/services/email-service',
  '../../../lib/square-service': '../../../lib/services/square-service',
  '../../../lib/twilio-service': '../../../lib/services/twilio-service',
  '../../../lib/ai-assistant': '../../../lib/services/ai-assistant',
  '../../../lib/promo-service': '../../../lib/services/promo-service',
  '../../../lib/feedback-service': '../../../lib/services/feedback-service',
  '../../../lib/notification-service': '../../../lib/services/notification-service',
  
  // Firebase imports
  '../../../lib/firebase': '../../../lib/utils/firebase',
  '../../../lib/firebase-client': '../../../lib/utils/firebase-client',
  '../../../lib/firebase-admin': '../../../lib/utils/firebase-admin',
  '../../../lib/firebase-test': '../../../lib/utils/firebase-test',
  '../../../lib/session-storage': '../../../lib/utils/session-storage',
  '../../../lib/test-utils': '../../../lib/utils/test-utils',
  
  // Validation imports
  '../../../lib/booking-validation': '../../../lib/validation/booking-validation',
  '../../../lib/content-validation': '../../../lib/validation/content-validation',
  
  // Business imports
  '../../../lib/cost-tracking': '../../../lib/business/cost-tracking',
  '../../../lib/real-cost-tracking': '../../../lib/business/real-cost-tracking',
  '../../../lib/settings-service': '../../../lib/business/settings-service',
  '../../../lib/performance-monitor': '../../../lib/business/performance-monitor',
  '../../../lib/error-monitoring': '../../../lib/business/error-monitoring',
  '../../../lib/interaction-tracker': '../../../lib/business/interaction-tracker',
  '../../../lib/version-control': '../../../lib/business/version-control',
  '../../../lib/security': '../../../lib/business/security',
  '../../../lib/confluence-comments': '../../../lib/business/confluence-comments'
};

function updateImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  for (const [oldImport, newImport] of Object.entries(importMappings)) {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      updated = true;
      console.log(`  ✅ Updated: ${oldImport} → ${newImport}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

function findAndUpdateFiles(dir) {
  const items = fs.readdirSync(dir);
  let updatedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      updatedCount += findAndUpdateFiles(fullPath);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      if (updateImportsInFile(fullPath)) {
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

async function main() {
  console.log('🔄 Updating import paths after reorganization...');
  
  const directories = ['src', 'tests'];
  let totalUpdated = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`\n📁 Processing ${dir}/...`);
      const updated = findAndUpdateFiles(dir);
      totalUpdated += updated;
      console.log(`  📊 Updated ${updated} files in ${dir}/`);
    }
  }
  
  console.log(`\n✅ Total files updated: ${totalUpdated}`);
  console.log('🔄 Import path update completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateImportsInFile, findAndUpdateFiles }; 