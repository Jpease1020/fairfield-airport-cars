const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔄 UPDATING EMULATOR WITH CLEANED CMS DATA\n');

// Set emulator host
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

// Initialize Firebase Admin for emulator
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: 'fairfield-airport-car-service'
  });
}

const db = admin.firestore();

// Read the cleaned CMS data
const cleanedDataPath = path.join(__dirname, '../temp/cleaned-emulator-cms-data.json');
const cleanedCmsData = JSON.parse(fs.readFileSync(cleanedDataPath, 'utf8'));

// Function to update a single page's data
async function updatePageData(pageName, pageData) {
  try {
    const docRef = db.collection('cms').doc(pageName);
    await docRef.set(pageData);
    
    console.log(`  ✅ ${pageName}: Updated successfully (${Object.keys(pageData).length} fields)`);
    return true;
  } catch (error) {
    console.log(`  ❌ ${pageName}: Error updating - ${error.message}`);
    return false;
  }
}

// Main update function
async function updateAllData() {
  console.log('📤 Updating emulator with cleaned CMS data...\n');
  console.log(`📍 Using Firestore emulator at: localhost:8081`);
  console.log(`📁 Reading cleaned data from: ${cleanedDataPath}\n`);
  
  const results = {
    success: [],
    failed: [],
    totalFields: 0
  };
  
  // Update each section
  for (const [sectionName, sectionData] of Object.entries(cleanedCmsData)) {
    console.log(`📝 Updating section: ${sectionName}`);
    const success = await updatePageData(sectionName, sectionData);
    
    if (success) {
      results.success.push(sectionName);
      results.totalFields += Object.keys(sectionData).length;
    } else {
      results.failed.push(sectionName);
    }
  }
  
  // Display results
  console.log('\n📊 UPDATE RESULTS:');
  console.log(`  ✅ Successful: ${results.success.length} sections`);
  console.log(`  ❌ Failed: ${results.failed.length} sections`);
  console.log(`  📊 Total fields updated: ${results.totalFields}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed sections:');
    results.failed.forEach(section => {
      console.log(`  • ${section}`);
    });
  }
  
  if (results.success.length > 0) {
    console.log('\n🎉 Update completed successfully!');
    console.log('💡 Next steps:');
    console.log('  1. Refresh your browser to see the updated content');
    console.log('  2. Check that all placeholder content is now meaningful');
    console.log('  3. Verify that all cmsId attributes are working properly');
  }
  
  // Save update summary
  const summary = {
    timestamp: new Date().toISOString(),
    successfulSections: results.success,
    failedSections: results.failed,
    totalFields: results.totalFields
  };
  
  const summaryPath = path.join(__dirname, '../temp/emulator-update-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Update summary saved to: ${summaryPath}`);
}

// Run the update
updateAllData().catch(console.error);
