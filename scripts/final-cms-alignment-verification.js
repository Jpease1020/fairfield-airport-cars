#!/usr/bin/env node

/**
 * Final CMS Alignment Verification Script
 * 
 * This script runs a final verification to check:
 * 1. How many mismatches were fixed
 * 2. How many missing fields were added
 * 3. Overall improvement in alignment
 * 
 * Usage:
 * node scripts/final-cms-alignment-verification.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 FINAL CMS ALIGNMENT VERIFICATION\n');

// Run the analysis again to see improvements
console.log('📊 Running fresh analysis...');

// Get all cmsId attributes from the app
const appFields = new Map();

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
  const dataKeyMatch = line.match(/cmsData\?\.\[['"]([^'"]+)['"]\]|pageCmsData\?\.\[['"]([^'"]+)['"]\]/);
  if (dataKeyMatch) {
    return dataKeyMatch[1] || dataKeyMatch[2];
  }
  return null;
}

// Read the updated CMS data
const cmsDataPath = path.join(__dirname, '../temp/cms-data-with-missing-fields.json');
let cmsData = {};

if (fs.existsSync(cmsDataPath)) {
  cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));
} else {
  console.log('❌ No updated CMS data found');
  process.exit(1);
}

// Collect all CMS fields
const cmsFields = new Set();
Object.entries(cmsData).forEach(([sectionName, sectionData]) => {
  Object.keys(sectionData).forEach(fieldName => {
    cmsFields.add(fieldName);
  });
});

// Analyze current state
const currentAnalysis = {
  matches: [],
  mismatches: [],
  missingInCMS: []
};

appFields.forEach((fieldInfo, fieldName) => {
  if (cmsFields.has(fieldName)) {
    if (fieldInfo.dataKey && fieldInfo.dataKey !== fieldName) {
      currentAnalysis.mismatches.push({
        fieldName,
        dataKey: fieldInfo.dataKey,
        ...fieldInfo
      });
    } else {
      currentAnalysis.matches.push({
        fieldName,
        ...fieldInfo
      });
    }
  } else {
    currentAnalysis.missingInCMS.push({
      fieldName,
      ...fieldInfo
    });
  }
});

// Read the original analysis for comparison
const originalAnalysisPath = path.join(__dirname, '../temp/cms-alignment-analysis.json');
let originalAnalysis = {};

if (fs.existsSync(originalAnalysisPath)) {
  originalAnalysis = JSON.parse(fs.readFileSync(originalAnalysisPath, 'utf8'));
}

// Calculate improvements
const improvements = {
  original: {
    totalAppFields: originalAnalysis.summary?.totalAppFields || 0,
    matches: originalAnalysis.summary?.matches || 0,
    mismatches: originalAnalysis.summary?.mismatches || 0,
    missingInCMS: originalAnalysis.summary?.missingInCMS || 0,
    coverage: originalAnalysis.summary?.coverage || '0%'
  },
  current: {
    totalAppFields: appFields.size,
    matches: currentAnalysis.matches.length,
    mismatches: currentAnalysis.mismatches.length,
    missingInCMS: currentAnalysis.missingInCMS.length,
    coverage: ((currentAnalysis.matches.length / appFields.size) * 100).toFixed(1) + '%'
  }
};

// Calculate deltas
const deltas = {
  matches: currentAnalysis.matches.length - (originalAnalysis.summary?.matches || 0),
  mismatches: currentAnalysis.mismatches.length - (originalAnalysis.summary?.mismatches || 0),
  missingInCMS: currentAnalysis.missingInCMS.length - (originalAnalysis.summary?.missingInCMS || 0)
};

// Display results
console.log('📊 VERIFICATION RESULTS:');
console.log('\n🔍 BEFORE vs AFTER:');
console.log(`  Total App Fields: ${improvements.original.totalAppFields} → ${improvements.current.totalAppFields}`);
console.log(`  Matches: ${improvements.original.matches} → ${improvements.current.matches} (${deltas.matches > 0 ? '+' : ''}${deltas.matches})`);
console.log(`  Mismatches: ${improvements.original.mismatches} → ${improvements.current.mismatches} (${deltas.mismatches > 0 ? '+' : ''}${deltas.mismatches})`);
console.log(`  Missing in CMS: ${improvements.original.missingInCMS} → ${improvements.current.missingInCMS} (${deltas.missingInCMS > 0 ? '+' : ''}${deltas.missingInCMS})`);
console.log(`  Coverage: ${improvements.original.coverage} → ${improvements.current.coverage}`);

console.log('\n🎯 IMPROVEMENTS:');
if (deltas.matches > 0) {
  console.log(`  ✅ ${deltas.matches} new matches added`);
}
if (deltas.mismatches < 0) {
  console.log(`  ✅ ${Math.abs(deltas.mismatches)} mismatches fixed`);
}
if (deltas.missingInCMS < 0) {
  console.log(`  ✅ ${Math.abs(deltas.missingInCMS)} missing fields added`);
}

// Show remaining issues
if (currentAnalysis.mismatches.length > 0) {
  console.log(`\n⚠️  REMAINING MISMATCHES: ${currentAnalysis.mismatches.length}`);
  currentAnalysis.mismatches.slice(0, 5).forEach(mismatch => {
    console.log(`  • ${mismatch.fieldName} (cmsId) vs ${mismatch.dataKey} (data key)`);
  });
  if (currentAnalysis.mismatches.length > 5) {
    console.log(`  ... and ${currentAnalysis.mismatches.length - 5} more`);
  }
}

if (currentAnalysis.missingInCMS.length > 0) {
  console.log(`\n⚠️  REMAINING MISSING FIELDS: ${currentAnalysis.missingInCMS.length}`);
  currentAnalysis.missingInCMS.slice(0, 5).forEach(missing => {
    console.log(`  • ${missing.fieldName}`);
  });
  if (currentAnalysis.missingInCMS.length > 5) {
    console.log(`  ... and ${currentAnalysis.missingInCMS.length - 5} more`);
  }
}

// Save verification results
const verificationResults = {
  timestamp: new Date().toISOString(),
  improvements: improvements,
  deltas: deltas,
  currentState: {
    totalAppFields: appFields.size,
    totalCMSFields: cmsFields.size,
    matches: currentAnalysis.matches.length,
    mismatches: currentAnalysis.mismatches.length,
    missingInCMS: currentAnalysis.missingInCMS.length,
    coverage: improvements.current.coverage
  },
  remainingIssues: {
    mismatches: currentAnalysis.mismatches.length,
    missingInCMS: currentAnalysis.missingInCMS.length
  }
};

const verificationPath = path.join(__dirname, '../temp/final-verification-results.json');
fs.writeFileSync(verificationPath, JSON.stringify(verificationResults, null, 2));

console.log(`\n💾 Verification results saved to: ${verificationPath}`);

// Final assessment
const totalImprovements = deltas.matches + Math.abs(deltas.mismatches) + Math.abs(deltas.missingInCMS);
const coverageImprovement = parseFloat(improvements.current.coverage) - parseFloat(improvements.original.coverage);

console.log('\n🏆 FINAL ASSESSMENT:');
console.log(`  📈 Total improvements: ${totalImprovements}`);
console.log(`  📊 Coverage improvement: ${coverageImprovement > 0 ? '+' : ''}${coverageImprovement.toFixed(1)}%`);

if (coverageImprovement > 20) {
  console.log('  🎉 Excellent improvement! CMS alignment is much better.');
} else if (coverageImprovement > 10) {
  console.log('  ✅ Good improvement! CMS alignment is better.');
} else if (coverageImprovement > 0) {
  console.log('  👍 Some improvement made.');
} else {
  console.log('  ⚠️  No significant improvement detected.');
}

console.log('\n✅ Final verification complete!');
