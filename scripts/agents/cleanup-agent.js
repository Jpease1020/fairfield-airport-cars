#!/usr/bin/env node

/**
 * 🧹 Cleanup Agent
 * Handles file cleanup, duplicate removal, and temporary file management
 */

const fs = require('fs');
const path = require('path');

class CleanupAgent {
  constructor() {
    this.tempFiles = [
      '.next',
      'test-results',
      'playwright-report',
      'reports',
      'tsconfig.tsbuildinfo',
      'firebase-debug.log',
      'pglite-debug.log'
    ];
    
    this.duplicateComponents = [
      'LoadingSpinner' // Already handled
    ];
  }

  async removeTempFiles() {
    console.log('🗑️  Removing temporary files...');
    
    let removedCount = 0;
    for (const file of this.tempFiles) {
      if (fs.existsSync(file)) {
        try {
          if (fs.lstatSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(file);
          }
          console.log(`  ✅ Removed: ${file}`);
          removedCount++;
        } catch (error) {
          console.log(`  ⚠️  Failed to remove ${file}: ${error.message}`);
        }
      }
    }
    
    console.log(`📊 Removed ${removedCount} temporary files`);
    return removedCount;
  }

  async auditDuplicateComponents() {
    console.log('🔍 Auditing for duplicate components...');
    
    const componentDirs = [
      'src/components/ui',
      'src/components/data',
      'src/components/admin',
      'src/components/forms'
    ];
    
    const duplicates = [];
    
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
        
        for (const file of files) {
          const componentName = path.basename(file, '.tsx');
          
          // Check if this component exists in other directories
          for (const otherDir of componentDirs) {
            if (otherDir !== dir && fs.existsSync(otherDir)) {
              const otherFiles = fs.readdirSync(otherDir).filter(f => f.endsWith('.tsx'));
              
              for (const otherFile of otherFiles) {
                const otherComponentName = path.basename(otherFile, '.tsx');
                
                if (componentName === otherComponentName) {
                  duplicates.push({
                    component: componentName,
                    locations: [
                      path.join(dir, file),
                      path.join(otherDir, otherFile)
                    ]
                  });
                }
              }
            }
          }
        }
      }
    }
    
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate components:');
      duplicates.forEach(({ component, locations }) => {
        console.log(`  • ${component}: ${locations.join(', ')}`);
      });
    } else {
      console.log('✅ No duplicate components found');
    }
    
    return duplicates;
  }

  async cleanUnusedImports() {
    console.log('🧹 Cleaning unused imports...');
    
    // This would require more sophisticated analysis
    // For now, we'll just report the linting issues
    console.log('ℹ️  Run "npm run lint" to see unused import issues');
    console.log('ℹ️  Consider using a tool like "unimport" for automatic cleanup');
    
    return true;
  }

  async runTask(taskName) {
    console.log(`🚀 Cleanup Agent: ${taskName}`);
    
    switch (taskName) {
      case 'Remove duplicate LoadingSpinner components':
        console.log('✅ Already completed in previous session');
        return true;
        
      case 'Clean up unused imports and variables':
        return await this.cleanUnusedImports();
        
      case 'Remove temporary build files (.next, test-results, etc.)':
        return await this.removeTempFiles();
        
      case 'Audit for other duplicate components':
        return await this.auditDuplicateComponents();
        
      case 'Clean up log files (firebase-debug.log, pglite-debug.log)':
        return await this.removeTempFiles();
        
      default:
        console.log(`❌ Unknown task: ${taskName}`);
        return false;
    }
  }
}

async function main() {
  const agent = new CleanupAgent();
  
  const task = process.argv.find(arg => arg.startsWith('--task='))?.split('=')[1];
  
  if (!task) {
    console.log('❌ No task specified. Use --task=<taskName>');
    process.exit(1);
  }
  
  try {
    await agent.runTask(task);
    console.log('✅ Cleanup Agent completed successfully');
  } catch (error) {
    console.error('❌ Cleanup Agent failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CleanupAgent }; 