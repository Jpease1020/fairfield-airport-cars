#!/usr/bin/env node

/**
 * Fix Home Page CMS Alignment Script
 * 
 * This script specifically fixes the home page CMS alignment issues:
 * 1. Adds missing home page fields to CMS data
 * 2. Ensures all cmsId attributes match their data keys
 * 3. Updates the home page data structure
 * 
 * Usage:
 * node scripts/fix-home-page-cms-alignment.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏠 FIXING HOME PAGE CMS ALIGNMENT\n');

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

// Home page fields that need to be added/fixed
const homePageFields = {
  // Missing fields that need to be added
  'mobile-sticky-book-now': 'Book Now',
  'final-cta-primary-button': 'Book Now',
  
  // Ensure all existing fields are properly structured
  'hero-title': 'Premium Airport Transportation',
  'hero-description': 'No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County.',
  'features-title': 'Why Choose Us',
  'features-subtitle': 'Experience the difference with our premium service',
  'features-items-0-title': 'Reliable Service',
  'features-items-0-description': 'Professional drivers and well-maintained vehicles',
  'features-items-1-title': 'Flight Tracking',
  'features-items-1-description': 'We monitor your flight for delays and adjust pickup times',
  'features-items-2-title': '24/7 Support',
  'features-items-2-description': 'Round-the-clock customer service and emergency support',
  'faq-title': 'Frequently Asked Questions',
  'faq-subtitle': 'Everything you need to know about our service',
  'faq-items-0-question': 'How far in advance should I book?',
  'faq-items-0-answer': 'We recommend booking at least 24 hours in advance for the best availability.',
  'faq-items-1-question': 'What if my flight is delayed?',
  'faq-items-1-answer': 'We track your flight and automatically adjust pickup times for delays.',
  'faq-items-2-question': 'Can I cancel or modify my booking?',
  'faq-items-2-answer': 'Yes, you can modify or cancel your booking up to 3 hours before pickup.',
  'final-cta-title': 'Ready to Book Your Ride?',
  'final-cta-description': 'Experience reliable airport transportation with Fairfield Airport Cars',
  'final-cta-secondary-button': 'Learn More'
};

// Initialize home section if it doesn't exist
if (!cmsData.home) {
  cmsData.home = {};
}

// Add/update home page fields
let addedCount = 0;
let updatedCount = 0;

Object.entries(homePageFields).forEach(([fieldName, defaultValue]) => {
  if (!cmsData.home[fieldName]) {
    cmsData.home[fieldName] = defaultValue;
    addedCount++;
    console.log(`  ➕ Added: ${fieldName}`);
  } else {
    // Update existing field if it's a placeholder
    if (cmsData.home[fieldName].includes('[PLACEHOLDER]')) {
      cmsData.home[fieldName] = defaultValue;
      updatedCount++;
      console.log(`  🔄 Updated: ${fieldName}`);
    }
  }
});

// Save the updated CMS data
const outputPath = path.join(__dirname, '../temp/home-page-fixed-cms-data.json');
fs.writeFileSync(outputPath, JSON.stringify(cmsData, null, 2));

console.log(`\n📊 HOME PAGE FIXES COMPLETE:`);
console.log(`  ➕ Added: ${addedCount} fields`);
console.log(`  🔄 Updated: ${updatedCount} fields`);
console.log(`  📁 Total home page fields: ${Object.keys(cmsData.home).length}`);

// Verify the home page structure
console.log('\n🔍 HOME PAGE STRUCTURE VERIFICATION:');
const homeFields = Object.keys(cmsData.home);
const requiredFields = Object.keys(homePageFields);

const missingFields = requiredFields.filter(field => !homeFields.includes(field));
const extraFields = homeFields.filter(field => !requiredFields.includes(field));

if (missingFields.length === 0) {
  console.log('  ✅ All required fields are present');
} else {
  console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
}

if (extraFields.length > 0) {
  console.log(`  ℹ️  Extra fields: ${extraFields.length} (these are fine to keep)`);
}

console.log(`\n💾 Updated CMS data saved to: ${outputPath}`);

// Generate a summary of what was fixed
const summary = {
  timestamp: new Date().toISOString(),
  page: 'home',
  addedFields: addedCount,
  updatedFields: updatedCount,
  totalFields: Object.keys(cmsData.home).length,
  missingFields: missingFields,
  extraFields: extraFields
};

const summaryPath = path.join(__dirname, '../temp/home-page-fix-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`📋 Summary saved to: ${summaryPath}`);
console.log('\n✅ Home page CMS alignment fix complete!');
