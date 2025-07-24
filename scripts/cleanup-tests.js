#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up redundant test files...\n');

// List of files to remove (redundant or replaced by comprehensive test suite)
const filesToRemove = [
  'tests/customer-journey.spec.ts',
  'tests/customer-journey-comprehensive.spec.ts',
  'tests/visual.spec.ts',
  'tests/booking-flow-debug.spec.ts',
  'tests/debug-page-structure.spec.ts',
  'tests/simple-booking-test.spec.ts',
  'tests/visual-regression.spec.ts',
  'tests/component-integration.spec.ts',
  'tests/css-validation.spec.ts',
  'tests/user-journey.spec.ts',
  'tests/e2e/api-simple.spec.ts'
];

// List of files to keep (still useful)
const filesToKeep = [
  'tests/comprehensive-test-suite.spec.ts',
  'tests/api-tests.spec.ts',
  'tests/admin-functionality.spec.ts',
  'tests/commenting-system.spec.ts',
  'tests/customer-pages-optimized.spec.ts',
  'tests/setup.ts'
];

console.log('📋 Files to remove (redundant):');
filesToRemove.forEach(file => {
  console.log(`  ❌ ${file}`);
});

console.log('\n📋 Files to keep:');
filesToKeep.forEach(file => {
  console.log(`  ✅ ${file}`);
});

// Remove redundant files
let removedCount = 0;
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️  Removed: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`⚠️  Could not remove ${file}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  File not found: ${file}`);
  }
});

// Remove empty e2e directory if it exists
const e2eDir = 'tests/e2e';
if (fs.existsSync(e2eDir)) {
  try {
    const e2eFiles = fs.readdirSync(e2eDir);
    if (e2eFiles.length === 0) {
      fs.rmdirSync(e2eDir);
      console.log(`🗑️  Removed empty directory: ${e2eDir}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${e2eDir}: ${error.message}`);
  }
}

console.log(`\n✅ Cleanup complete! Removed ${removedCount} redundant test files.`);
console.log('\n📊 Test Suite Summary:');
console.log('=====================');
console.log('✅ Comprehensive Test Suite: tests/comprehensive-test-suite.spec.ts');
console.log('✅ API Tests: tests/api-tests.spec.ts');
console.log('✅ Admin Functionality: tests/admin-functionality.spec.ts');
console.log('✅ Commenting System: tests/commenting-system.spec.ts');
console.log('✅ Customer Pages: tests/customer-pages-optimized.spec.ts');
console.log('✅ Setup & Mocks: tests/setup.ts, tests/mocks/');

console.log('\n🚀 Run the comprehensive test suite with:');
console.log('   npm run test:comprehensive');
console.log('   npm run test:comprehensive-suite'); 