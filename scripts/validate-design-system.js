#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Design System Validation Script
 * 
 * Ensures all pages follow the Universal Design System rules
 */

console.log('🎨 Validating Design System Compliance...\n');

let violations = 0;
let passedFiles = 0;

// Files to check
const pageFiles = glob.sync('src/app/**/page.tsx');
const layoutFiles = glob.sync('src/app/**/layout.tsx');
const componentFiles = glob.sync('src/components/**/*.tsx');

const allFiles = [...pageFiles, ...layoutFiles, ...componentFiles];

// Validation rules
const rules = [
  {
    name: 'No inline styles',
    pattern: /style\s*=\s*\{/g,
    message: '❌ Inline styles found. Use CSS classes instead.',
    severity: 'error'
  },
  {
    name: 'No Tailwind flex classes',
    pattern: /className.*["'`][^"'`]*flex-[^"'`]*["'`]/g,
    message: '⚠️ Tailwind flex classes found. Use standard CSS classes.',
    severity: 'warning'
  },
  {
    name: 'No Tailwind grid classes',
    pattern: /className.*["'`][^"'`]*grid-cols-[^"'`]*["'`]/g,
    message: '⚠️ Tailwind grid classes found. Use .grid .grid-2/.grid-3/.grid-4.',
    severity: 'warning'
  },
  {
    name: 'No Tailwind text classes', 
    pattern: /className.*["'`][^"'`]*text-(xs|sm|base|lg|xl|2xl|3xl)[^"'`]*["'`]/g,
    message: '⚠️ Tailwind text sizing found. Use standard typography classes.',
    severity: 'warning'
  },
  {
    name: 'No Tailwind spacing classes',
    pattern: /className.*["'`][^"'`]*(p|m)-(0|1|2|3|4|5|6|8|10|12)[^"'`]*["'`]/g,
    message: '⚠️ Tailwind spacing found. Use standard spacing classes.',
    severity: 'warning'
  }
];

// Page-specific rules
const pageRules = [
  {
    name: 'Pages must use UniversalLayout',
    pattern: /export default function.*\{[\s\S]*?return[\s\S]*?\}/g,
    check: (content, filePath) => {
      if (!filePath.includes('page.tsx')) return true;
      return content.includes('UniversalLayout') || content.includes('StandardLayout');
    },
    message: '❌ Page must use UniversalLayout component.',
    severity: 'error'
  },
  {
    name: 'Pages should use LayoutEnforcer',
    pattern: /LayoutEnforcer/g,
    check: (content, filePath) => {
      if (!filePath.includes('page.tsx')) return true;
      return content.includes('LayoutEnforcer');
    },
    message: '⚠️ Consider using LayoutEnforcer for development validation.',
    severity: 'warning'
  }
];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileViolations = [];

  // Check standard rules
  rules.forEach(rule => {
    const matches = content.match(rule.pattern);
    if (matches) {
      fileViolations.push({
        rule: rule.name,
        message: rule.message,
        severity: rule.severity,
        count: matches.length
      });
    }
  });

  // Check page-specific rules
  pageRules.forEach(rule => {
    if (!rule.check(content, filePath)) {
      fileViolations.push({
        rule: rule.name,
        message: rule.message,
        severity: rule.severity,
        count: 1
      });
    }
  });

  return fileViolations;
}

function formatPath(filePath) {
  return filePath.replace(process.cwd(), '').replace(/^\//, '');
}

// Validate all files
allFiles.forEach(filePath => {
  const fileViolations = validateFile(filePath);
  
  if (fileViolations.length > 0) {
    console.log(`📄 ${formatPath(filePath)}`);
    
    fileViolations.forEach(violation => {
      const icon = violation.severity === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} ${violation.message}`);
      if (violation.count > 1) {
        console.log(`     (${violation.count} occurrences)`);
      }
    });
    
    console.log('');
    violations += fileViolations.filter(v => v.severity === 'error').length;
  } else {
    passedFiles++;
  }
});

// Summary
console.log('📊 VALIDATION SUMMARY');
console.log('=====================');
console.log(`✅ Clean files: ${passedFiles}`);
console.log(`❌ Files with violations: ${allFiles.length - passedFiles}`);
console.log(`🚨 Total violations: ${violations}`);

if (violations > 0) {
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Fix violations listed above');
  console.log('2. Use UniversalLayout for all pages');
  console.log('3. Replace Tailwind classes with standard CSS');
  console.log('4. Use design tokens from standard-layout.css');
  console.log('\n📚 See: src/lib/design-system/design-rules.md');
  
  process.exit(1);
} else {
  console.log('\n🎉 All files pass design system validation!');
  console.log('✨ Your codebase follows consistent design patterns.');
  process.exit(0);
} 