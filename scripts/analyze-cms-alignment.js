import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ANALYZING CMS DATA ALIGNMENT WITH APP PAGES\n');

// Read the reorganized CMS data
const cmsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'final-cms-data-fixed.json'), 'utf8'));

// Get all data-cms-id attributes from the app
console.log('📱 Scanning app for data-cms-id attributes...');
const appFields = new Set();

// Scan public pages
const publicPages = execSync('find src/app/\\(public\\) -name "*.tsx"', { encoding: 'utf8' }).trim().split('\n');
publicPages.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/data-cms-id="([^"]+)"/g);
    if (matches) {
      matches.forEach(match => {
        const fieldName = match.match(/data-cms-id="([^"]+)"/)[1];
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
    const matches = content.match(/data-cms-id="([^"]+)"/g);
    if (matches) {
      matches.forEach(match => {
        const fieldName = match.match(/data-cms-id="([^"]+)"/)[1];
        appFields.add(fieldName);
      });
    }
  } catch (error) {
    // Skip files we can't read
  }
});

console.log(`📊 Found ${appFields.size} unique data-cms-id attributes in the app`);

// Analyze alignment
const appFieldsArray = Array.from(appFields);
const cmsFields = new Set();

// Collect all CMS fields
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  Object.keys(sectionData).forEach(fieldName => {
    cmsFields.add(fieldName);
  });
});

console.log(`📊 Found ${cmsFields.size} unique fields in CMS data`);

// Find matches and mismatches
const matches = [];
const missingInCMS = [];
const extraInCMS = [];

appFieldsArray.forEach(fieldName => {
  if (cmsFields.has(fieldName)) {
    matches.push(fieldName);
  } else {
    missingInCMS.push(fieldName);
  }
});

cmsFields.forEach(fieldName => {
  if (!appFields.has(fieldName)) {
    extraInCMS.push(fieldName);
  }
});

// Group app fields by page context
const appFieldsByPage = {};
appFieldsArray.forEach(fieldName => {
  // Try to determine which page this field belongs to
  let pageName = 'unknown';
  
  // Check if field matches any CMS section
  for (const sectionName of Object.keys(cmsData)) {
    if (cmsData[sectionName][fieldName]) {
      pageName = sectionName;
      break;
    }
  }
  
  if (!appFieldsByPage[pageName]) {
    appFieldsByPage[pageName] = [];
  }
  appFieldsByPage[pageName].push(fieldName);
});

// Show results
console.log('\n🎯 ALIGNMENT ANALYSIS:');
console.log(`  ✅ Matches: ${matches.length} fields`);
console.log(`  ❌ Missing in CMS: ${missingInCMS.length} fields`);
console.log(`  🔄 Extra in CMS: ${extraInCMS.length} fields`);
console.log(`  📈 Coverage: ${((matches.length / appFields.size) * 100).toFixed(1)}%`);

// Show missing fields by page context
console.log('\n📋 MISSING FIELDS BY PAGE CONTEXT:');
Object.entries(appFieldsByPage).forEach(([pageName, fields]) => {
  const missingFields = fields.filter(field => !cmsFields.has(field));
  if (missingFields.length > 0) {
    console.log(`  • ${pageName}: ${missingFields.length} missing fields`);
    missingFields.slice(0, 5).forEach(field => {
      console.log(`    - ${field}`);
    });
    if (missingFields.length > 5) {
      console.log(`    ... and ${missingFields.length - 5} more`);
    }
  }
});

// Show some examples of missing fields
if (missingInCMS.length > 0) {
  console.log('\n🔍 EXAMPLES OF MISSING FIELDS:');
  missingInCMS.slice(0, 10).forEach(field => {
    console.log(`  • ${field}`);
  });
  if (missingInCMS.length > 10) {
    console.log(`  ... and ${missingInCMS.length - 10} more`);
  }
}

// Show some examples of extra CMS fields
if (extraInCMS.length > 0) {
  console.log('\n📝 EXAMPLES OF EXTRA CMS FIELDS:');
  extraInCMS.slice(0, 10).forEach(field => {
    console.log(`  • ${field}`);
  });
  if (extraInCMS.length > 10) {
    console.log(`  ... and ${extraInCMS.length - 10} more`);
  }
}

// Show page-by-page breakdown
console.log('\n📊 PAGE-BY-PAGE BREAKDOWN:');
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  const sectionFields = Object.keys(sectionData);
  const usedFields = sectionFields.filter(field => appFields.has(field));
  const unusedFields = sectionFields.filter(field => !appFields.has(field));
  
  if (usedFields.length > 0 || unusedFields.length > 0) {
    console.log(`  • ${sectionName}:`);
    console.log(`    - Used: ${usedFields.length} fields`);
    console.log(`    - Unused: ${unusedFields.length} fields`);
    console.log(`    - Total: ${sectionFields.length} fields`);
  }
});

// Save analysis results
const analysisResults = {
  summary: {
    totalAppFields: appFields.size,
    totalCMSFields: cmsFields.size,
    matches: matches.length,
    missingInCMS: missingInCMS.length,
    extraInCMS: extraInCMS.length,
    coverage: ((matches.length / appFields.size) * 100).toFixed(1) + '%'
  },
  matches: matches,
  missingInCMS: missingInCMS,
  extraInCMS: Array.from(extraInCMS),
  appFieldsByPage: appFieldsByPage,
  pageBreakdown: Object.fromEntries(
    Object.entries(cmsData).map(([sectionName, sectionData]) => {
      const sectionFields = Object.keys(sectionData);
      const usedFields = sectionFields.filter(field => appFields.has(field));
      const unusedFields = sectionFields.filter(field => !appFields.has(field));
      
      return [sectionName, {
        used: usedFields.length,
        unused: unusedFields.length,
        total: sectionFields.length
      }];
    })
  )
};

const outputPath = path.join(__dirname, 'cms-alignment-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(analysisResults, null, 2));

console.log(`\n💾 Analysis results saved to: ${outputPath}`);
console.log('\n🚀 RECOMMENDATIONS:');
if (missingInCMS.length > 0) {
  console.log(`  • Add ${missingInCMS.length} missing fields to CMS data`);
}
if (extraInCMS.length > 0) {
  console.log(`  • Consider removing ${extraInCMS.length} unused CMS fields`);
}
console.log('  • Review page-by-page breakdown for optimization opportunities');
