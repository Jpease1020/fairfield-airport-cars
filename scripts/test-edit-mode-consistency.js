#!/usr/bin/env node

/**
 * 🧪 Edit Mode Consistency Testing Script
 * 
 * This script tests the edit mode functionality across all pages to ensure:
 * 1. Consistent edit mode toggle behavior
 * 2. Standardized save/cancel functionality
 * 3. Proper admin detection
 * 4. Consistent UI patterns
 * 5. Proper CMS integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  adminEmails: ['justin@fairfieldairportcar.com', 'gregg@fairfieldairportcar.com'],
  testPages: [
    '/',
    '/book',
    '/help',
    '/about',
    '/terms',
    '/privacy',
    '/cancel',
    '/success',
    '/feedback/test-booking-123',
    '/booking/test-booking-123',
    '/manage/test-booking-123',
    '/status/test-booking-123'
  ]
};

class EditModeConsistencyTester {
  constructor() {
    this.results = [];
    this.inconsistencies = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Edit Mode Consistency Testing');
    console.log('=' .repeat(60));
    
    try {
      // Test 1: Admin Detection Consistency
      await this.testAdminDetection();
      
      // Test 2: Edit Mode Toggle Consistency
      await this.testEditModeToggle();
      
      // Test 3: Save/Cancel Functionality
      await this.testSaveCancelFunctionality();
      
      // Test 4: UI Pattern Consistency
      await this.testUIPatternConsistency();
      
      // Test 5: CMS Integration
      await this.testCMSIntegration();
      
      // Generate comprehensive report
      this.generateConsistencyReport();
      
    } catch (error) {
      console.error('❌ Edit mode consistency testing failed:', error);
    }
  }

  async testAdminDetection() {
    console.log('🔍 Test 1: Admin Detection Consistency...');
    
    const adminDetectionPatterns = [
      'justin@fairfieldairportcar.com',
      'gregg@fairfieldairportcar.com',
      'justinpease@gmail.com'
    ];
    
    for (const email of adminDetectionPatterns) {
      console.log(`  🧪 Testing admin detection for: ${email}`);
      
      try {
        // Test if admin detection works consistently
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/test-admin-detection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (response.ok) {
          console.log(`    ✅ Admin detection works for ${email}`);
          this.results.push({
            test: `Admin Detection - ${email}`,
            status: 'PASS',
            details: 'Admin detection working correctly'
          });
        } else {
          console.log(`    ❌ Admin detection failed for ${email}`);
          this.results.push({
            test: `Admin Detection - ${email}`,
            status: 'FAIL',
            error: 'Admin detection not working'
          });
        }
      } catch (error) {
        console.log(`    ⚠️ Could not test admin detection for ${email}: ${error.message}`);
        this.results.push({
          test: `Admin Detection - ${email}`,
          status: 'SKIP',
          error: error.message
        });
      }
    }
  }

  async testEditModeToggle() {
    console.log('🔍 Test 2: Edit Mode Toggle Consistency...');
    
    const togglePatterns = [
      { page: '/', expected: 'Floating Edit Mode Toggle' },
      { page: '/book', expected: 'Edit Content button' },
      { page: '/help', expected: 'Edit Content button' },
      { page: '/about', expected: 'Floating Edit Mode Toggle' },
      { page: '/terms', expected: 'Floating Edit Mode Toggle' },
      { page: '/privacy', expected: 'Floating Edit Mode Toggle' },
      { page: '/cancel', expected: 'Floating Edit Mode Toggle' },
      { page: '/success', expected: 'Edit Content button' },
      { page: '/feedback/test-booking-123', expected: 'Floating Edit Mode Toggle' },
      { page: '/booking/test-booking-123', expected: 'Edit Content button' },
      { page: '/manage/test-booking-123', expected: 'Floating Edit Mode Toggle' },
      { page: '/status/test-booking-123', expected: 'Floating Edit Mode Toggle' }
    ];
    
    for (const pattern of togglePatterns) {
      console.log(`  🧪 Testing edit mode toggle on ${pattern.page}...`);
      
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${pattern.page}`);
        const html = await response.text();
        
        // Check for different edit mode patterns
        const hasFloatingToggle = html.includes('Floating Edit Mode Toggle');
        const hasEditContentButton = html.includes('Edit Content');
        const hasExitEditMode = html.includes('Exit Edit Mode');
        
        if (pattern.expected === 'Floating Edit Mode Toggle' && hasFloatingToggle) {
          console.log(`    ✅ Floating toggle found on ${pattern.page}`);
          this.results.push({
            test: `Edit Mode Toggle - ${pattern.page}`,
            status: 'PASS',
            details: 'Floating toggle pattern found'
          });
        } else if (pattern.expected === 'Edit Content button' && hasEditContentButton) {
          console.log(`    ✅ Edit Content button found on ${pattern.page}`);
          this.results.push({
            test: `Edit Mode Toggle - ${pattern.page}`,
            status: 'PASS',
            details: 'Edit Content button pattern found'
          });
        } else {
          console.log(`    ❌ Expected pattern not found on ${pattern.page}`);
          this.inconsistencies.push({
            page: pattern.page,
            expected: pattern.expected,
            found: {
              floatingToggle: hasFloatingToggle,
              editContentButton: hasEditContentButton,
              exitEditMode: hasExitEditMode
            }
          });
          this.results.push({
            test: `Edit Mode Toggle - ${pattern.page}`,
            status: 'FAIL',
            error: `Expected ${pattern.expected} but found different pattern`
          });
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing ${pattern.page}: ${error.message}`);
        this.results.push({
          test: `Edit Mode Toggle - ${pattern.page}`,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  async testSaveCancelFunctionality() {
    console.log('🔍 Test 3: Save/Cancel Functionality...');
    
    const saveCancelPatterns = [
      { page: '/', pattern: 'Save/Cancel buttons in floating toggle' },
      { page: '/book', pattern: 'Save/Cancel buttons in card' },
      { page: '/help', pattern: 'Save/Cancel buttons in card' },
      { page: '/about', pattern: 'Save/Cancel buttons in floating toggle' },
      { page: '/success', pattern: 'Save/Cancel buttons in card' },
      { page: '/booking/test-booking-123', pattern: 'Save/Cancel buttons in floating toggle' }
    ];
    
    for (const pattern of saveCancelPatterns) {
      console.log(`  🧪 Testing save/cancel on ${pattern.page}...`);
      
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${pattern.page}`);
        const html = await response.text();
        
        const hasSaveButton = html.includes('Save') || html.includes('Saving');
        const hasCancelButton = html.includes('Cancel');
        const hasSaveMsg = html.includes('Saved') || html.includes('Failed');
        
        if (hasSaveButton && hasCancelButton) {
          console.log(`    ✅ Save/Cancel functionality found on ${pattern.page}`);
          this.results.push({
            test: `Save/Cancel - ${pattern.page}`,
            status: 'PASS',
            details: 'Save and cancel buttons found'
          });
        } else {
          console.log(`    ❌ Save/Cancel functionality missing on ${pattern.page}`);
          this.results.push({
            test: `Save/Cancel - ${pattern.page}`,
            status: 'FAIL',
            error: 'Save or cancel buttons missing'
          });
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing save/cancel on ${pattern.page}: ${error.message}`);
        this.results.push({
          test: `Save/Cancel - ${pattern.page}`,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  async testUIPatternConsistency() {
    console.log('🔍 Test 4: UI Pattern Consistency...');
    
    const uiPatterns = [
      { pattern: 'editMode.*setEditMode', description: 'Edit mode state management' },
      { pattern: 'localContent.*setLocalContent', description: 'Local content state' },
      { pattern: 'saving.*setSaving', description: 'Saving state management' },
      { pattern: 'saveMsg.*setSaveMsg', description: 'Save message state' },
      { pattern: 'handleFieldChange', description: 'Field change handler' },
      { pattern: 'handleSave', description: 'Save handler' },
      { pattern: 'handleCancel', description: 'Cancel handler' }
    ];
    
    // Check for consistent patterns in page files
    const pageFiles = [
      'src/app/page.tsx',
      'src/app/book/page.tsx',
      'src/app/help/page.tsx',
      'src/app/about/page.tsx',
      'src/app/terms/page.tsx',
      'src/app/privacy/page.tsx',
      'src/app/cancel/page.tsx',
      'src/app/success/page.tsx',
      'src/app/feedback/[id]/page.tsx',
      'src/app/booking/[id]/page.tsx',
      'src/app/manage/[id]/page.tsx',
      'src/app/status/[id]/page.tsx'
    ];
    
    for (const file of pageFiles) {
      console.log(`  🧪 Testing UI patterns in ${file}...`);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of uiPatterns) {
          const regex = new RegExp(pattern.pattern, 'g');
          const matches = content.match(regex);
          
          if (matches && matches.length > 0) {
            console.log(`    ✅ ${pattern.description} found in ${file}`);
            this.results.push({
              test: `UI Pattern - ${pattern.description} in ${file}`,
              status: 'PASS',
              details: `${matches.length} instances found`
            });
          } else {
            console.log(`    ❌ ${pattern.description} missing in ${file}`);
            this.results.push({
              test: `UI Pattern - ${pattern.description} in ${file}`,
              status: 'FAIL',
              error: 'Pattern not found'
            });
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error reading ${file}: ${error.message}`);
        this.results.push({
          test: `UI Pattern - ${file}`,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  async testCMSIntegration() {
    console.log('🔍 Test 5: CMS Integration...');
    
    const cmsPatterns = [
      { pattern: 'useCMS', description: 'CMS hook usage' },
      { pattern: 'cmsConfig', description: 'CMS config access' },
      { pattern: 'cmsService', description: 'CMS service usage' },
      { pattern: 'updateCMSConfiguration', description: 'CMS update function' }
    ];
    
    const pageFiles = [
      'src/app/page.tsx',
      'src/app/book/page.tsx',
      'src/app/help/page.tsx',
      'src/app/about/page.tsx',
      'src/app/terms/page.tsx',
      'src/app/privacy/page.tsx',
      'src/app/cancel/page.tsx',
      'src/app/success/page.tsx',
      'src/app/feedback/[id]/page.tsx',
      'src/app/booking/[id]/page.tsx',
      'src/app/manage/[id]/page.tsx',
      'src/app/status/[id]/page.tsx'
    ];
    
    for (const file of pageFiles) {
      console.log(`  🧪 Testing CMS integration in ${file}...`);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of cmsPatterns) {
          const regex = new RegExp(pattern.pattern, 'g');
          const matches = content.match(regex);
          
          if (matches && matches.length > 0) {
            console.log(`    ✅ ${pattern.description} found in ${file}`);
            this.results.push({
              test: `CMS Integration - ${pattern.description} in ${file}`,
              status: 'PASS',
              details: `${matches.length} instances found`
            });
          } else {
            console.log(`    ❌ ${pattern.description} missing in ${file}`);
            this.results.push({
              test: `CMS Integration - ${pattern.description} in ${file}`,
              status: 'FAIL',
              error: 'CMS integration missing'
            });
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error reading ${file}: ${error.message}`);
        this.results.push({
          test: `CMS Integration - ${file}`,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  generateConsistencyReport() {
    console.log('\n📊 EDIT MODE CONSISTENCY REPORT');
    console.log('=' .repeat(60));
    
    const summary = {
      total: this.results.length,
      pass: this.results.filter(r => r.status === 'PASS').length,
      fail: this.results.filter(r => r.status === 'FAIL').length,
      skip: this.results.filter(r => r.status === 'SKIP').length
    };
    
    console.log(`📈 Summary: ${summary.total} tests total`);
    console.log(`✅ Passed: ${summary.pass}`);
    console.log(`❌ Failed: ${summary.fail}`);
    console.log(`⏭️ Skipped: ${summary.skip}`);
    console.log(`📊 Success Rate: ${((summary.pass / summary.total) * 100).toFixed(1)}%`);
    
    if (this.inconsistencies.length > 0) {
      console.log('\n🚨 INCONSISTENCIES FOUND:');
      this.inconsistencies.forEach((inc, index) => {
        console.log(`${index + 1}. ${inc.page}:`);
        console.log(`   Expected: ${inc.expected}`);
        console.log(`   Found: ${JSON.stringify(inc.found)}`);
      });
    }
    
    console.log('\n🔍 Detailed Results:');
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : 
                     result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${status} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    });
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.results,
      inconsistencies: this.inconsistencies
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../reports/edit-mode-consistency-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to: reports/edit-mode-consistency-report.json');
    
    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS FOR STANDARDIZATION');
    console.log('=' .repeat(60));
    
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    
    if (failedTests.length === 0) {
      console.log('🎉 All edit mode tests passed! The system is consistent.');
    } else {
      console.log('⚠️ Inconsistencies found. Here are the issues to fix:');
      
      // Group failures by type
      const failuresByType = {};
      failedTests.forEach(test => {
        const type = test.test.split(' - ')[0];
        if (!failuresByType[type]) {
          failuresByType[type] = [];
        }
        failuresByType[type].push(test);
      });
      
      Object.entries(failuresByType).forEach(([type, failures]) => {
        console.log(`\n🔧 ${type} Issues:`);
        failures.forEach(failure => {
          console.log(`  ❌ ${failure.test.split(' - ')[1]}: ${failure.error}`);
        });
      });
    }
    
    console.log('\n📋 STANDARDIZATION CHECKLIST:');
    console.log('1. ✅ Admin detection should be consistent across all pages');
    console.log('2. ✅ Edit mode toggle should use same pattern (floating vs inline)');
    console.log('3. ✅ Save/Cancel buttons should have consistent styling');
    console.log('4. ✅ Error handling should be standardized');
    console.log('5. ✅ CMS integration should use same patterns');
    console.log('6. ✅ State management should be consistent');
  }
}

// Main execution
async function runEditModeConsistencyTests() {
  const tester = new EditModeConsistencyTester();
  await tester.runAllTests();
}

// Run the tests
if (require.main === module) {
  runEditModeConsistencyTests().catch(console.error);
}

module.exports = {
  EditModeConsistencyTester,
  TEST_CONFIG,
  runEditModeConsistencyTests
}; 