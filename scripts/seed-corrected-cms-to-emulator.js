#!/usr/bin/env node

/**
 * Seed Corrected CMS Data to Firebase Emulator
 * 
 * This script seeds the Firebase emulator with our corrected CMS data:
 * 1. Uses the corrected CMS data with all missing fields added
 * 2. Seeds each section as a separate document
 * 3. Verifies the seeding was successful
 * 
 * Usage:
 * node scripts/seed-corrected-cms-to-emulator.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 SEEDING CORRECTED CMS DATA TO FIREBASE EMULATOR\n');

// Set emulator host to match firebase.json configuration
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

// Initialize Firebase Admin for emulator (no credentials needed for emulator)
if (getApps().length === 0) {
  initializeApp({
    projectId: 'fairfield-airport-car-service'
  });
}

const db = getFirestore();

// Read the corrected CMS data
const cmsDataPath = path.join(__dirname, '../temp/final-cms-data-fixed.json');
let cmsData = {};

if (fs.existsSync(cmsDataPath)) {
  cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));
  console.log('✅ Loaded corrected CMS data');
} else {
  console.log('❌ No corrected CMS data found. Please run add-missing-cms-fields.js first.');
  process.exit(1);
}

// Function to seed a single page's data
async function seedPageData(pageName, pageData) {
  try {
    // Create a document for each page in the 'cms' collection
    const docRef = db.collection('cms').doc(pageName);
    await docRef.set(pageData);
    
    console.log(`  ✅ ${pageName}: Seeded successfully (${Object.keys(pageData).length} fields)`);
    return true;
  } catch (error) {
    console.log(`  ❌ ${pageName}: Error seeding - ${error.message}`);
    return false;
  }
}

// Function to verify seeding
async function verifySeeding() {
  try {
    const snapshot = await db.collection('cms').get();
    const documents = [];
    
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        fieldCount: Object.keys(doc.data()).length
      });
    });
    
    console.log('\n🔍 VERIFICATION RESULTS:');
    console.log(`  📊 Total documents: ${documents.length}`);
    documents.forEach(doc => {
      console.log(`  • ${doc.id}: ${doc.fieldCount} fields`);
    });
    
    return documents;
  } catch (error) {
    console.log(`  ❌ Verification failed: ${error.message}`);
    return [];
  }
}

// Main seeding function
async function seedAllData() {
  console.log('📤 Seeding corrected CMS data to emulator...\n');
  console.log(`📍 Using Firestore emulator at: localhost:8081`);
  console.log(`📁 Reading data from: ${cmsDataPath}\n`);
  
  const results = {
    success: [],
    failed: [],
    totalFields: 0
  };
  
  // Seed each section
  for (const [sectionName, sectionData] of Object.entries(cmsData)) {
    console.log(`📝 Seeding section: ${sectionName}`);
    const success = await seedPageData(sectionName, sectionData);
    
    if (success) {
      results.success.push(sectionName);
      results.totalFields += Object.keys(sectionData).length;
    } else {
      results.failed.push(sectionName);
    }
  }
  
  // Verify seeding
  const verification = await verifySeeding();
  
  // Display results
  console.log('\n📊 SEEDING RESULTS:');
  console.log(`  ✅ Successful: ${results.success.length} sections`);
  console.log(`  ❌ Failed: ${results.failed.length} sections`);
  console.log(`  📊 Total fields seeded: ${results.totalFields}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed sections:');
    results.failed.forEach(section => {
      console.log(`  • ${section}`);
    });
  }
  
  if (results.success.length > 0) {
    console.log('\n🎉 Seeding completed successfully!');
    console.log('💡 Next steps:');
    console.log('  1. Start your dev server: npm run dev');
    console.log('  2. Visit your pages to test CMS content');
    console.log('  3. Check that all cmsId attributes are working');
    console.log('  4. Verify placeholder content is displaying correctly');
  }
  
  // Save seeding summary
  const summary = {
    timestamp: new Date().toISOString(),
    successfulSections: results.success,
    failedSections: results.failed,
    totalFields: results.totalFields,
    verification: verification
  };
  
  const summaryPath = path.join(__dirname, '../temp/emulator-seeding-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Seeding summary saved to: ${summaryPath}`);
}

// Check if emulator is running
async function checkEmulator() {
  try {
    const snapshot = await db.collection('cms').limit(1).get();
    console.log('✅ Firebase emulator is running and accessible');
    return true;
  } catch (error) {
    console.log('❌ Firebase emulator is not running or not accessible');
    console.log('💡 Please start the emulator: firebase emulators:start --only firestore,auth');
    return false;
  }
}

// Main execution
async function main() {
  const isEmulatorRunning = await checkEmulator();
  if (!isEmulatorRunning) {
    process.exit(1);
  }
  
  await seedAllData();
}

main().catch(console.error);
