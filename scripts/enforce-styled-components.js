#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Styled-Components Enforcer - Prevents CSS Antipatterns
 * 
 * This script enforces our component-driven architecture:
 * - No hardcoded className usage
 * - Styled-components only
 * - Design tokens only
 */

const ALLOWED_CLASSNAMES = [
  // Essential accessibility classes
  'sr-only',
  'skip-link',
  // Styled-components generated classes (these are OK)
  'sc-',
  'styled-',
  // Next.js essential classes
  'next-',
  '__next',
  // React essential classes
  'react-',
  // Third-party library classes (if necessary)
  'swiper-',
  'react-datepicker',
  'react-select',
  'react-dropzone'
];

function checkForHardcodedClasses() {
  console.log('🔍 Checking for hardcoded CSS classes...\n');
  
  const srcDir = 'src';
  const tsxFiles = getAllFiles(srcDir, '.tsx');
  const tsFiles = getAllFiles(srcDir, '.ts');
  const allFiles = [...tsxFiles, ...tsFiles];
  
  let hasViolations = false;
  let totalViolations = 0;
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for hardcoded className usage
    const classNameMatches = content.match(/className="([^"]+)"/g);
    if (classNameMatches) {
      const violations = [];
      
      classNameMatches.forEach(match => {
        const className = match.match(/className="([^"]+)"/)[1];
        const classes = className.split(' ').filter(c => c.trim());
        
        classes.forEach(cls => {
          if (!isAllowedClassName(cls)) {
            violations.push(cls);
          }
        });
      });
      
      if (violations.length > 0) {
        console.error(`❌ ${file}: Found hardcoded classes`);
        console.error(`   Classes: ${violations.join(', ')}`);
        console.error(`   Use styled-components instead!`);
        console.error('');
        hasViolations = true;
        totalViolations += violations.length;
      }
    }
    
    // Check for hardcoded style objects
    const styleMatches = content.match(/style=\{\s*\{[^}]*\}/g);
    if (styleMatches) {
      console.error(`❌ ${file}: Found inline styles`);
      console.error(`   Use styled-components instead of inline styles!`);
      console.error('');
      hasViolations = true;
    }
    
    // Check for hardcoded color values
    const hardcodedColors = content.match(/#[0-9a-fA-F]{3,6}/g);
    if (hardcodedColors) {
      console.error(`❌ ${file}: Found hardcoded colors`);
      console.error(`   Colors: ${hardcodedColors.slice(0, 5).join(', ')}${hardcodedColors.length > 5 ? '...' : ''}`);
      console.error(`   Use design tokens instead!`);
      console.error('');
      hasViolations = true;
    }
  });
  
  if (hasViolations) {
    console.error('🚨 Styled-Components Violations Found!');
    console.error('');
    console.error(`Total violations: ${totalViolations}`);
    console.error('');
    console.error('Please fix these issues:');
    console.error('1. Replace className with styled-components');
    console.error('2. Remove inline styles');
    console.error('3. Use design tokens for colors');
    console.error('');
    console.error('Example fixes:');
    console.error('❌ <button className="btn btn-primary">Click</button>');
    console.error('✅ <StyledButton>Click</StyledButton>');
    console.error('');
    console.error('❌ style={{ backgroundColor: "#2563eb" }}');
    console.error('✅ background-color: var(--primary-color);');
    console.error('');
    console.error('See docs/development/ARCHITECTURE_GUARDRAILS.md for guidance.');
    process.exit(1);
  } else {
    console.log('✅ All files comply with styled-components architecture!');
    console.log('🎯 Clean, component-driven styling maintained.');
  }
}

function getAllFiles(dir, extension) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

function isAllowedClassName(className) {
  return ALLOWED_CLASSNAMES.some(allowed => 
    className.includes(allowed) || 
    className.startsWith(allowed) ||
    className.match(/^[a-z]+-[a-z0-9]+$/) // styled-components pattern
  );
}

// Run the check
checkForHardcodedClasses(); 