const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin with default credentials
admin.initializeApp({
  projectId: 'fairfield-airport-car-service'
});

const db = admin.firestore();

async function deployCMSToProduction() {
  console.log('🚀 Deploying CMS data to production...');
  
  // Read the cleaned data
  const cleanedData = JSON.parse(fs.readFileSync('./temp/cleaned-emulator-cms-data.json', 'utf8'));
  
  console.log(`📊 Found ${Object.keys(cleanedData).length} CMS documents to deploy`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [docId, data] of Object.entries(cleanedData)) {
    try {
      console.log(`📄 Deploying ${docId}...`);
      
      // Set the document in production Firestore
      await db.collection('cms').doc(docId).set(data);
      
      console.log(`  ✅ ${docId} deployed successfully`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Error deploying ${docId}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Deployment Summary:');
  console.log(`✅ Successfully deployed: ${successCount} documents`);
  console.log(`❌ Failed to deploy: ${errorCount} documents`);
  
  if (successCount > 0) {
    console.log('\n🎉 CMS data deployment completed!');
    console.log('🌐 Check your production website to see the changes.');
  }
  
  process.exit(0);
}

deployCMSToProduction().catch(console.error);
