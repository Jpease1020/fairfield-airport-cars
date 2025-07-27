#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common fix patterns
const fixes = [
  // Remove unnecessary nested Container components
  {
    pattern: /<Container>\s*<Container>/g,
    replacement: '<Container>'
  },
  {
    pattern: /<\/Container>\s*<\/Container>/g,
    replacement: '</Container>'
  },
  
  // Replace raw HTML tags with components
  {
    pattern: /<span\s+([^>]*)>/g,
    replacement: '<Span $1>'
  },
  {
    pattern: /<\/span>/g,
    replacement: '</Span>'
  },
  
  // Remove className from Container components
  {
    pattern: /<Container\s+className=\{([^}]+)\}/g,
    replacement: '<Container'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    fixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Get list of files with violations
const { execSync } = require('child_process');
const violationsOutput = execSync('npm run check:components', { encoding: 'utf8' });

const filesToFix = violationsOutput
  .split('\n')
  .filter(line => line.includes('📄'))
  .map(line => line.split('📄 ')[1])
  .filter(Boolean);

console.log(`Found ${filesToFix.length} files to fix`);

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files`); 