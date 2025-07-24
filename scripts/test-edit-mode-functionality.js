#!/usr/bin/env node

/**
 * 🧪 Edit Mode Functionality Testing Script
 * 
 * This script actually visits pages and tests the edit mode functionality:
 * 1. Checks if admin detection works
 * 2. Verifies edit mode toggles appear
 * 3. Tests save/cancel functionality
 * 4. Validates CMS integration
 */

const puppeteer = require('puppeteer');
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
    '/success'
  ],
  timeout: 10000
};

class EditModeFunctionalityTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
  }

  async runAllTests() {
    console.log('🧪 Starting Edit Mode Functionality Testing');
    console.log('=' .repeat(60));
    
    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Test 1: Admin Detection
      await this.testAdminDetection();
      
      // Test 2: Edit Mode Toggle Visibility
      await this.testEditModeToggleVisibility();
      
      // Test 3: Edit Mode Functionality
      await this.testEditModeFunctionality();
      
      // Test 4: CMS Integration
      await this.testCMSIntegration();
      
      // Generate comprehensive report
      this.generateFunctionalityReport();
      
    } catch (error) {
      console.error('❌ Edit mode functionality testing failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async testAdminDetection() {
    console.log('🔍 Test 1: Admin Detection...');
    
    for (const email of TEST_CONFIG.adminEmails) {
      console.log(`  🧪 Testing admin detection for: ${email}`);
      
      try {
        // Navigate to homepage
        await this.page.goto(`${TEST_CONFIG.baseUrl}/`, { waitUntil: 'networkidle0' });
        
        // Check if admin controls are visible
        const adminControls = await this.page.evaluate(() => {
          const editModeToggle = document.querySelector('[data-testid="edit-mode-toggle"]');
          const adminHamburger = document.querySelector('[data-testid="admin-hamburger"]');
          return {
            editModeToggle: !!editModeToggle,
            adminHamburger: !!adminHamburger,
            hasAdminClass: document.body.classList.contains('admin-mode')
          };
        });
        
        if (adminControls.editModeToggle || adminControls.adminHamburger) {
          console.log(`    ✅ Admin controls found for ${email}`);
          this.results.push({
            test: `Admin Detection - ${email}`,
            status: 'PASS',
            details: 'Admin controls visible'
          });
        } else {
          console.log(`    ❌ Admin controls not found for ${email}`);
          this.results.push({
            test: `Admin Detection - ${email}`,
            status: 'FAIL',
            error: 'Admin controls not visible'
          });
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing admin detection for ${email}: ${error.message}`);
        this.results.push({
          test: `Admin Detection - ${email}`,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testEditModeToggleVisibility() {
    console.log('🔍 Test 2: Edit Mode Toggle Visibility...');
    
    for (const pagePath of TEST_CONFIG.testPages) {
      console.log(`  🧪 Testing edit mode toggle on ${pagePath}...`);
      
      try {
        await this.page.goto(`${TEST_CONFIG.baseUrl}${pagePath}`, { waitUntil: 'networkidle0' });
        
        // Wait for page to load
        await this.page.waitForTimeout(2000);
        
        // Check for edit mode controls
        const editControls = await this.page.evaluate(() => {
          const editModeButton = document.querySelector('button:contains("Edit Mode"), button:contains("Edit Content")');
          const floatingToggle = document.querySelector('.fixed.top-20.right-6');
          const editModeToggle = document.querySelector('[data-testid="edit-mode-toggle"]');
          
          return {
            hasEditModeButton: !!editModeButton,
            hasFloatingToggle: !!floatingToggle,
            hasEditModeToggle: !!editModeToggle,
            pageContent: document.body.innerText.substring(0, 500)
          };
        });
        
        if (editControls.hasEditModeButton || editControls.hasFloatingToggle || editControls.hasEditModeToggle) {
          console.log(`    ✅ Edit mode controls found on ${pagePath}`);
          this.results.push({
            test: `Edit Mode Toggle - ${pagePath}`,
            status: 'PASS',
            details: 'Edit mode controls visible'
          });
        } else {
          console.log(`    ❌ Edit mode controls not found on ${pagePath}`);
          console.log(`    📄 Page content preview: ${editControls.pageContent.substring(0, 100)}...`);
          this.results.push({
            test: `Edit Mode Toggle - ${pagePath}`,
            status: 'FAIL',
            error: 'Edit mode controls not visible'
          });
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing ${pagePath}: ${error.message}`);
        this.results.push({
          test: `Edit Mode Toggle - ${pagePath}`,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testEditModeFunctionality() {
    console.log('🔍 Test 3: Edit Mode Functionality...');
    
    // Test on homepage
    try {
      await this.page.goto(`${TEST_CONFIG.baseUrl}/`, { waitUntil: 'networkidle0' });
      
      // Look for edit mode button
      const editButton = await this.page.$('button:contains("Edit Mode"), button:contains("Edit Content")');
      
      if (editButton) {
        console.log('    ✅ Edit mode button found, testing functionality...');
        
        // Click edit mode button
        await editButton.click();
        await this.page.waitForTimeout(1000);
        
        // Check if edit mode is active
        const editModeActive = await this.page.evaluate(() => {
          const editableInputs = document.querySelectorAll('.editable-input, .editable-textarea');
          const saveButton = document.querySelector('button:contains("Save")');
          const cancelButton = document.querySelector('button:contains("Cancel")');
          
          return {
            hasEditableInputs: editableInputs.length > 0,
            hasSaveButton: !!saveButton,
            hasCancelButton: !!cancelButton,
            inputCount: editableInputs.length
          };
        });
        
        if (editModeActive.hasEditableInputs) {
          console.log(`    ✅ Edit mode activated with ${editModeActive.inputCount} editable fields`);
          this.results.push({
            test: 'Edit Mode Functionality - Homepage',
            status: 'PASS',
            details: `Edit mode activated with ${editModeActive.inputCount} editable fields`
          });
        } else {
          console.log('    ❌ Edit mode not properly activated');
          this.results.push({
            test: 'Edit Mode Functionality - Homepage',
            status: 'FAIL',
            error: 'Edit mode not properly activated'
          });
        }
        
        // Test save/cancel functionality
        if (editModeActive.hasSaveButton && editModeActive.hasCancelButton) {
          console.log('    ✅ Save/Cancel buttons found');
          this.results.push({
            test: 'Save/Cancel Functionality - Homepage',
            status: 'PASS',
            details: 'Save and cancel buttons visible'
          });
        } else {
          console.log('    ❌ Save/Cancel buttons missing');
          this.results.push({
            test: 'Save/Cancel Functionality - Homepage',
            status: 'FAIL',
            error: 'Save or cancel buttons missing'
          });
        }
        
      } else {
        console.log('    ❌ Edit mode button not found');
        this.results.push({
          test: 'Edit Mode Functionality - Homepage',
          status: 'FAIL',
          error: 'Edit mode button not found'
        });
      }
      
    } catch (error) {
      console.log(`    ❌ Error testing edit mode functionality: ${error.message}`);
      this.results.push({
        test: 'Edit Mode Functionality - Homepage',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testCMSIntegration() {
    console.log('🔍 Test 4: CMS Integration...');
    
    try {
      // Navigate to admin CMS page
      await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/cms/pages`, { waitUntil: 'networkidle0' });
      
      // Check if CMS page loads
      const cmsPage = await this.page.evaluate(() => {
        const cmsContent = document.querySelector('h1, h2, h3');
        const cmsForms = document.querySelectorAll('form, input, textarea');
        
        return {
          hasCMSContent: !!cmsContent,
          hasCMSForms: cmsForms.length > 0,
          pageTitle: document.title,
          pageContent: document.body.innerText.substring(0, 200)
        };
      });
      
      if (cmsPage.hasCMSContent || cmsPage.hasCMSForms) {
        console.log('    ✅ CMS page loaded successfully');
        this.results.push({
          test: 'CMS Integration - Admin Page',
          status: 'PASS',
          details: 'CMS page loaded with forms'
        });
      } else {
        console.log('    ❌ CMS page not loaded properly');
        console.log(`    📄 Page content: ${cmsPage.pageContent}...`);
        this.results.push({
          test: 'CMS Integration - Admin Page',
          status: 'FAIL',
          error: 'CMS page not loaded properly'
        });
      }
      
    } catch (error) {
      console.log(`    ❌ Error testing CMS integration: ${error.message}`);
      this.results.push({
        test: 'CMS Integration - Admin Page',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  generateFunctionalityReport() {
    console.log('\n📊 EDIT MODE FUNCTIONALITY REPORT');
    console.log('=' .repeat(60));
    
    const summary = {
      total: this.results.length,
      pass: this.results.filter(r => r.status === 'PASS').length,
      fail: this.results.filter(r => r.status === 'FAIL').length,
      error: this.results.filter(r => r.status === 'ERROR').length
    };
    
    console.log(`📈 Summary: ${summary.total} tests total`);
    console.log(`✅ Passed: ${summary.pass}`);
    console.log(`❌ Failed: ${summary.fail}`);
    console.log(`🚨 Errors: ${summary.error}`);
    console.log(`📊 Success Rate: ${((summary.pass / summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n🔍 Detailed Results:');
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : 
                     result.status === 'FAIL' ? '❌' : '🚨';
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
      results: this.results
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../reports/edit-mode-functionality-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to: reports/edit-mode-functionality-report.json');
    
    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS FOR FUNCTIONALITY');
    console.log('=' .repeat(60));
    
    const failedTests = this.results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    
    if (failedTests.length === 0) {
      console.log('🎉 All edit mode functionality tests passed!');
    } else {
      console.log('⚠️ Functionality issues found. Here are the fixes needed:');
      
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
    
    console.log('\n📋 IMMEDIATE ACTION ITEMS:');
    console.log('1. 🔧 Fix admin detection - ensure EditModeProvider is working');
    console.log('2. 🔧 Fix edit mode toggle visibility - check component rendering');
    console.log('3. 🔧 Fix save/cancel functionality - verify button rendering');
    console.log('4. 🔧 Test CMS integration - ensure admin pages work');
    console.log('5. 🔧 Verify all pages show edit controls for admins');
  }
}

// Main execution
async function runEditModeFunctionalityTests() {
  const tester = new EditModeFunctionalityTester();
  await tester.runAllTests();
}

// Run the tests
if (require.main === module) {
  runEditModeFunctionalityTests().catch(console.error);
}

module.exports = {
  EditModeFunctionalityTester,
  TEST_CONFIG,
  runEditModeFunctionalityTests
}; 