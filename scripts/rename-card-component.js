#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const SRC_DIR = 'src';
const FILE_PATTERNS = [
  '**/*.tsx',
  '**/*.ts'
];

// Component rename mapping
const RENAME_MAPPING = {
  'Card': 'ContentBox',
  'CardProps': 'ContentBoxProps',
};

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Apply renames
  Object.entries(RENAME_MAPPING).forEach(([oldName, newName]) => {
    // Replace imports
    const importRegex = new RegExp(`import\\s+{[^}]*\\b${oldName}\\b[^}]*}\\s+from\\s+['"]@/ui['"]`, 'g');
    content = content.replace(importRegex, (match) => {
      return match.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
    });
    
    // Replace component usage
    const componentRegex = new RegExp(`<${oldName}\\b`, 'g');
    if (componentRegex.test(content)) {
      content = content.replace(componentRegex, `<${newName}`);
      hasChanges = true;
    }
    
    // Replace closing tags
    const closingRegex = new RegExp(`</${oldName}>`, 'g');
    if (closingRegex.test(content)) {
      content = content.replace(closingRegex, `</${newName}>`);
      hasChanges = true;
    }
    
    // Replace type references
    const typeRegex = new RegExp(`\\b${oldName}\\b`, 'g');
    if (typeRegex.test(content)) {
      content = content.replace(typeRegex, newName);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

async function findFiles() {
  const files = [];
  for (const pattern of FILE_PATTERNS) {
    const matches = await glob(path.join(SRC_DIR, pattern), { ignore: ['**/node_modules/**'] });
    files.push(...matches);
  }
  return files;
}

async function main() {
  console.log('🔄 Renaming Card component to better reflect its structural nature...\n');
  
  const files = await findFiles();
  console.log(`Found ${files.length} files to process\n`);
  
  let updatedFiles = 0;
  
  for (const file of files) {
    try {
      const hasChanges = processFile(file);
      if (hasChanges) {
        updatedFiles++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Files updated: ${updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Successfully renamed Card to ${RENAME_MAPPING['Card']} in ${updatedFiles} files!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Rename the actual component file: src/design/components/layout/containers/Card.tsx`);
    console.log(`  2. Update the component interface and implementation`);
    console.log(`  3. Run 'npm run build' to check for any remaining issues`);
  } else {
    console.log(`\nℹ️  No files needed updates.`);
  }
}

// Run the script
main().catch(console.error); 