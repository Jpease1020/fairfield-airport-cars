#!/usr/bin/env node

// 5-minute smoke test for critical functionality
// Run this before any deployment

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        console.log(`✅ ${path} - ${res.statusCode}`);
        resolve();
      } else {
        console.log(`❌ ${path} - Expected ${expectedStatus}, got ${res.statusCode}`);
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`❌ ${path} - ${err.message}`);
      reject(err);
    });
  });
}

async function runSmokeTests() {
  console.log('🚀 Running smoke tests...\n');
  
  const tests = [
    { path: '/', name: 'Homepage' },
    { path: '/book', name: 'Booking Form' },
    { path: '/help', name: 'Help Page' },
    { path: '/admin', name: 'Admin Login' },
    { path: '/api/estimate-fare', name: 'Fare API', expectedStatus: 400 }, // Should return 400 without params
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await testEndpoint(test.path, test.expectedStatus);
      passed++;
    } catch (error) {
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the application.');
    process.exit(1);
  }
}

runSmokeTests().catch(console.error); 