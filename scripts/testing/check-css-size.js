#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CSS Size Checker - Prevents CSS Antipatterns
 * 
 * This script enforces our architecture guardrails:
 * - CSS files must be < 200 lines
 * - No hardcoded CSS classes
 * - Only CSS variables and essential styles
 */

const CSS_FILE_LIMIT = 200;
const HARDCODED_CLASS_LIMIT = 10;

function checkCSSFiles() {
  console.log('🔍 Checking CSS architecture compliance...\n');
  
  const cssFiles = [
    'src/styles/standard-layout.css',
    'src/app/globals.css',
    'src/styles/page-editable.css'
  ];
  
  let hasViolations = false;
  
  cssFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  ${file}: File not found (skipping)`);
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    
    console.log(`📄 ${file}: ${lines} lines`);
    
    // Check file size
    if (lines > CSS_FILE_LIMIT) {
      console.error(`❌ ${file}: ${lines} lines (MAX: ${CSS_FILE_LIMIT})`);
      console.error(`   This violates our architecture guardrails!`);
      console.error(`   Convert to styled-components instead.`);
      hasViolations = true;
    } else {
      console.log(`✅ ${file}: Size OK (${lines}/${CSS_FILE_LIMIT} lines)`);
    }
    
    // Check for hardcoded classes
    const hardcodedClasses = content.match(/\.\w+\s*\{/g);
    if (hardcodedClasses && hardcodedClasses.length > HARDCODED_CLASS_LIMIT) {
      console.error(`❌ ${file}: ${hardcodedClasses.length} hardcoded classes (MAX: ${HARDCODED_CLASS_LIMIT})`);
      console.error(`   Classes found: ${hardcodedClasses.slice(0, 5).join(', ')}${hardcodedClasses.length > 5 ? '...' : ''}`);
      console.error(`   Use styled-components instead of CSS classes!`);
      hasViolations = true;
    } else if (hardcodedClasses && hardcodedClasses.length > 0) {
      console.log(`⚠️  ${file}: ${hardcodedClasses.length} hardcoded classes (consider converting to styled-components)`);
    } else {
      console.log(`✅ ${file}: No hardcoded classes found`);
    }
    
    // Check for CSS variables usage
    const cssVariables = content.match(/var\(--[^)]+\)/g);
    if (cssVariables) {
      console.log(`✅ ${file}: Using CSS variables (${cssVariables.length} found)`);
    } else {
      console.log(`⚠️  ${file}: No CSS variables found (consider using design tokens)`);
    }
    
    console.log('');
  });
  
  if (hasViolations) {
    console.error('🚨 CSS Architecture Violations Found!');
    console.error('');
    console.error('Please fix these issues:');
    console.error('1. Convert large CSS files to styled-components');
    console.error('2. Remove hardcoded CSS classes');
    console.error('3. Use design tokens and CSS variables');
    console.error('');
    console.error('See docs/development/ARCHITECTURE_GUARDRAILS.md for guidance.');
    process.exit(1);
  } else {
    console.log('✅ All CSS files comply with architecture guardrails!');
    console.log('🎯 Clean, component-driven styling maintained.');
  }
}

// Run the check
checkCSSFiles(); 