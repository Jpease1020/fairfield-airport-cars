#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Comprehensive Test Suite...\n');

const tests = [
  {
    name: 'Linting',
    command: 'npm run lint',
    description: 'Code quality and style checks'
  },
  {
    name: 'TypeScript',
    command: 'npm run type-check',
    description: 'Type checking'
  },
  {
    name: 'Unit Tests',
    command: 'npm test',
    description: 'Jest unit tests'
  },
  {
    name: 'Visual Regression',
    command: 'npx playwright test tests/visual-regression.spec.ts',
    description: 'Visual layout and styling tests'
  },
  {
    name: 'Component Integration',
    command: 'npx playwright test tests/component-integration.spec.ts',
    description: 'Component interaction tests'
  },
  {
    name: 'CSS Validation',
    command: 'npx playwright test tests/css-validation.spec.ts',
    description: 'Tailwind CSS class validation'
  },
  {
    name: 'User Journey',
    command: 'npx playwright test tests/user-journey.spec.ts',
    description: 'Complete user flow tests'
  },
  {
    name: 'Build Test',
    command: 'npm run build',
    description: 'Production build verification'
  }
];

let passedTests = 0;
let failedTests = 0;
const results = [];

for (const test of tests) {
  console.log(`\n🔍 Running: ${test.name}`);
  console.log(`📝 ${test.description}`);
  
  try {
    execSync(test.command, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    console.log(`✅ ${test.name} - PASSED`);
    passedTests++;
    results.push({ name: test.name, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    console.log(`Error: ${error.message}`);
    failedTests++;
    results.push({ name: test.name, status: 'FAILED', error: error.message });
  }
}

console.log('\n📊 Test Results Summary:');
console.log('========================');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / tests.length) * 100)}%`);

console.log('\n📋 Detailed Results:');
results.forEach(result => {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.status}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

if (failedTests > 0) {
  console.log('\n🚨 Some tests failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! The application is ready for deployment.');
} 