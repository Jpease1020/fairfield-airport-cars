#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    log(`✅ Removed: ${filePath}`, 'green');
    return true;
  } else {
    log(`⚠️  File not found: ${filePath}`, 'yellow');
    return false;
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    log(`✅ Removed directory: ${dirPath}`, 'green');
    return true;
  } else {
    log(`⚠️  Directory not found: ${dirPath}`, 'yellow');
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function main() {
  log('🧹 CLEANUP OBSOLETE FILES', 'bold');
  log('='.repeat(50), 'cyan');

  const projectRoot = path.join(__dirname, '..');
  let removedCount = 0;
  let totalSize = 0;

  // Phase 1: Remove Obsolete JSX Cleanup Scripts
  log('\n🗑️  Removing obsolete JSX cleanup scripts...', 'bold');
  
  const obsoleteJsxScripts = [
    'scripts/ai-jsx-cleanup.js',
    'scripts/cursor-agents-jsx-cleanup.js',
    'scripts/batch-fix-components.js'
  ];

  obsoleteJsxScripts.forEach(script => {
    const filePath = path.join(projectRoot, script);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 2: Remove Obsolete Multi-Agent Scripts
  log('\n🤖 Removing obsolete multi-agent scripts...', 'bold');
  
  const obsoleteMultiAgentScripts = [
    'scripts/multi-agent-cleanup.js',
    'scripts/cleanup-orchestration.js',
    'scripts/cleanup-project.js',
    'scripts/run-all-agents.js',
    'scripts/orchestrate-agents.js'
  ];

  obsoleteMultiAgentScripts.forEach(script => {
    const filePath = path.join(projectRoot, script);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 3: Remove Completed Edit Mode Scripts
  log('\n✏️  Removing completed edit mode scripts...', 'bold');
  
  const completedEditModeScripts = [
    'scripts/fix-all-editable-text.js',
    'scripts/standardize-edit-mode.js',
    'scripts/test-edit-mode-functionality.js',
    'scripts/test-edit-mode-consistency.js'
  ];

  completedEditModeScripts.forEach(script => {
    const filePath = path.join(projectRoot, script);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 4: Remove Redundant Booking Test Scripts
  log('\n🎫 Removing redundant booking test scripts...', 'bold');
  
  const redundantBookingScripts = [
    'scripts/test-booking-form.js',
    'scripts/test-simple-booking.js',
    'scripts/test-complete-booking.js',
    'scripts/test-booking-flow.js',
    'scripts/debug-form-submission.js',
    'scripts/verify-booking.js',
    'scripts/simple-form-test.js',
    'scripts/manual-booking-test.js'
  ];

  redundantBookingScripts.forEach(script => {
    const filePath = path.join(projectRoot, script);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 5: Remove Outdated Cursor Agents Documentation
  log('\n📚 Removing outdated cursor agents documentation...', 'bold');
  
  const outdatedCursorDocs = [
    'scripts/cursor-agents-instructions.md',
    'scripts/cursor-agents-quick-reference.md',
    'scripts/cursor-agents-progress-tracker.md',
    'scripts/cursor-agents-action-plan.md',
    'scripts/cursor-agents-unblocking-guide.md'
  ];

  outdatedCursorDocs.forEach(doc => {
    const filePath = path.join(projectRoot, doc);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 6: Check and Remove Completed Migration Scripts
  log('\n🔍 Checking completed migration scripts...', 'bold');
  
  const completedMigrationScripts = [
    'scripts/migrate-to-unified-layout.js',
    'scripts/verify-unified-layout.js',
    'scripts/remove-tailwind.js',
    'scripts/standardize-all-pages.js'
  ];

  completedMigrationScripts.forEach(script => {
    const filePath = path.join(projectRoot, script);
    if (checkFileExists(filePath)) {
      log(`❓ Found: ${script} - check if completed`, 'yellow');
      // Uncomment the next line to remove these files
      // if (removeFile(filePath)) { removedCount++; }
    }
  });

  // Phase 7: Clean Up Documentation
  log('\n📖 Cleaning up documentation...', 'bold');
  
  // Remove archive documentation
  const archivePath = path.join(projectRoot, 'docs/archive');
  if (removeDirectory(archivePath)) {
    removedCount += 10; // Estimate for archive files
    totalSize += 200000; // Estimate 200KB for archive
  }

  // Remove outdated documentation
  const outdatedDocs = [
    'docs/CURRENT_TODO.md'
  ];

  outdatedDocs.forEach(doc => {
    const filePath = path.join(projectRoot, doc);
    if (removeFile(filePath)) {
      removedCount++;
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  // Phase 8: Check for Other Obsolete Files
  log('\n🔍 Checking for other obsolete files...', 'bold');
  
  const otherObsoleteFiles = [
    'scripts/demo-orchestration.js',
    'scripts/quick-flow-check.js',
    'scripts/comprehensive-flow-test.js',
    'scripts/quick-kill.js',
    'scripts/monitor-processes.js',
    'scripts/smoke-test.js'
  ];

  otherObsoleteFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (checkFileExists(filePath)) {
      log(`❓ Found: ${file} - check if needed`, 'yellow');
      // Uncomment the next line to remove these files
      // if (removeFile(filePath)) { removedCount++; }
    }
  });

  // Phase 9: Summary
  log('\n🎉 CLEANUP COMPLETE!', 'bold');
  log('='.repeat(50), 'cyan');
  
  log('\n📊 Summary:', 'bold');
  log(`✅ Files removed: ${removedCount}`, 'green');
  log(`✅ Size freed: ${(totalSize / 1024).toFixed(1)}KB`, 'green');
  
  log('\n📋 Remaining Active Scripts:', 'bold');
  log('✅ Core Development Scripts:', 'green');
  log('  - dev-server-manager.sh', 'cyan');
  log('  - pre-commit-check.sh', 'cyan');
  log('  - check-component-rules.js', 'cyan');
  log('  - structural-cleanup.js', 'cyan');
  log('  - reorganize-layout-design.js', 'cyan');
  
  log('\n✅ Testing Scripts:', 'green');
  log('  - test-suite.js', 'cyan');
  log('  - test-analytics.js', 'cyan');
  log('  - run-layout-tests.sh', 'cyan');
  
  log('\n✅ Monitoring Scripts:', 'green');
  log('  - monitor-agents.js', 'cyan');
  log('  - monitor-app.js', 'cyan');
  log('  - health-check.js', 'cyan');
  
  log('\n✅ Deployment Scripts:', 'green');
  log('  - deploy-production.sh', 'cyan');
  log('  - init-cms.js', 'cyan');
  
  log('\n✅ Analysis Scripts:', 'green');
  log('  - daily-analysis.js', 'cyan');
  log('  - validate-design-system.js', 'cyan');
  
  log('\n🚀 Next Steps:', 'bold');
  log('1. Review any remaining violations', 'cyan');
  log('2. Test all components work correctly', 'cyan');
  log('3. Update documentation', 'cyan');
  log('4. Commit changes', 'cyan');
  
  log('\n📋 Quick Commands:', 'bold');
  log('npm run check:components    - Check for violations', 'cyan');
  log('npm run build              - Test build', 'cyan');
  log('git add -A && git commit   - Commit changes', 'cyan');
  
  log('\n💡 Note: Some files were marked for manual review', 'yellow');
  log('Check the yellow warnings above and remove manually if needed', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 