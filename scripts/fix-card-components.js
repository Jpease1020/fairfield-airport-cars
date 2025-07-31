#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = 'src';
const FILE_PATTERNS = [
  '**/*.tsx',
  '**/*.ts'
];

// Card component patterns to fix
const CARD_PATTERNS = [
  // Pattern 1: Card with title and description props
  {
    regex: /<Card\s+([^>]*?)title\s*=\s*["']([^"']+)["']([^>]*?)description\s*=\s*["']([^"']+)["']([^>]*?)>/g,
    replacement: (match, beforeTitle, title, between, description, after) => {
      return `<Card variant="elevated" padding="lg">\n            <Stack spacing="md">\n              <Stack spacing="sm">\n                <Text variant="lead" size="md" weight="semibold">${title}</Text>\n                <Text variant="muted" size="sm">${description}</Text>\n              </Stack>`;
    }
  },
  // Pattern 2: Card with only title prop
  {
    regex: /<Card\s+([^>]*?)title\s*=\s*["']([^"']+)["']([^>]*?)>/g,
    replacement: (match, before, title, after) => {
      return `<Card variant="elevated" padding="lg">\n            <Stack spacing="md">\n              <Stack spacing="sm">\n                <Text variant="lead" size="md" weight="semibold">${title}</Text>\n              </Stack>`;
    }
  },
  // Pattern 3: Card with only description prop
  {
    regex: /<Card\s+([^>]*?)description\s*=\s*["']([^"']+)["']([^>]*?)>/g,
    replacement: (match, before, description, after) => {
      return `<Card variant="elevated" padding="lg">\n            <Stack spacing="md">\n              <Stack spacing="sm">\n                <Text variant="muted" size="sm">${description}</Text>\n              </Stack>`;
    }
  },
  // Pattern 4: Card with icon, statNumber, statChange, changeType props (stats cards)
  {
    regex: /<Card\s+([^>]*?)title\s*=\s*["']([^"']+)["']([^>]*?)icon\s*=\s*["']([^"']+)["']([^>]*?)statNumber\s*=\s*{([^}]+)}([^>]*?)statChange\s*=\s*["']([^"']+)["']([^>]*?)changeType\s*=\s*["']([^"']+)["']([^>]*?)>/g,
    replacement: (match, beforeTitle, title, between1, icon, between2, statNumber, between3, statChange, between4, changeType, after) => {
      return `<Card variant="elevated" padding="lg">\n            <Stack spacing="sm">\n              <Text variant="lead" size="md" weight="semibold">${title}</Text>\n              <Text size="xl" weight="bold">{${statNumber}}</Text>\n              <Text variant="muted" size="sm">${statChange}</Text>`;
    }
  }
];

// Stack justify prop patterns to fix
const STACK_PATTERNS = [
  {
    regex: /justify\s*=\s*["']between["']/g,
    replacement: 'justify="space-between"'
  }
];

// Text variant patterns to fix
const TEXT_PATTERNS = [
  {
    regex: /variant\s*=\s*["']heading["']/g,
    replacement: 'variant="lead"'
  }
];

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Apply Card component fixes
  CARD_PATTERNS.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });
  
  // Apply Stack justify fixes
  STACK_PATTERNS.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });
  
  // Apply Text variant fixes
  TEXT_PATTERNS.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });
  
  // Add missing closing tags for Stack components that were opened
  const stackOpenCount = (content.match(/<Stack/g) || []).length;
  const stackCloseCount = (content.match(/<\/Stack>/g) || []).length;
  
  if (stackOpenCount > stackCloseCount) {
    console.log(`  ⚠️  Warning: ${stackOpenCount - stackCloseCount} missing Stack closing tags in ${filePath}`);
  }
  
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
  console.log('🔧 Fixing Card components across the codebase...\n');
  
  const files = await findFiles();
  console.log(`Found ${files.length} files to process\n`);
  
  let updatedFiles = 0;
  let totalChanges = 0;
  
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
  console.log(`  Total changes: ${totalChanges}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Successfully updated ${updatedFiles} files!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run 'npm run build' to check for remaining issues`);
    console.log(`  2. Review the changes and test the application`);
    console.log(`  3. Fix any remaining manual issues`);
  } else {
    console.log(`\nℹ️  No files needed updates.`);
  }
}

// Run the script
main().catch(console.error); 