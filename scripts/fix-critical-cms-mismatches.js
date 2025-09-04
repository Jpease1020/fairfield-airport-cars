#!/usr/bin/env node

/**
 * Fix Critical CMS Mismatches Script
 * 
 * This script fixes the most critical cmsId vs data key mismatches:
 * 1. Updates cmsId attributes to match data keys
 * 2. Fixes the most common patterns
 * 3. Focuses on customer-facing pages
 * 
 * Usage:
 * node scripts/fix-critical-cms-mismatches.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 FIXING CRITICAL CMS MISMATCHES\n');

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

// Focus on the most critical mismatches (customer-facing pages)
const criticalMismatches = analysis.mismatches.filter(mismatch => 
  mismatch.file.includes('customer') || 
  mismatch.file.includes('HomePageUI') ||
  mismatch.file.includes('booking')
).slice(0, 20); // Focus on first 20 most critical

console.log(`🎯 Found ${criticalMismatches.length} critical mismatches to fix`);

// Group mismatches by file for efficient processing
const mismatchesByFile = {};
criticalMismatches.forEach(mismatch => {
  if (!mismatchesByFile[mismatch.file]) {
    mismatchesByFile[mismatch.file] = [];
  }
  mismatchesByFile[mismatch.file].push(mismatch);
});

let totalFilesFixed = 0;
let totalMismatchesFixed = 0;

// Process each file
Object.entries(mismatchesByFile).forEach(([filePath, mismatches]) => {
  console.log(`\n📁 Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileFixed = false;
    
    mismatches.forEach(mismatch => {
      const { fieldName, dataKey, line, context } = mismatch;
      
      // Create the replacement pattern
      const oldPattern = `cmsId="${fieldName}"`;
      const newPattern = `cmsId="${dataKey}"`;
      
      if (content.includes(oldPattern)) {
        content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
        fileFixed = true;
        totalMismatchesFixed++;
        console.log(`  ✅ Fixed: ${fieldName} → ${dataKey}`);
      }
    });
    
    if (fileFixed) {
      // Write the fixed content back
      fs.writeFileSync(filePath, content);
      totalFilesFixed++;
      console.log(`  💾 Saved: ${filePath}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
  }
});

// Generate a summary
const summary = {
  timestamp: new Date().toISOString(),
  totalFilesProcessed: Object.keys(mismatchesByFile).length,
  totalFilesFixed: totalFilesFixed,
  totalMismatchesFixed: totalMismatchesFixed,
  criticalMismatches: criticalMismatches.length,
  remainingMismatches: analysis.mismatches.length - criticalMismatches.length
};

const summaryPath = path.join(__dirname, '../temp/critical-mismatches-fix-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`\n📊 CRITICAL MISMATCHES FIX COMPLETE:`);
console.log(`  📁 Files processed: ${Object.keys(mismatchesByFile).length}`);
console.log(`  ✅ Files fixed: ${totalFilesFixed}`);
console.log(`  🔧 Mismatches fixed: ${totalMismatchesFixed}`);
console.log(`  📋 Summary saved to: ${summaryPath}`);

if (totalMismatchesFixed > 0) {
  console.log('\n🎉 Critical mismatches have been fixed!');
  console.log('💡 Next steps:');
  console.log('  1. Test the fixed pages');
  console.log('  2. Run the analysis again to see remaining issues');
  console.log('  3. Continue with remaining mismatches if needed');
} else {
  console.log('\n⚠️  No mismatches were fixed. Check the file paths and patterns.');
}

console.log('\n✅ Critical mismatches fix complete!');
