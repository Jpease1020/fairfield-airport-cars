#!/usr/bin/env node

/**
 * Update Production Firebase with Corrected CMS Data
 * 
 * This script updates production Firebase with the corrected CMS data.
 * Since cmsIds have been cleaned up and may not match production,
 * this script will completely replace the CMS data.
 * 
 * Usage:
 * node scripts/update-production-firebase-cms.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 UPDATING PRODUCTION FIREBASE WITH CORRECTED CMS DATA\n');

// Read the corrected CMS data
const cmsDataPath = path.join(__dirname, '../temp/final-cms-data-fixed.json');
let cmsData = {};

if (fs.existsSync(cmsDataPath)) {
  cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));
  console.log('✅ Loaded corrected CMS data');
} else {
  console.log('❌ No corrected CMS data found. Please run the CMS alignment scripts first.');
  process.exit(1);
}

// Initialize Firebase Admin for production
async function initializeFirebaseAdmin() {
  try {
    // Check for production credentials
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Production Firebase credentials not found. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
    }

    console.log('🚀 Initializing Firebase Admin for production...');
    
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    const db = getFirestore(app);
    console.log('✅ Firebase Admin initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

async function updateProductionCMSData() {
  try {
    const db = await initializeFirebaseAdmin();
    
    console.log('🚀 Updating production Firebase CMS data...');
    
    // Update each section as a separate document
    const sections = Object.keys(cmsData);
    let successCount = 0;
    let errorCount = 0;
    
    for (const sectionName of sections) {
      try {
        console.log(`📝 Updating section: ${sectionName}`);
        
        const docRef = db.collection('cms').doc(sectionName);
        await docRef.set(cmsData[sectionName], { merge: false }); // Complete replacement
        
        console.log(`  ✅ ${sectionName} updated successfully`);
        successCount++;
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`  ❌ Error updating ${sectionName}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 PRODUCTION FIREBASE UPDATE COMPLETE:`);
    console.log(`  ✅ Successful updates: ${successCount}`);
    console.log(`  ❌ Failed updates: ${errorCount}`);
    console.log(`  📁 Total sections: ${sections.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Production Firebase CMS data has been updated!');
      console.log('💡 Next steps:');
      console.log('  1. Test your production application to ensure all CMS fields are working');
      console.log('  2. Verify that all cmsId attributes are properly aligned');
      console.log('  3. Check that all content is displaying correctly');
    }
    
    // Save update summary
    const summary = {
      timestamp: new Date().toISOString(),
      successfulUpdates: successCount,
      failedUpdates: errorCount,
      totalSections: sections.length,
      sections: sections
    };
    
    const summaryPath = path.join(__dirname, '../temp/production-update-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 Update summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error('❌ Failed to update production Firebase:', error.message);
    process.exit(1);
  }
}

// Run the update
updateProductionCMSData();
