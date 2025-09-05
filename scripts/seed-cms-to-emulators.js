import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cleanCMSData } from '../src/lib/utils/cms-cleanup.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 SEEDING CMS DATA TO FIREBASE EMULATORS\n');

// Set emulator host to match firebase.json configuration
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

// Initialize Firebase Admin for emulator (no credentials needed for emulator)
if (getApps().length === 0) {
  initializeApp({
    projectId: 'fairfield-airport-car-service'
  });
}

const db = getFirestore();

// Read the finalized CMS data
const cmsDataPath = path.join(__dirname, '..', 'data', 'cms-data-backup.json');
const rawCmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));

// Clean the CMS data to remove malformed strings
console.log('🧹 Cleaning CMS data to remove malformed strings...');
const cmsData = cleanCMSData(rawCmsData);

// Function to seed a single page's data
async function seedPageData(pageName, pageData) {
  try {
    // Create a document for each page in the 'cms' collection
    const docRef = db.collection('cms').doc(pageName);
    await docRef.set(pageData);
    
    console.log(`  ✅ ${pageName}: Seeded successfully`);
    return true;
  } catch (error) {
    console.log(`  ❌ ${pageName}: Error seeding - ${error.message}`);
    return false;
  }
}

// Main seeding function
async function seedAllData() {
  console.log('📤 Seeding CMS data to emulators...\n');
  console.log(`📍 Using Firestore emulator at: localhost:8081`);
  console.log(`📁 Reading data from: ${cmsDataPath}\n`);
  
  const results = {
    success: [],
    failed: []
  };

  // Seed each page's data
  for (const [pageName, pageData] of Object.entries(cmsData)) {
    const success = await seedPageData(pageName, pageData);
    
    if (success) {
      results.success.push(pageName);
    } else {
      results.failed.push(pageName);
    }
    
    // Small delay to avoid overwhelming the emulator
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n🎉 SEEDING COMPLETE!');
  console.log(`📊 Results:`);
  console.log(`  ✅ Successfully seeded: ${results.success.length} pages`);
  console.log(`  ❌ Failed to seed: ${results.failed.length} pages`);
  
  if (results.success.length > 0) {
    console.log('\n✅ Successfully seeded pages:');
    results.success.forEach(page => console.log(`  • ${page}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed to seed pages:');
    results.failed.forEach(page => console.log(`  • ${page}`));
  }

  return results;
}

// Run the seeding
seedAllData().catch(console.error);
