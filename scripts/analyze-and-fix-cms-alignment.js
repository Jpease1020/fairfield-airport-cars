#!/usr/bin/env node

/**
 * Analyze and Fix CMS Alignment Script
 * 
 * This script:
 * 1. Scans all React components for cmsId attributes
 * 2. Analyzes the current CMS data structure
 * 3. Identifies mismatches between cmsId and data keys
 * 4. Generates a corrected CMS data structure
 * 5. Provides recommendations for fixes
 * 
 * Usage:
 * node scripts/analyze-and-fix-cms-alignment.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ANALYZING CMS ALIGNMENT AND GENERATING FIXES\n');

// Read the current CMS data
const cmsDataPath = path.join(__dirname, '../temp/final-cms-data-final-fixed.json');
let cmsData = {};

if (fs.existsSync(cmsDataPath)) {
  cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));
  console.log('✅ Loaded existing CMS data');
} else {
  console.log('❌ No CMS data found. Please run fetch-all-cms-data.js first.');
  process.exit(1);
}

// Get all cmsId attributes from the app
console.log('📱 Scanning app for cmsId attributes...');
const appFields = new Map(); // fieldName -> { file, line, context }

// Scan all React files
const reactFiles = execSync('find src -name "*.tsx" -o -name "*.ts" | grep -v node_modules', { encoding: 'utf8' }).trim().split('\n');

reactFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const matches = line.match(/cmsId="([^"]+)"/g);
      if (matches) {
        matches.forEach(match => {
          const fieldName = match.match(/cmsId="([^"]+)"/)[1];
          if (fieldName !== 'ignore') {
            appFields.set(fieldName, {
              file: file.replace(process.cwd() + '/', ''),
              line: index + 1,
              context: line.trim(),
              // Extract the data key being used
              dataKey: extractDataKey(line)
            });
          }
        });
      }
    });
  } catch (error) {
    // Skip files we can't read
  }
});

function extractDataKey(line) {
  // Look for patterns like cmsData?.['key'] or pageCmsData?.['key']
  const dataKeyMatch = line.match(/cmsData\?\.\[['"]([^'"]+)['"]\]|pageCmsData\?\.\[['"]([^'"]+)['"]\]/);
  if (dataKeyMatch) {
    return dataKeyMatch[1] || dataKeyMatch[2];
  }
  return null;
}

console.log(`📊 Found ${appFields.size} unique cmsId attributes in the app`);

// Analyze alignment
const analysis = {
  matches: [],
  mismatches: [],
  missingInCMS: [],
  extraInCMS: [],
  recommendations: []
};

// Collect all CMS fields
const cmsFields = new Set();
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  Object.keys(sectionData).forEach(fieldName => {
    cmsFields.add(fieldName);
  });
});

console.log(`📊 Found ${cmsFields.size} unique fields in CMS data`);

// Analyze each app field
appFields.forEach((fieldInfo, fieldName) => {
  if (cmsFields.has(fieldName)) {
    analysis.matches.push({
      fieldName,
      ...fieldInfo,
      status: 'match'
    });
  } else {
    // Check if there's a data key mismatch
    if (fieldInfo.dataKey && fieldInfo.dataKey !== fieldName) {
      analysis.mismatches.push({
        fieldName,
        dataKey: fieldInfo.dataKey,
        ...fieldInfo,
        status: 'mismatch',
        recommendation: `Change cmsId from "${fieldName}" to "${fieldInfo.dataKey}" or update data key to match cmsId`
      });
    } else {
      analysis.missingInCMS.push({
        fieldName,
        ...fieldInfo,
        status: 'missing',
        recommendation: `Add "${fieldName}" to CMS data`
      });
    }
  }
});

// Find extra CMS fields
cmsFields.forEach(fieldName => {
  if (!appFields.has(fieldName)) {
    analysis.extraInCMS.push({
      fieldName,
      status: 'unused',
      recommendation: `Consider removing "${fieldName}" from CMS data if not needed`
    });
  }
});

// Generate recommendations
if (analysis.mismatches.length > 0) {
  analysis.recommendations.push({
    type: 'mismatch',
    count: analysis.mismatches.length,
    description: 'Fix cmsId and data key mismatches',
    priority: 'high'
  });
}

if (analysis.missingInCMS.length > 0) {
  analysis.recommendations.push({
    type: 'missing',
    count: analysis.missingInCMS.length,
    description: 'Add missing fields to CMS data',
    priority: 'high'
  });
}

if (analysis.extraInCMS.length > 0) {
  analysis.recommendations.push({
    type: 'unused',
    count: analysis.extraInCMS.length,
    description: 'Review unused CMS fields',
    priority: 'low'
  });
}

// Show results
console.log('\n🎯 ALIGNMENT ANALYSIS:');
console.log(`  ✅ Matches: ${analysis.matches.length} fields`);
console.log(`  ❌ Mismatches: ${analysis.mismatches.length} fields`);
console.log(`  🔍 Missing in CMS: ${analysis.missingInCMS.length} fields`);
console.log(`  🔄 Extra in CMS: ${analysis.extraInCMS.length} fields`);
console.log(`  📈 Coverage: ${((analysis.matches.length / appFields.size) * 100).toFixed(1)}%`);

// Show mismatches in detail
if (analysis.mismatches.length > 0) {
  console.log('\n🔧 MISMATCHES FOUND:');
  analysis.mismatches.slice(0, 10).forEach(mismatch => {
    console.log(`  • ${mismatch.fieldName} (cmsId) vs ${mismatch.dataKey} (data key)`);
    console.log(`    File: ${mismatch.file}:${mismatch.line}`);
    console.log(`    Context: ${mismatch.context}`);
    console.log(`    Fix: ${mismatch.recommendation}`);
    console.log('');
  });
  
  if (analysis.mismatches.length > 10) {
    console.log(`  ... and ${analysis.mismatches.length - 10} more mismatches`);
  }
}

// Show missing fields
if (analysis.missingInCMS.length > 0) {
  console.log('\n❌ MISSING FIELDS:');
  analysis.missingInCMS.slice(0, 10).forEach(missing => {
    console.log(`  • ${missing.fieldName}`);
    console.log(`    File: ${missing.file}:${missing.line}`);
    console.log(`    Context: ${missing.context}`);
    console.log('');
  });
  
  if (analysis.missingInCMS.length > 10) {
    console.log(`  ... and ${analysis.missingInCMS.length - 10} more missing fields`);
  }
}

// Generate corrected CMS data
console.log('\n🔧 GENERATING CORRECTED CMS DATA...');

const correctedCmsData = { ...cmsData };

// Add missing fields with placeholder values
analysis.missingInCMS.forEach(missing => {
  // Try to determine which section this field belongs to
  let sectionName = 'home'; // default
  
  // Look for clues in the file path
  if (missing.file.includes('booking')) {
    sectionName = 'booking';
  } else if (missing.file.includes('profile')) {
    sectionName = 'profile';
  } else if (missing.file.includes('dashboard')) {
    sectionName = 'dashboard';
  } else if (missing.file.includes('about')) {
    sectionName = 'about';
  } else if (missing.file.includes('contact')) {
    sectionName = 'contact';
  }
  
  // Initialize section if it doesn't exist
  if (!correctedCmsData[sectionName]) {
    correctedCmsData[sectionName] = {};
  }
  
  // Add the missing field with a placeholder
  correctedCmsData[sectionName][missing.fieldName] = `[PLACEHOLDER] ${missing.fieldName}`;
});

// Save analysis results
const analysisResults = {
  summary: {
    totalAppFields: appFields.size,
    totalCMSFields: cmsFields.size,
    matches: analysis.matches.length,
    mismatches: analysis.mismatches.length,
    missingInCMS: analysis.missingInCMS.length,
    extraInCMS: analysis.extraInCMS.length,
    coverage: ((analysis.matches.length / appFields.size) * 100).toFixed(1) + '%'
  },
  matches: analysis.matches,
  mismatches: analysis.mismatches,
  missingInCMS: analysis.missingInCMS,
  extraInCMS: analysis.extraInCMS,
  recommendations: analysis.recommendations
};

const outputPath = path.join(__dirname, '../temp/cms-alignment-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(analysisResults, null, 2));

// Save corrected CMS data
const correctedPath = path.join(__dirname, '../temp/corrected-cms-data.json');
fs.writeFileSync(correctedPath, JSON.stringify(correctedCmsData, null, 2));

console.log(`\n💾 Analysis results saved to: ${outputPath}`);
console.log(`💾 Corrected CMS data saved to: ${correctedPath}`);

// Generate fix recommendations
console.log('\n🚀 RECOMMENDATIONS:');
analysis.recommendations.forEach(rec => {
  const priority = rec.priority === 'high' ? '🔴' : '🟡';
  console.log(`  ${priority} ${rec.description} (${rec.count} items)`);
});

console.log('\n📋 NEXT STEPS:');
console.log('  1. Review the mismatches and fix cmsId/data key alignment');
console.log('  2. Add missing fields to CMS data with proper content');
console.log('  3. Test the corrected CMS data');
console.log('  4. Update Firebase with the corrected data');

console.log('\n✅ Analysis complete!');
