#!/usr/bin/env node

/**
 * 🎯 CMS ID Converter Script
 * 
 * Converts descriptive CMS IDs to simple incremental numbers
 * Run this script to help migrate your CMS ID structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find all CMS IDs in a file
function findCMSIds(content) {
  const regex = /data-cms-id="([^"]+)"/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      id: match[1],
      index: match.index,
      fullMatch: match[0]
    });
  }
  
  return matches;
}

// Function to convert file content
function convertFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cmsIds = findCMSIds(content);
    
    if (cmsIds.length === 0) {
      return { filePath, converted: false, reason: 'No CMS IDs found' };
    }
    
    // Create mapping from old ID to new number
    const idMapping = {};
    let counter = 1;
    
    cmsIds.forEach(({ id }) => {
      if (!idMapping[id]) {
        idMapping[id] = counter.toString();
        counter++;
      }
    });
    
    // Replace IDs in content
    let newContent = content;
    cmsIds.forEach(({ id, fullMatch }) => {
      const newId = idMapping[id];
      const newAttribute = `data-cms-id="${newId}"`;
      newContent = newContent.replace(fullMatch, newAttribute);
    });
    
    // Write backup file
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content);
    
    // Write converted file
    fs.writeFileSync(filePath, newContent);
    
    return {
      filePath,
      converted: true,
      oldIds: Object.keys(idMapping),
      newIds: Object.values(idMapping),
      mapping: idMapping
    };
    
  } catch (error) {
    return { filePath, converted: false, error: error.message };
  }
}

// Function to find all TSX/JSX files
function findFiles(dir, extensions = ['.tsx', '.jsx']) {
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
  const files = findFiles(srcDir);
  
  console.log('🎯 CMS ID Converter');
  console.log('===================\n');
  
  const results = [];
  
  for (const file of files) {
    console.log(`Processing: ${path.relative(process.cwd(), file)}`);
    const result = convertFile(file);
    results.push(result);
    
    if (result.converted) {
      console.log(`✅ Converted ${result.oldIds.length} IDs`);
      console.log(`   Mapping: ${JSON.stringify(result.mapping, null, 2)}`);
    } else {
      console.log(`❌ ${result.reason || result.error}`);
    }
    console.log('');
  }
  
  // Summary
  const converted = results.filter(r => r.converted);
  const failed = results.filter(r => !r.converted);
  
  console.log('📊 Summary');
  console.log('===========');
  console.log(`✅ Converted: ${converted.length} files`);
  console.log(`❌ Failed: ${failed.length} files`);
  
  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(`  - ${f.filePath}: ${f.reason || f.error}`));
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Review the converted files');
  console.log('2. Update your CMS data structure to match new IDs');
  console.log('3. Test the editing functionality');
  console.log('4. Remove .backup files when satisfied');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertFile, findCMSIds, findFiles };
