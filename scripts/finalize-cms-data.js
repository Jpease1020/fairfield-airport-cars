import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 FINALIZING CMS DATA: ADDING MISSING FIELDS & REMOVING ORPHANED DATA\n');

// Read the current CMS data
const cmsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'final-cms-data-fixed.json'), 'utf8'));

// Get all cmsId attributes from the app
console.log('📱 Scanning app for cmsId attributes...');
const appFields = new Set();

// Scan public pages
const publicPages = execSync('find src/app/\\(public\\) -name "*.tsx"', { encoding: 'utf8' }).trim().split('\n');
publicPages.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/cmsId="([^"]+)"/g);
    if (matches) {
      matches.forEach(match => {
        const fieldName = match.match(/cmsId="([^"]+)"/)[1];
        appFields.add(fieldName);
      });
    }
  } catch (error) {
    // Skip files we can't read
  }
});

// Scan customer pages
const customerPages = execSync('find src/app/\\(customer\\) -name "*.tsx"', { encoding: 'utf8' }).trim().split('\n');
customerPages.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/cmsId="([^"]+)"/g);
    if (matches) {
      matches.forEach(match => {
        const fieldName = match.match(/cmsId="([^"]+)"/)[1];
        appFields.add(fieldName);
      });
    }
  } catch (error) {
    // Skip files we can't read
  }
});

console.log(`📊 Found ${appFields.size} unique cmsId attributes in the app`);

// Helper function to generate placeholder content for missing fields
function generatePlaceholderContent(fieldName) {
  if (fieldName.includes('title')) {
    return `${fieldName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  } else if (fieldName.includes('subtitle')) {
    return `${fieldName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  } else if (fieldName.includes('description') || fieldName.includes('content')) {
    return `This is the ${fieldName.replace(/[-_]/g, ' ')} content.`;
  } else if (fieldName.includes('button') || fieldName.includes('cta')) {
    return 'Click Here';
  } else if (fieldName.includes('label')) {
    return `${fieldName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  } else if (fieldName.includes('placeholder')) {
    return `Enter ${fieldName.replace(/[-_]/g, ' ').replace(/placeholder/i, '').trim()}`;
  } else if (fieldName.includes('message') || fieldName.includes('info')) {
    return `Information about ${fieldName.replace(/[-_]/g, ' ')}`;
  } else if (fieldName.includes('value')) {
    return `Value for ${fieldName.replace(/[-_]/g, ' ')}`;
  } else if (fieldName.includes('time')) {
    return '9:00 AM - 5:00 PM';
  } else if (fieldName.includes('phone')) {
    return '(555) 123-4567';
  } else if (fieldName.includes('email')) {
    return 'info@fairfieldairportcars.com';
  } else {
    return `Content for ${fieldName.replace(/[-_]/g, ' ')}`;
  }
}

// Helper function to determine which page a field belongs to
function determinePageForField(fieldName) {
  // Check if field matches any existing CMS section
  for (const sectionName of Object.keys(cmsData)) {
    if (cmsData[sectionName][fieldName]) {
      return sectionName;
    }
  }
  
  // Try to infer page from field name
  const fieldLower = fieldName.toLowerCase();
  
  if (fieldLower.includes('profile') || fieldLower.includes('account')) return 'profile';
  if (fieldLower.includes('booking') || fieldLower.includes('book')) return 'booking';
  if (fieldLower.includes('payment') || fieldLower.includes('pay')) return 'payments';
  if (fieldLower.includes('status') || fieldLower.includes('tracking')) return 'status';
  if (fieldLower.includes('feedback') || fieldLower.includes('comment')) return 'feedback';
  if (fieldLower.includes('help') || fieldLower.includes('faq')) return 'help';
  if (fieldLower.includes('about') || fieldLower.includes('company')) return 'about';
  if (fieldLower.includes('privacy') || fieldLower.includes('terms')) return 'privacy';
  if (fieldLower.includes('contact') || fieldLower.includes('phone') || fieldLower.includes('email')) return 'contact';
  if (fieldLower.includes('dashboard') || fieldLower.includes('portal')) return 'dashboard';
  if (fieldLower.includes('login') || fieldLower.includes('auth')) return 'login';
  if (fieldLower.includes('admin') || fieldLower.includes('analytics')) return 'admin';
  
  // Default to 'other' for fields we can't categorize
  return 'other';
}

// Step 1: Add missing fields
console.log('\n📝 Adding missing fields...');
const appFieldsArray = Array.from(appFields);
const addedFields = {};

appFieldsArray.forEach(fieldName => {
  // Check if this field already exists in any CMS section
  let fieldExists = false;
  for (const sectionName of Object.keys(cmsData)) {
    if (cmsData[sectionName][fieldName]) {
      fieldExists = true;
      break;
    }
  }
  
  if (!fieldExists) {
    // Determine which page this field should go to
    const targetPage = determinePageForField(fieldName);
    
    // Create the page section if it doesn't exist
    if (!cmsData[targetPage]) {
      cmsData[targetPage] = {};
    }
    
    // Add the missing field with placeholder content
    cmsData[targetPage][fieldName] = generatePlaceholderContent(fieldName);
    
    if (!addedFields[targetPage]) {
      addedFields[targetPage] = [];
    }
    addedFields[targetPage].push(fieldName);
  }
});

// Show what was added
console.log('📤 FIELDS ADDED:');
Object.entries(addedFields).forEach(([pageName, fields]) => {
  console.log(`  • ${pageName}: ${fields.length} fields added`);
});

// Step 2: Remove orphaned data (fields not used in the app)
console.log('\n🗑️ Removing orphaned data...');
const cmsFields = new Set();
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  Object.keys(sectionData).forEach(fieldName => {
    cmsFields.add(fieldName);
  });
});

const orphanedFields = [];
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  const sectionFields = Object.keys(sectionData);
  const orphanedInSection = sectionFields.filter(field => !appFields.has(field));
  
  orphanedInSection.forEach(field => {
    orphanedFields.push({ section: sectionName, field });
    delete sectionData[field];
  });
  
  // Remove empty sections
  if (Object.keys(sectionData).length === 0) {
    delete cmsData[sectionName];
  }
});

console.log(`🗑️ Removed ${orphanedFields.length} orphaned fields`);

// Step 3: Clean up any remaining empty sections
Object.keys(cmsData).forEach(sectionName => {
  if (Object.keys(cmsData[sectionName]).length === 0) {
    delete cmsData[sectionName];
  }
});

// Save the finalized data
const outputPath = path.join(__dirname, 'final-cms-data-final.json');
fs.writeFileSync(outputPath, JSON.stringify(cmsData, null, 2));

// Final analysis
const finalCmsFields = new Set();
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  Object.keys(sectionData).forEach(fieldName => {
    finalCmsFields.add(fieldName);
  });
});

const finalMatches = appFieldsArray.filter(field => finalCmsFields.has(field));

console.log('\n🎉 CMS DATA FINALIZATION COMPLETE!');
console.log(`📊 Final Results:`);
console.log(`  • App fields: ${appFields.size}`);
console.log(`  • CMS fields: ${finalCmsFields.size}`);
console.log(`  • Matches: ${finalMatches.length}`);
console.log(`  • Coverage: ${((finalMatches.length / appFields.size) * 100).toFixed(1)}%`);
console.log(`  • Total sections: ${Object.keys(cmsData).length}`);

// Show final section breakdown
console.log('\n📋 FINAL SECTION BREAKDOWN:');
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  const fieldCount = Object.keys(sectionData).length;
  console.log(`  • ${sectionName}: ${fieldCount} fields`);
});

console.log(`\n💾 Finalized CMS data saved to: ${outputPath}`);
console.log('🚀 READY FOR USE!');
console.log('   • All missing fields added with placeholder content');
console.log('   • All orphaned data removed');
console.log('   • 100% alignment with app usage');
console.log('   • Clean, optimized structure');
