#!/usr/bin/env node

/**
 * Add Missing CMS Fields Script
 * 
 * This script adds all missing CMS fields with appropriate default values:
 * 1. Reads the analysis results
 * 2. Adds missing fields to appropriate sections
 * 3. Generates updated CMS data
 * 4. Provides recommendations for content
 * 
 * Usage:
 * node scripts/add-missing-cms-fields.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('➕ ADDING MISSING CMS FIELDS\n');

// Read the analysis results
const analysisPath = path.join(__dirname, '../temp/cms-alignment-analysis.json');
let analysis = {};

if (fs.existsSync(analysisPath)) {
  analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  console.log('✅ Loaded analysis results');
} else {
  console.log('❌ No analysis found. Please run analyze-and-fix-cms-alignment.js first.');
  process.exit(1);
}

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

// Function to determine section based on file path
function determineSection(filePath) {
  if (filePath.includes('HomePageUI') || filePath.includes('home')) {
    return 'home';
  } else if (filePath.includes('booking')) {
    return 'booking';
  } else if (filePath.includes('profile')) {
    return 'profile';
  } else if (filePath.includes('dashboard')) {
    return 'dashboard';
  } else if (filePath.includes('about')) {
    return 'about';
  } else if (filePath.includes('contact')) {
    return 'contact';
  } else if (filePath.includes('cancel')) {
    return 'cancel';
  } else if (filePath.includes('success')) {
    return 'success';
  } else if (filePath.includes('payment')) {
    return 'payment';
  } else if (filePath.includes('admin')) {
    return 'admin';
  } else if (filePath.includes('design/components')) {
    return 'components';
  } else if (filePath.includes('design/page-sections')) {
    return 'layout';
  } else {
    return 'general';
  }
}

// Function to generate appropriate default value
function generateDefaultValue(fieldName, context) {
  // Common patterns
  if (fieldName.includes('title')) {
    return `[TITLE] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('description') || fieldName.includes('subtitle')) {
    return `[DESCRIPTION] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('button') || fieldName.includes('action')) {
    return `[BUTTON] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('label')) {
    return `[LABEL] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('placeholder')) {
    return `[PLACEHOLDER] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('message') || fieldName.includes('text')) {
    return `[MESSAGE] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('error')) {
    return `[ERROR] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('success')) {
    return `[SUCCESS] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else if (fieldName.includes('loading')) {
    return `[LOADING] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  } else {
    return `[TEXT] ${fieldName.replace(/-/g, ' ').replace(/_/g, ' ')}`;
  }
}

// Process missing fields
const missingFields = analysis.missingInCMS;
const addedFields = [];
const sectionCounts = {};

console.log(`📊 Processing ${missingFields.length} missing fields...`);

missingFields.forEach(field => {
  const section = determineSection(field.file);
  const defaultValue = generateDefaultValue(field.fieldName, field.context);
  
  // Initialize section if it doesn't exist
  if (!cmsData[section]) {
    cmsData[section] = {};
  }
  
  // Add the field
  cmsData[section][field.fieldName] = defaultValue;
  addedFields.push({
    fieldName: field.fieldName,
    section: section,
    defaultValue: defaultValue,
    file: field.file
  });
  
  // Count by section
  sectionCounts[section] = (sectionCounts[section] || 0) + 1;
});

// Save the updated CMS data
const outputPath = path.join(__dirname, '../temp/cms-data-with-missing-fields.json');
fs.writeFileSync(outputPath, JSON.stringify(cmsData, null, 2));

// Generate summary
const summary = {
  timestamp: new Date().toISOString(),
  totalMissingFields: missingFields.length,
  totalAddedFields: addedFields.length,
  sectionCounts: sectionCounts,
  addedFields: addedFields.slice(0, 50), // First 50 for reference
  recommendations: [
    'Review all [PLACEHOLDER] and [TEXT] values and replace with proper content',
    'Check [TITLE] values for proper capitalization and formatting',
    'Verify [BUTTON] text is appropriate for the context',
    'Ensure [MESSAGE] and [ERROR] text is user-friendly',
    'Test all pages to ensure new fields are working correctly'
  ]
};

const summaryPath = path.join(__dirname, '../temp/missing-fields-add-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`\n📊 MISSING FIELDS ADDITION COMPLETE:`);
console.log(`  ➕ Total fields added: ${addedFields.length}`);
console.log(`  📁 Fields added by section:`);
Object.entries(sectionCounts).forEach(([section, count]) => {
  console.log(`    • ${section}: ${count} fields`);
});

console.log(`\n💾 Updated CMS data saved to: ${outputPath}`);
console.log(`📋 Summary saved to: ${summaryPath}`);

console.log('\n🚀 RECOMMENDATIONS:');
summary.recommendations.forEach(rec => {
  console.log(`  • ${rec}`);
});

console.log('\n✅ Missing fields addition complete!');
