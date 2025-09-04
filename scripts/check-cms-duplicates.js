#!/usr/bin/env node

/**
 * 🎯 CMS Duplicate ID Checker Script
 * 
 * Scans your codebase for duplicate cmsId attributes
 * Run this to find any duplicate IDs that could cause CMS issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find all CMS IDs in a file
function findCMSIds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /cmsId="([^"]+)"/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        id: match[1],
        line: content.substring(0, match.index).split('\n').length,
        file: filePath
      });
    }
    
    return matches;
  } catch (error) {
    return [];
  }
}

// Function to scan directory for TSX/JSX files
function scanDirectory(dir, extensions = ['.tsx', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = scanDirectory(srcDir);
  
  console.log('🔍 CMS ID Duplicate Checker');
  console.log('============================\n');
  
  const allIds = [];
  const duplicates = new Map();
  
  // Collect all CMS IDs
  for (const file of files) {
    const ids = findCMSIds(file);
    allIds.push(...ids);
  }
  
  // Find duplicates WITHIN THE SAME FILE (bad)
  const fileGroups = new Map();
  allIds.forEach(({ id, line, file }) => {
    if (!fileGroups.has(file)) {
      fileGroups.set(file, new Map());
    }
    const fileIds = fileGroups.get(file);
    if (!fileIds.has(id)) {
      fileIds.set(id, []);
    }
    fileIds.get(id).push(line);
  });
  
  // Report same-file duplicates only
  let hasSameFileDuplicates = false;
  fileGroups.forEach((fileIds, file) => {
    const duplicates = [];
    fileIds.forEach((lines, id) => {
      if (lines.length > 1) {
        duplicates.push({ id, lines });
      }
    });
    
    if (duplicates.length > 0) {
      hasSameFileDuplicates = true;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`❌ File: ${relativePath}`);
      duplicates.forEach(({ id, lines }) => {
        console.log(`   Duplicate ID "${id}" at lines: ${lines.join(', ')}`);
      });
      console.log('');
    }
  });
  
  // Summary of cross-page duplicates (informational only)
  const crossPageDuplicates = [];
  const idCounts = new Map();
  allIds.forEach(({ id, file }) => {
    if (!idCounts.has(id)) {
      idCounts.set(id, new Set());
    }
    idCounts.get(id).add(file);
  });
  
  idCounts.forEach((files, id) => {
    if (files.size > 1) {
      crossPageDuplicates.push({ id, files: Array.from(files) });
    }
  });
  
  if (!hasSameFileDuplicates) {
    console.log('✅ No same-file duplicate CMS IDs found!');
  } else {
    console.log('🚨 Action Required:');
    console.log('   - Fix duplicate IDs within the same file');
    console.log('   - Cross-page duplicates are fine and normal');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total CMS IDs: ${allIds.length}`);
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Cross-page duplicates: ${crossPageDuplicates.length} (these are fine)`);
  console.log(`   Same-file duplicates: ${hasSameFileDuplicates ? 'Found - need fixing' : 'None found'}`);
  
  if (crossPageDuplicates.length > 0) {
    console.log('\n💡 Cross-page duplicates (normal and expected):');
    crossPageDuplicates.slice(0, 5).forEach(({ id, files }) => {
      console.log(`   "${id}" used in ${files.length} files`);
    });
    if (crossPageDuplicates.length > 5) {
      console.log(`   ... and ${crossPageDuplicates.length - 5} more`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { findCMSIds, scanDirectory };
