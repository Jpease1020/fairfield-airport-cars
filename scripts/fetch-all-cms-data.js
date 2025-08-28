#!/usr/bin/env node

/**
 * Fetch All CMS Data Script
 * 
 * This script fetches ALL data from the CMS collection in Firebase
 * using our consolidated API route.
 * 
 * Usage:
 * node scripts/fetch-all-cms-data.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'http://localhost:3000';

async function fetchAllCMSData() {
  try {
    console.log('🚀 Fetching ALL CMS data from Firebase...');
    console.log(`📡 Using API: ${API_BASE}/api/admin/firebase-data?collection=cms&limit=all`);
    
    const response = await fetch(`${API_BASE}/api/admin/firebase-data?collection=cms&limit=all`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.error}`);
    }
    
    console.log('\n✅ Successfully fetched CMS data!');
    console.log(`📊 Total documents: ${result.count}`);
    console.log(`📄 Documents fetched: ${result.totalFetched}`);
    
    // Display document IDs
    console.log('\n📋 Document IDs found:');
    const documentIds = Object.keys(result.data);
    documentIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });
    
    // Show data structure for key documents
    console.log('\n🔍 Data structure analysis:');
    
    // Check for configuration document
    if (result.data.configuration) {
      console.log('\n📁 Configuration document structure:');
      const configKeys = Object.keys(result.data.configuration);
      configKeys.forEach(key => {
        const value = result.data.configuration[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        const preview = typeof value === 'string' ? value.substring(0, 50) + '...' : 
                       Array.isArray(value) ? `[${value.length} items]` :
                       typeof value === 'object' ? `{${Object.keys(value || {}).length} keys}` : value;
        console.log(`  ${key}: ${type} - ${preview}`);
      });
    }
    
    // Check for page documents
    const pageDocuments = documentIds.filter(id => 
      ['home', 'about', 'contact', 'help', 'privacy', 'terms'].includes(id)
    );
    
    if (pageDocuments.length > 0) {
      console.log('\n📄 Page documents found:');
      pageDocuments.forEach(id => {
        const pageData = result.data[id];
        const keys = Object.keys(pageData || {});
        console.log(`  ${id}: ${keys.length} fields`);
      });
    }
    
    // Check for other documents
    const otherDocuments = documentIds.filter(id => 
      !['configuration', 'home', 'about', 'contact', 'help', 'privacy', 'terms'].includes(id)
    );
    
    if (otherDocuments.length > 0) {
      console.log('\n🔧 Other documents found:');
      otherDocuments.forEach(id => {
        const docData = result.data[id];
        const keys = Object.keys(docData || {});
        console.log(`  ${id}: ${keys.length} fields`);
      });
    }
    
    // Save data to temp file for analysis
    const tempDir = 'temp';
    
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }
    
    const outputFile = `${tempDir}/cms-data-raw.json`;
    writeFileSync(outputFile, JSON.stringify(result.data, null, 2));
    
    console.log(`\n💾 Raw data saved to: ${outputFile}`);
    console.log('\n🎯 Next steps:');
    console.log('  1. Review the data structure above');
    console.log('  2. Check the saved JSON file for detailed analysis');
    console.log('  3. Plan the reorganization into flat page structure');
    
    return result.data;
    
  } catch (error) {
    console.error('❌ Error fetching CMS data:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your dev server is running:');
      console.log('  npm run dev');
    }
    
    process.exit(1);
  }
}

// Run the script
fetchAllCMSData();
