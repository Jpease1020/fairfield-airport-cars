#!/usr/bin/env node

/**
 * Component Rules Checker
 * 
 * This script checks for violations of our component development rules:
 * 1. No className in reusable components
 * 2. No div/span/p tags for structure
 * 3. Proper component usage
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Rules to check
const RULES = {
  NO_CLASSNAME_IN_REUSABLE: {
    pattern: /className\s*=\s*\{[^}]+\}/g,
    message: '❌ FORBIDDEN: className prop in reusable component',
    files: ['src/components/ui/**/*.tsx', 'src/components/ui/**/*.ts']
  },
  NO_DIV_FOR_STRUCTURE: {
    pattern: /<div[^>]*>/g,
    message: '❌ FORBIDDEN: div tag for structure - use Container/Stack',
    files: ['src/components/ui/**/*.tsx', 'src/components/ui/**/*.ts'],
    exclude: ['src/components/ui/containers.tsx'] // Allow div in container definitions
  },
  NO_SPAN_FOR_TEXT: {
    pattern: /<span[^>]*>/g,
    message: '❌ FORBIDDEN: span tag for text - use Span component',
    files: ['src/components/ui/**/*.tsx', 'src/components/ui/**/*.ts']
  },
  NO_P_FOR_TEXT: {
    pattern: /<p[^>]*>/g,
    message: '❌ FORBIDDEN: p tag for text - use Text component',
    files: ['src/components/ui/**/*.tsx', 'src/components/ui/**/*.ts']
  },
  WRONG_IMPORT: {
    pattern: /import.*Stack.*from.*['"]@\/components\/ui['"]/g,
    message: '❌ FORBIDDEN: Stack import from @/components/ui - use @/components/ui/containers',
    files: ['src/**/*.tsx', 'src/**/*.ts']
  }
};

function checkFile(filePath, rule) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(rule.pattern);
    
    if (matches) {
      console.log(`\n${rule.message}`);
      console.log(`File: ${filePath}`);
      console.log(`Matches: ${matches.length}`);
      
      // Show context around matches
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineIndex = content.indexOf(match);
        const lineNumber = content.substring(0, lineIndex).split('\n').length;
        const context = lines[Math.max(0, lineNumber - 2)].trim();
        console.log(`  Line ${lineNumber}: ${context}`);
      });
      
      return true; // Violation found
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
  
  return false; // No violation
}

function checkRule(rule) {
  console.log(`\n🔍 Checking rule: ${rule.message}`);
  
  let violations = 0;
  
  rule.files.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      // Skip excluded files
      if (rule.exclude && rule.exclude.some(exclude => file.includes(exclude))) {
        return;
      }
      
      if (checkFile(file, rule)) {
        violations++;
      }
    });
  });
  
  return violations;
}

function main() {
  console.log('🚨 Component Rules Checker');
  console.log('==========================');
  
  let totalViolations = 0;
  
  Object.entries(RULES).forEach(([ruleName, rule]) => {
    const violations = checkRule(rule);
    totalViolations += violations;
  });
  
  console.log('\n📊 Summary');
  console.log('==========');
  
  if (totalViolations === 0) {
    console.log('✅ All component rules passed!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalViolations} rule violations`);
    console.log('\n🚫 These violations must be fixed before committing!');
    console.log('📖 See docs/development/COMPONENT_GUIDE.md for rules');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkRule, RULES }; 