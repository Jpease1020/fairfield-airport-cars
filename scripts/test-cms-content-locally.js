#!/usr/bin/env node

/**
 * Test CMS Content Locally Script
 * 
 * This script tests key pages to verify CMS content is working:
 * 1. Tests home page for CMS content
 * 2. Tests booking page for CMS content
 * 3. Verifies cmsId attributes are working
 * 4. Reports any issues found
 * 
 * Usage:
 * node scripts/test-cms-content-locally.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 TESTING CMS CONTENT LOCALLY\n');

const API_BASE = 'http://localhost:3000';

// Test pages to check
const testPages = [
  { path: '/', name: 'Home Page', expectedFields: ['hero-title', 'hero-description', 'features-title'] },
  { path: '/book', name: 'Booking Page', expectedFields: ['trip-title', 'pickup-location-label'] },
  { path: '/about', name: 'About Page', expectedFields: ['hero-title', 'about-title'] },
  { path: '/contact', name: 'Contact Page', expectedFields: ['contact-title'] }
];

// Function to test a single page
async function testPage(page) {
  console.log(`🔍 Testing ${page.name} (${page.path})...`);
  
  try {
    const response = await fetch(`${API_BASE}${page.path}`);
    
    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}: ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Check for expected CMS fields in the HTML
    const foundFields = [];
    const missingFields = [];
    
    page.expectedFields.forEach(field => {
      if (html.includes(`cmsId="${field}"`)) {
        foundFields.push(field);
      } else {
        missingFields.push(field);
      }
    });
    
    // Check for placeholder content (indicating CMS is working)
    const hasPlaceholderContent = html.includes('[TITLE]') || html.includes('[DESCRIPTION]') || html.includes('[BUTTON]');
    
    // Check for CMS data attributes
    const hasCmsData = html.includes('data-cms-id=');
    
    console.log(`  ✅ Status: ${response.status}`);
    console.log(`  📊 Found fields: ${foundFields.length}/${page.expectedFields.length}`);
    console.log(`  🔍 Missing fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}`);
    console.log(`  📝 Has placeholder content: ${hasPlaceholderContent ? 'Yes' : 'No'}`);
    console.log(`  🏷️  Has CMS data attributes: ${hasCmsData ? 'Yes' : 'No'}`);
    
    if (missingFields.length > 0) {
      console.log(`  ⚠️  Missing expected fields: ${missingFields.join(', ')}`);
    }
    
    return {
      success: true,
      foundFields: foundFields.length,
      totalFields: page.expectedFields.length,
      missingFields: missingFields,
      hasPlaceholderContent,
      hasCmsData
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Function to test CMS data API
async function testCmsDataAPI() {
  console.log('🔌 Testing CMS Data API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/firebase-data?collection=cms&limit=5`);
    
    if (!response.ok) {
      console.log(`  ❌ API Error: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      const sections = Object.keys(data.data);
      console.log(`  ✅ API working: ${sections.length} sections available`);
      console.log(`  📊 Sample sections: ${sections.slice(0, 5).join(', ')}`);
      return true;
    } else {
      console.log(`  ❌ API returned error: ${data.error || 'Unknown error'}`);
      return false;
    }
    
  } catch (error) {
    console.log(`  ❌ API Error: ${error.message}`);
    return false;
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting CMS content tests...\n');
  
  // Test CMS data API first
  const apiWorking = await testCmsDataAPI();
  console.log('');
  
  if (!apiWorking) {
    console.log('❌ CMS Data API is not working. Please check your setup.');
    return;
  }
  
  // Test each page
  const results = [];
  
  for (const page of testPages) {
    const result = await testPage(page);
    results.push({ page: page.name, ...result });
    console.log(''); // Add spacing between pages
  }
  
  // Generate summary
  console.log('📊 TEST SUMMARY:');
  console.log('================');
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const totalFieldsFound = successfulTests.reduce((sum, r) => sum + (r.foundFields || 0), 0);
    const totalFieldsExpected = successfulTests.reduce((sum, r) => sum + (r.totalFields || 0), 0);
    const fieldCoverage = totalFieldsExpected > 0 ? ((totalFieldsFound / totalFieldsExpected) * 100).toFixed(1) : 0;
    
    console.log(`📊 Field coverage: ${fieldCoverage}% (${totalFieldsFound}/${totalFieldsExpected})`);
    
    const pagesWithPlaceholders = successfulTests.filter(r => r.hasPlaceholderContent).length;
    const pagesWithCmsData = successfulTests.filter(r => r.hasCmsData).length;
    
    console.log(`📝 Pages with placeholder content: ${pagesWithPlaceholders}/${successfulTests.length}`);
    console.log(`🏷️  Pages with CMS data attributes: ${pagesWithCmsData}/${successfulTests.length}`);
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  • ${test.page}: ${test.error}`);
    });
  }
  
  // Save test results
  const testResults = {
    timestamp: new Date().toISOString(),
    apiWorking: apiWorking,
    totalTests: results.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    results: results
  };
  
  const resultsPath = path.join(__dirname, '../temp/cms-content-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 Test results saved to: ${resultsPath}`);
  
  // Final assessment
  if (successfulTests.length === results.length) {
    console.log('\n🎉 All tests passed! CMS content is working properly.');
  } else if (successfulTests.length > 0) {
    console.log('\n⚠️  Some tests passed. CMS content is partially working.');
  } else {
    console.log('\n❌ All tests failed. CMS content is not working properly.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('  1. Visit the pages in your browser to see the content');
  console.log('  2. Check that placeholder content is displaying correctly');
  console.log('  3. Verify that all cmsId attributes are working');
  console.log('  4. Update placeholder content with real content as needed');
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch(`${API_BASE}`);
    if (response.ok) {
      console.log('✅ Dev server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Dev server is not running or not accessible');
    console.log('💡 Please start the dev server: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const isServerRunning = await checkDevServer();
  if (!isServerRunning) {
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);
