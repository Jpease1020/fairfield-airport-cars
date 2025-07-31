#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Files that need fixing
const FILES_TO_FIX = [
  'src/app/admin/help/page.tsx',
  'src/app/admin/feedback/page.tsx',
  'src/app/booking/[id]/page.tsx'
];

function fixCardImports(filePath) {
  console.log(`Fixing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix imports
  if (content.includes('import') && content.includes('Card')) {
    content = content.replace(/import\s+{[^}]*\bCard\b[^}]*}\s+from\s+['"]@\/ui['"]/g, (match) => {
      return match.replace(/\bCard\b/g, 'ContentBox');
    });
    hasChanges = true;
  }
  
  // Fix component usage
  if (content.includes('<Card')) {
    content = content.replace(/<Card\b/g, '<ContentBox');
    hasChanges = true;
  }
  
  // Fix closing tags
  if (content.includes('</Card>')) {
    content = content.replace(/<\/Card>/g, '</ContentBox>');
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔧 Fixing remaining Card imports...\n');
  
  let updatedFiles = 0;
  
  for (const file of FILES_TO_FIX) {
    try {
      const hasChanges = fixCardImports(file);
      if (hasChanges) {
        updatedFiles++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${FILES_TO_FIX.length}`);
  console.log(`  Files updated: ${updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Successfully fixed Card imports in ${updatedFiles} files!`);
  } else {
    console.log(`\nℹ️  No files needed updates.`);
  }
}

// Run the script
main().catch(console.error); 