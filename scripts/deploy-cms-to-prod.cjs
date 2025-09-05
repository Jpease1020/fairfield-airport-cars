const admin = require('firebase-admin');
const fs = require('fs');

// Configuration
const PRODUCTION_PROJECT_ID = 'fairfield-airport-car-service';
const EMULATOR_PROJECT_ID = 'fairfield-airport-car-service';

async function deployCMSToProduction() {
  try {
    console.log('🚀 Starting CMS data deployment to production...');
    
    // Initialize Firebase Admin for production
    if (admin.apps.length === 0) {
      // Use default credentials (service account key file or ADC)
      admin.initializeApp({
        projectId: PRODUCTION_PROJECT_ID
      });
    }
    
    const db = admin.firestore();
    
    // Read the cleaned CMS data from emulator
    console.log('📖 Reading cleaned CMS data from emulator...');
    const emulatorData = JSON.parse(fs.readFileSync('./temp/cleaned-emulator-cms-data.json', 'utf8'));
    
    console.log(`📊 Found ${Object.keys(emulatorData).length} CMS documents to deploy`);
    
    // Deploy each document to production
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const [docId, data] of Object.entries(emulatorData)) {
      try {
        console.log(`📄 Deploying ${docId}...`);
        
        // Add metadata
        const documentData = {
          ...data,
          deployedAt: admin.firestore.FieldValue.serverTimestamp(),
          deployedFrom: 'emulator-cleanup'
        };
        
        await db.collection('cms').doc(docId).set(documentData, { merge: true });
        console.log(`  ✅ ${docId} deployed successfully`);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Error deploying ${docId}:`, error.message);
        errors.push({ docId, error: error.message });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 Deployment Summary:');
    console.log(`✅ Successfully deployed: ${successCount} documents`);
    console.log(`❌ Failed to deploy: ${errorCount} documents`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ docId, error }) => {
        console.log(`  ${docId}: ${error}`);
      });
    }
    
    if (successCount > 0) {
      console.log('\n🎉 CMS data successfully deployed to production!');
      console.log('🔍 You can verify the deployment in the Firebase Console:');
      console.log(`   https://console.firebase.google.com/project/${PRODUCTION_PROJECT_ID}/firestore/data`);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Safety check
console.log('⚠️  WARNING: This will deploy data to PRODUCTION database!');
console.log('📋 Make sure you have:');
console.log('   1. Valid Firebase service account credentials');
console.log('   2. Proper permissions for the production project');
console.log('   3. Backed up any existing production data');
console.log('');

// Uncomment the line below to run the deployment
deployCMSToProduction().then(() => process.exit(0));

console.log('🚀 Deployment enabled - running now...');
