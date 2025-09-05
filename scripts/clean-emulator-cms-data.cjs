const fs = require('fs');
const path = require('path');

console.log('🧹 CLEANING EMULATOR CMS DATA\n');

// Read the current emulator data
const cmsDataPath = path.join(__dirname, '../temp/current-emulator-cms-data.json');
const cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));

// Function to clean placeholder content
function cleanPlaceholderContent(text) {
  if (typeof text !== 'string') return text;
  
  // Remove common placeholder patterns
  const cleaned = text
    .replace(/^\[TEXT\]\s*/, '')
    .replace(/^\[BUTTON\]\s*/, '')
    .replace(/^\[TITLE\]\s*/, '')
    .replace(/^\[LABEL\]\s*/, '')
    .replace(/^\[DESCRIPTION\]\s*/, '')
    .replace(/^\[MESSAGE\]\s*/, '')
    .replace(/^\[LOADING\]\s*/, '')
    .replace(/^\[ERROR\]\s*/, '')
    .replace(/^\[object Object\]$/, '')
    .replace(/\*$/, '') // Remove trailing asterisks
    .replace(/^user button\s*/, '') // Remove "user button" prefix
    .trim();
  
  // If it's still empty or just placeholder text, provide a meaningful default
  if (!cleaned || cleaned.length < 3) {
    return 'Content placeholder';
  }
  
  return cleaned;
}

// Function to generate better content based on field name
function generateBetterContent(fieldName, currentValue) {
  const cleaned = cleanPlaceholderContent(currentValue);
  
  // If it's already good content, keep it
  if (cleaned !== 'Content placeholder' && cleaned.length > 3) {
    return cleaned;
  }
  
  // Generate better content based on field name patterns
  const lowerField = fieldName.toLowerCase();
  
  if (lowerField.includes('title')) {
    return fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (lowerField.includes('button')) {
    return fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (lowerField.includes('label')) {
    return fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (lowerField.includes('description')) {
    return `This is the ${fieldName.replace(/-/g, ' ')} description.`;
  }
  
  if (lowerField.includes('placeholder')) {
    return `Enter ${fieldName.replace(/-/g, ' ').replace(/placeholder/g, '')}`;
  }
  
  if (lowerField.includes('error')) {
    return `An error occurred. Please try again.`;
  }
  
  if (lowerField.includes('loading')) {
    return `Loading...`;
  }
  
  if (lowerField.includes('success')) {
    return `Operation completed successfully!`;
  }
  
  // Default fallback
  return fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Clean all CMS data
const cleanedCmsData = {};

Object.entries(cmsData).forEach(([pageName, pageData]) => {
  console.log(`🧹 Cleaning ${pageName}...`);
  
  const cleanedPageData = {};
  let cleanedCount = 0;
  
  Object.entries(pageData).forEach(([fieldName, fieldValue]) => {
    const cleanedValue = generateBetterContent(fieldName, fieldValue);
    
    if (cleanedValue !== fieldValue) {
      cleanedCount++;
    }
    
    cleanedPageData[fieldName] = cleanedValue;
  });
  
  cleanedCmsData[pageName] = cleanedPageData;
  
  if (cleanedCount > 0) {
    console.log(`  ✅ Cleaned ${cleanedCount} fields in ${pageName}`);
  }
});

// Save cleaned data
const outputPath = path.join(__dirname, '../temp/cleaned-emulator-cms-data.json');
fs.writeFileSync(outputPath, JSON.stringify(cleanedCmsData, null, 2));

console.log(`\n📊 CLEANING RESULTS:`);
console.log(`  📁 Total pages processed: ${Object.keys(cleanedCmsData).length}`);
console.log(`  💾 Cleaned data saved to: ${outputPath}`);

// Show some examples of cleaned content
console.log(`\n📋 EXAMPLES OF CLEANED CONTENT:`);
console.log(`  booking-page: ${Object.keys(cleanedCmsData['booking'] || {}).length} fields`);
console.log(`  home: ${Object.keys(cleanedCmsData['home'] || {}).length} fields`);
console.log(`  admin: ${Object.keys(cleanedCmsData['admin'] || {}).length} fields`);

// Show a few examples from booking page
if (cleanedCmsData['booking']) {
  console.log(`\n📋 BOOKING PAGE EXAMPLES:`);
  const bookingFields = Object.entries(cleanedCmsData['booking']).slice(0, 10);
  bookingFields.forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

console.log(`\n✅ Cleaning complete! You can now use this data for better CMS content.`);
