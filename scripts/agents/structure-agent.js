#!/usr/bin/env node

/**
 * 📁 Structure Agent
 * Handles directory reorganization, file moving, and import updates
 */

const fs = require('fs');
const path = require('path');

class StructureAgent {
  constructor() {
    this.movedFiles = [];
    this.updatedImports = [];
  }

  async createLibSubdirectories() {
    console.log('📁 Creating lib subdirectories...');
    
    const subdirs = [
      'src/lib/services',
      'src/lib/utils', 
      'src/lib/validation',
      'src/lib/business'
    ];
    
    let createdCount = 0;
    for (const dir of subdirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
        createdCount++;
      } else {
        console.log(`  ℹ️  Already exists: ${dir}`);
      }
    }
    
    console.log(`📊 Created ${createdCount} new subdirectories`);
    return createdCount;
  }

  async moveLibFiles() {
    console.log('📦 Moving lib files to appropriate subdirectories...');
    
    const fileMappings = {
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
    
    let movedCount = 0;
    for (const [destDir, files] of Object.entries(fileMappings)) {
      for (const file of files) {
        const sourcePath = path.join('src/lib', file);
        const destPath = path.join(destDir, file);
        
        if (fs.existsSync(sourcePath)) {
          try {
            // Create destination directory if it doesn't exist
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            
            // Move the file
            fs.renameSync(sourcePath, destPath);
            console.log(`  ✅ Moved: ${sourcePath} → ${destPath}`);
            movedCount++;
            this.movedFiles.push({ source: sourcePath, destination: destPath });
          } catch (error) {
            console.log(`  ⚠️  Failed to move ${sourcePath}: ${error.message}`);
          }
        } else {
          console.log(`  ℹ️  File not found: ${sourcePath}`);
        }
      }
    }
    
    console.log(`📊 Moved ${movedCount} files`);
    return movedCount;
  }

  async reorganizeApiRoutes() {
    console.log('📁 Reorganizing API routes by feature...');
    
    const apiMappings = {
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
    
    let movedCount = 0;
    for (const [destDir, files] of Object.entries(apiMappings)) {
      for (const file of files) {
        const sourcePath = path.join('src/app/api', file);
        const destPath = path.join(destDir, file);
        
        if (fs.existsSync(sourcePath)) {
          try {
            // Create destination directory if it doesn't exist
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            
            // Move the file
            fs.renameSync(sourcePath, destPath);
            console.log(`  ✅ Moved: ${sourcePath} → ${destPath}`);
            movedCount++;
          } catch (error) {
            console.log(`  ⚠️  Failed to move ${sourcePath}: ${error.message}`);
          }
        } else {
          console.log(`  ℹ️  File not found: ${sourcePath}`);
        }
      }
    }
    
    console.log(`📊 Moved ${movedCount} API route files`);
    return movedCount;
  }

  async updateImportPaths() {
    console.log('🔄 Updating import paths throughout codebase...');
    
    // This is a simplified version - in practice, you'd need more sophisticated
    // import analysis and replacement logic
    console.log('  ℹ️  Import path updates require manual review');
    console.log('  ℹ️  Consider using a tool like "jscodeshift" for automated refactoring');
    
    return true;
  }

  async createIndexFiles() {
    console.log('📝 Creating index files for organized modules...');
    
    const indexFiles = {
      'src/lib/services/index.ts': `export * from './auth-service';
export * from './booking-service';
export * from './cms-service';
export * from './email-service';
export * from './square-service';
export * from './twilio-service';
export * from './ai-assistant';
export * from './promo-service';
export * from './feedback-service';
export * from './backup-service';
export * from './notification-service';`,
      
      'src/lib/utils/index.ts': `export * from './utils';
export * from './firebase';
export * from './firebase-client';
export * from './firebase-admin';
export * from './firebase-test';
export * from './session-storage';
export * from './test-utils';`,
      
      'src/lib/validation/index.ts': `export * from './booking-validation';
export * from './content-validation';`,
      
      'src/lib/business/index.ts': `export * from './cost-tracking';
export * from './real-cost-tracking';
export * from './settings-service';
export * from './performance-monitor';
export * from './error-monitoring';
export * from './interaction-tracker';
export * from './version-control';
export * from './security';
export * from './confluence-comments';`
    };
    
    let createdCount = 0;
    for (const [filePath, content] of Object.entries(indexFiles)) {
      try {
        // Create directory if it doesn't exist
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        
        // Write the index file
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Created: ${filePath}`);
        createdCount++;
      } catch (error) {
        console.log(`  ⚠️  Failed to create ${filePath}: ${error.message}`);
      }
    }
    
    console.log(`📊 Created ${createdCount} index files`);
    return createdCount;
  }

  async runTask(taskName) {
    console.log(`🚀 Structure Agent: ${taskName}`);
    
    switch (taskName) {
      case 'Create lib subdirectories (services, utils, validation, business)':
        return await this.createLibSubdirectories();
        
      case 'Move lib files to appropriate subdirectories':
        return await this.moveLibFiles();
        
      case 'Reorganize API routes by feature':
        return await this.reorganizeApiRoutes();
        
      case 'Update import paths throughout codebase':
        return await this.updateImportPaths();
        
      case 'Create new index files for organized modules':
        return await this.createIndexFiles();
        
      default:
        console.log(`❌ Unknown task: ${taskName}`);
        return false;
    }
  }
}

async function main() {
  const agent = new StructureAgent();
  
  const task = process.argv.find(arg => arg.startsWith('--task='))?.split('=')[1];
  
  if (!task) {
    console.log('❌ No task specified. Use --task=<taskName>');
    process.exit(1);
  }
  
  try {
    await agent.runTask(task);
    console.log('✅ Structure Agent completed successfully');
  } catch (error) {
    console.error('❌ Structure Agent failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { StructureAgent }; 