#!/usr/bin/env node

/**
 * Update Firebase with Corrected CMS Data Script
 * 
 * This script updates Firebase with the corrected CMS data:
 * 1. Reads the corrected CMS data
 * 2. Updates Firebase via API
 * 3. Verifies the update was successful
 * 
 * Usage:
 * node scripts/update-firebase-with-corrected-cms.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 UPDATING FIREBASE WITH CORRECTED CMS DATA\n');

// Read the corrected CMS data
const cmsDataPath = path.join(__dirname, '../temp/cms-data-with-missing-fields.json');
let cmsData = {};

if (fs.existsSync(cmsDataPath)) {
  cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));
  console.log('✅ Loaded corrected CMS data');
} else {
  console.log('❌ No corrected CMS data found. Please run add-missing-cms-fields.js first.');
  process.exit(1);
}

const API_BASE = 'http://localhost:3000';

async function updateFirebaseCMSData() {
  try {
    console.log('🚀 Updating Firebase CMS data...');
    
    // Update each section as a separate document
    const sections = Object.keys(cmsData);
    let successCount = 0;
    let errorCount = 0;
    
    for (const sectionName of sections) {
      try {
        console.log(`📝 Updating section: ${sectionName}`);
        
        const response = await fetch(`${API_BASE}/api/admin/firebase-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: 'cms',
            documentId: sectionName,
            data: cmsData[sectionName],
            action: 'update'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`  ✅ ${sectionName} updated successfully`);
            successCount++;
          } else {
            console.log(`  ❌ ${sectionName} update failed: ${result.error}`);
            errorCount++;
          }
        } else {
          console.log(`  ❌ ${sectionName} update failed: ${response.status} ${response.statusText}`);
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`  ❌ Error updating ${sectionName}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 FIREBASE UPDATE COMPLETE:`);
    console.log(`  ✅ Successful updates: ${successCount}`);
    console.log(`  ❌ Failed updates: ${errorCount}`);
    console.log(`  📁 Total sections: ${sections.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Firebase CMS data has been updated!');
      console.log('💡 Next steps:');
      console.log('  1. Test your application to ensure all CMS fields are working');
      console.log('  2. Check that all cmsId attributes are properly aligned');
      console.log('  3. Review and update placeholder content with real content');
    }
    
    // Save update summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalSections: sections.length,
      successfulUpdates: successCount,
      failedUpdates: errorCount,
      sections: sections
    };
    
    const summaryPath = path.join(__dirname, '../temp/firebase-update-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Update summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error('❌ Error updating Firebase:', error.message);
    process.exit(1);
  }
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
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
  
  await updateFirebaseCMSData();
}

main();
