const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying CMS data to production using Firebase CLI...');

// Read the cleaned data
const cleanedData = JSON.parse(fs.readFileSync('./temp/cleaned-emulator-cms-data.json', 'utf8'));

console.log(`📊 Found ${Object.keys(cleanedData).length} CMS documents to deploy`);

// Deploy each document using Firebase CLI
let successCount = 0;
let errorCount = 0;

for (const [docId, data] of Object.entries(cleanedData)) {
  try {
    console.log(`📄 Deploying ${docId}...`);
    
    // Create a temporary file for this document
    const tempFile = `./temp/${docId}.json`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    
    // Use Firebase CLI to set the document
    const command = `firebase firestore:set cms/${docId} ${tempFile} --project fairfield-airport-car-service`;
    execSync(command, { stdio: 'pipe' });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
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
