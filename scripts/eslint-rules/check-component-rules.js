#!/usr/bin/env node

/**
 * Component Rules Checker
 * 
 * This script enforces our design system rules:
 * - No className in reusable components
 * - No div/span/p for structure
 * - Proper component usage
 * - Correct imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Configuration
const CONFIG = {
  // Directories to check
  checkDirs: [
    'src/components/admin',
    'src/components/booking',
    'src/components/feedback',
    'src/components/forms',
    'src/components/layout',
    'src/components/marketing',
    'src/app'
  ],
  
  // File extensions to check
  extensions: ['.tsx', '.ts'],
  
  // Exclude patterns
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    'test-results',
    'playwright-report',
    'src/components/ui' // Exclude reusable UI components
  ]
};

// Violation types
const VIOLATION_TYPES = {
  CLASSNAME_IN_REUSABLE: 'className in reusable component',
  GENERIC_HTML_STRUCTURE: 'generic HTML for structure',
  WRONG_IMPORT: 'wrong import path',
  INLINE_STYLE: 'inline style on reusable component',
  MISSING_COMPONENT: 'missing component usage'
};

// Rules to check
const RULES = {
  // Forbidden patterns in reusable components
  forbiddenPatterns: [
    {
      name: 'className prop in reusable component',
      pattern: /className\s*=\s*\{[^}]+\}/g,
      message: '❌ FORBIDDEN: className prop in reusable component. Use component props instead.',
      severity: 'error'
    },
    {
      name: 'className prop on design system components',
      pattern: /<(Container|Stack|Card|Grid|Text|Span|H[1-6])\s+[^>]*className\s*=/g,
      message: '❌ FORBIDDEN: className prop on design system components. Use component props (variant, size, spacing, etc.) instead.',
      severity: 'error'
    },
    {
      name: 'unnecessary nested containers',
      pattern: /<Container[^>]*>\s*<Container[^>]*>/g,
      message: '❌ FORBIDDEN: Unnecessary nested Container components. Simplify structure.',
      severity: 'error'
    },
    {
      name: 'unnecessary nested stacks',
      pattern: /<Stack[^>]*>\s*<Stack[^>]*>/g,
      message: '❌ FORBIDDEN: Unnecessary nested Stack components. Simplify structure.',
      severity: 'error'
    },
    {
      name: 'unnecessary nested cards',
      pattern: /<Card[^>]*>\s*<Card[^>]*>/g,
      message: '❌ FORBIDDEN: Unnecessary nested Card components. Simplify structure.',
      severity: 'error'
    },
    {
      name: 'div tag for structure',
      pattern: /<div[^>]*>/g,
      message: '❌ FORBIDDEN: div tag for structure. Use Container, Stack, or Card instead.',
      severity: 'error'
    },
    {
      name: 'span tag for text',
      pattern: /<span[^>]*>/g,
      message: '❌ FORBIDDEN: span tag for text. Use Span component instead.',
      severity: 'error'
    },
    {
      name: 'p tag for text',
      pattern: /<p[^>]*>/g,
      message: '❌ FORBIDDEN: p tag for text. Use Text component instead.',
      severity: 'error'
    },
    {
      name: 'h1-h6 tags for headings',
      pattern: /<h[1-6][^>]*>/g,
      message: '❌ FORBIDDEN: h1-h6 tags for headings. Use H1, H2, H3, H4, H5, H6 components instead.',
      severity: 'error'
    },
    {
      name: 'section tag for structure',
      pattern: /<section[^>]*>/g,
      message: '❌ FORBIDDEN: section tag for structure. Use Section component instead.',
      severity: 'error'
    },
    {
      name: 'article tag for structure',
      pattern: /<article[^>]*>/g,
      message: '❌ FORBIDDEN: article tag for structure. Use Card component instead.',
      severity: 'error'
    },
    {
      name: 'header tag for structure',
      pattern: /<header[^>]*>/g,
      message: '❌ FORBIDDEN: header tag for structure. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'footer tag for structure',
      pattern: /<footer[^>]*>/g,
      message: '❌ FORBIDDEN: footer tag for structure. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'main tag for structure',
      pattern: /<main[^>]*>/g,
      message: '❌ FORBIDDEN: main tag for structure. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'aside tag for structure',
      pattern: /<aside[^>]*>/g,
      message: '❌ FORBIDDEN: aside tag for structure. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'nav tag for structure',
      pattern: /<nav[^>]*>/g,
      message: '❌ FORBIDDEN: nav tag for structure. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'hardcoded text that should be editable',
      pattern: /<Text[^>]*>[^<]*[a-zA-Z][^<]*<\/Text>/g,
      message: '⚠️  WARNING: Hardcoded text detected. Consider using EditableText for database-driven content.',
      severity: 'warning'
    },
    {
      name: 'hardcoded span text',
      pattern: /<Span[^>]*>[^<]*[a-zA-Z][^<]*<\/Span>/g,
      message: '⚠️  WARNING: Hardcoded text detected. Consider using EditableText for database-driven content.',
      severity: 'warning'
    },
    {
      name: 'hardcoded heading text',
      pattern: /<H[1-6][^>]*>[^<]*[a-zA-Z][^<]*<\/H[1-6]>/g,
      message: '⚠️  WARNING: Hardcoded text detected. Consider using EditableText for database-driven content.',
      severity: 'warning'
    },
    {
      name: 'hardcoded text in buttons',
      pattern: /<Button[^>]*>[^<]*[a-zA-Z][^<]*<\/Button>/g,
      message: '⚠️  WARNING: Hardcoded button text detected. Consider using EditableText for database-driven content.',
      severity: 'warning'
    },
    {
      name: 'ul/ol tags for lists',
      pattern: /<(ul|ol)[^>]*>/g,
      message: '❌ FORBIDDEN: ul/ol tags for lists. Use Stack component instead.',
      severity: 'error'
    },
    {
      name: 'li tag for list items',
      pattern: /<li[^>]*>/g,
      message: '❌ FORBIDDEN: li tag for list items. Use Container component instead.',
      severity: 'error'
    },
    {
      name: 'table tags for data',
      pattern: /<(table|thead|tbody|tr|th|td)[^>]*>/g,
      message: '❌ FORBIDDEN: table tags for data. Use design system table components instead.',
      severity: 'error'
    },
    {
      name: 'form tag for forms',
      pattern: /<form[^>]*>/g,
      message: '❌ FORBIDDEN: form tag for forms. Use Form component instead.',
      severity: 'error'
    },
    {
      name: 'input tag for inputs',
      pattern: /<input[^>]*>/g,
      message: '❌ FORBIDDEN: input tag for inputs. Use Input component instead.',
      severity: 'error'
    },
    {
      name: 'textarea tag for textareas',
      pattern: /<textarea[^>]*>/g,
      message: '❌ FORBIDDEN: textarea tag for textareas. Use Textarea component instead.',
      severity: 'error'
    },
    {
      name: 'select tag for selects',
      pattern: /<select[^>]*>/g,
      message: '❌ FORBIDDEN: select tag for selects. Use Select component instead.',
      severity: 'error'
    },
    {
      name: 'label tag for labels',
      pattern: /<label[^>]*>/g,
      message: '❌ FORBIDDEN: label tag for labels. Use Label component instead.',
      severity: 'error'
    },
    {
      name: 'fieldset tag for fieldsets',
      pattern: /<fieldset[^>]*>/g,
      message: '❌ FORBIDDEN: fieldset tag for fieldsets. Use Fieldset component instead.',
      severity: 'error'
    },
    {
      name: 'legend tag for legends',
      pattern: /<legend[^>]*>/g,
      message: '❌ FORBIDDEN: legend tag for legends. Use Legend component instead.',
      severity: 'error'
    },
    {
      name: 'a tag for links',
      pattern: /<a[^>]*>/g,
      message: '❌ FORBIDDEN: a tag for links. Use Link component instead.',
      severity: 'error'
    },
    {
      name: 'img tag for images',
      pattern: /<img[^>]*>/g,
      message: '❌ FORBIDDEN: img tag for images. Use Image component instead.',
      severity: 'error'
    },
    {
      name: 'button tag for buttons',
      pattern: /<button[^>]*>/g,
      message: '❌ FORBIDDEN: button tag for buttons. Use Button component instead.',
      severity: 'error'
    },
    {
      name: 'inline style',
      pattern: /style\s*=\s*\{[^}]+\}/g,
      message: '❌ FORBIDDEN: inline style on reusable component. Use component props instead.',
      severity: 'error'
    }
  ],
  
  // Required patterns (should be present)
  requiredPatterns: [
    {
      name: 'Container import',
      pattern: /import.*Container.*from.*@\/components\/ui/g,
      message: '✅ CORRECT: Container imported from @/components/ui',
      severity: 'info'
    },
    {
      name: 'Stack import',
      pattern: /import.*Stack.*from.*@\/components\/ui\/containers/g,
      message: '✅ CORRECT: Stack imported from @/components/ui/containers',
      severity: 'info'
    },
    {
      name: 'Card import',
      pattern: /import.*Card.*from.*@\/components\/ui\/containers/g,
      message: '✅ CORRECT: Card imported from @/components/ui/containers',
      severity: 'info'
    }
  ],
  
  // Wrong import patterns
  wrongImports: [
    {
      name: 'Stack from wrong path',
      pattern: /import.*Stack.*from.*@\/components\/ui\/containers/g,
      message: '❌ WRONG: Stack should be imported from @/components/ui/layout/containers',
      severity: 'error'
    },
    {
      name: 'Card from wrong path',
      pattern: /import.*Card.*from.*@\/components\/ui\/containers/g,
      message: '❌ WRONG: Card should be imported from @/components/ui/layout/containers',
      severity: 'error'
    }
  ]
};

class ComponentRulesChecker {
  constructor() {
    this.violations = [];
    this.stats = {
      filesChecked: 0,
      violationsFound: 0,
      filesWithViolations: 0
    };
  }

  // Get all TypeScript/TSX files to check
  getFilesToCheck() {
    const files = [];
    
    for (const dir of CONFIG.checkDirs) {
      if (!fs.existsSync(dir)) continue;
      
      this.walkDir(dir, (filePath) => {
        const ext = path.extname(filePath);
        if (CONFIG.extensions.includes(ext)) {
          // Check if file should be excluded
          const shouldExclude = CONFIG.excludePatterns.some(pattern => 
            filePath.includes(pattern)
          );
          
          if (!shouldExclude) {
            files.push(filePath);
          }
        }
      });
    }
    
    return files;
  }

  // Recursively walk directory
  walkDir(dir, callback) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.walkDir(fullPath, callback);
      } else {
        callback(fullPath);
      }
    }
  }

  // Check a single file for violations
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const violations = [];
      
      // Check forbidden patterns
      for (const rule of RULES.forbiddenPatterns) {
        const matches = content.match(rule.pattern);
        if (matches) {
          for (const match of matches) {
            const lineNumber = this.findLineNumber(content, match);
            violations.push({
              type: rule.name,
              message: rule.message,
              severity: rule.severity,
              line: lineNumber,
              match: match.trim(),
              file: filePath
            });
          }
        }
      }
      
      // Check wrong imports
      for (const rule of RULES.wrongImports) {
        const matches = content.match(rule.pattern);
        if (matches) {
          for (const match of matches) {
            const lineNumber = this.findLineNumber(content, match);
            violations.push({
              type: rule.name,
              message: rule.message,
              severity: rule.severity,
              line: lineNumber,
              match: match.trim(),
              file: filePath
            });
          }
        }
      }
      
      return violations;
    } catch (error) {
      console.error(`${colors.red}Error reading file ${filePath}:${colors.reset}`, error.message);
      return [];
    }
  }

  // Find line number for a match
  findLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 1;
  }

  // Run the checker
  run() {
    console.log(`${colors.bold}${colors.blue}🔍 Component Rules Checker${colors.reset}\n`);
    
    const files = this.getFilesToCheck();
    console.log(`📁 Checking ${files.length} files...\n`);
    
    for (const file of files) {
      const violations = this.checkFile(file);
      if (violations.length > 0) {
        this.violations.push(...violations);
        this.stats.filesWithViolations++;
      }
      this.stats.filesChecked++;
    }
    
    this.stats.violationsFound = this.violations.length;
    
    this.printResults();
    this.printSummary();
    
    return this.stats.violationsFound === 0;
  }

  // Print detailed results
  printResults() {
    if (this.violations.length === 0) {
      console.log(`${colors.green}✅ No violations found!${colors.reset}\n`);
      return;
    }
    
    console.log(`${colors.red}❌ Found ${this.violations.length} violations:${colors.reset}\n`);
    
    // Group violations by file
    const violationsByFile = {};
    for (const violation of this.violations) {
      if (!violationsByFile[violation.file]) {
        violationsByFile[violation.file] = [];
      }
      violationsByFile[violation.file].push(violation);
    }
    
    // Print violations grouped by file
    for (const [file, violations] of Object.entries(violationsByFile)) {
      console.log(`${colors.bold}${colors.yellow}📄 ${file}${colors.reset}`);
      
      for (const violation of violations) {
        const severityColor = violation.severity === 'error' ? colors.red : colors.yellow;
        console.log(`  ${severityColor}Line ${violation.line}:${colors.reset} ${violation.message}`);
        console.log(`    ${colors.cyan}Found:${colors.reset} ${violation.match}`);
      }
      console.log('');
    }
  }

  // Print summary
  printSummary() {
    console.log(`${colors.bold}📊 Summary:${colors.reset}`);
    console.log(`  📁 Files checked: ${this.stats.filesChecked}`);
    console.log(`  ❌ Files with violations: ${this.stats.filesWithViolations}`);
    console.log(`  🚨 Total violations: ${this.stats.violationsFound}`);
    
    if (this.stats.violationsFound > 0) {
      console.log(`\n${colors.red}${colors.bold}🚨 BLOCKED: Fix violations before committing!${colors.reset}`);
      console.log(`\n${colors.yellow}💡 Quick fixes:${colors.reset}`);
      console.log(`  • Replace className with component props (variant, size, spacing)`);
      console.log(`  • Replace <div> with Container, Stack, or Card`);
      console.log(`  • Replace <span> with Span component`);
      console.log(`  • Replace <p> with Text component`);
      console.log(`  • Fix imports: Stack/Card from @/components/ui/containers`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}✅ All good! Ready to commit.${colors.reset}`);
    }
  }
}

// Main execution
if (require.main === module) {
  const checker = new ComponentRulesChecker();
  const success = checker.run();
  
  if (!success) {
    console.log(`\n${colors.red}${colors.bold}🚨 COMMIT BLOCKED${colors.reset}`);
    console.log(`Fix the violations above before committing.`);
    process.exit(1);
  }
}

module.exports = ComponentRulesChecker; 