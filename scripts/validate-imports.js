#!/usr/bin/env node

/**
 * 🎯 Import Validation Script
 * 
 * Validates import consistency across the codebase
 * - Checks for relative imports within design system
 * - Validates casing consistency
 * - Prevents circular dependencies
 * - Enforces @/ui usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ImportValidator {
  constructor() {
    this.issues = [];
    this.stats = {
      filesChecked: 0,
      issuesFound: 0,
      relativeImports: 0,
      casingIssues: 0,
      circularImports: 0
    };
  }

  // Check if file is a TypeScript/JavaScript file
  isCodeFile(filename) {
    return /\.(ts|tsx|js|jsx)$/.test(filename);
  }

  // Check if file is in design system
  isDesignSystemFile(filepath) {
    return filepath.includes('src/design/components/ui-components/');
  }

  // Extract imports from file content
  extractImports(content) {
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  // Check for relative imports within design system
  checkRelativeImports(filepath, imports) {
    const issues = [];
    
    imports.forEach(importPath => {
      if ((importPath.startsWith('./') || importPath.startsWith('../')) && 
          this.isDesignSystemFile(filepath)) {
        
        // Check if importing design system components
        if (importPath.includes('ui-components') || 
            importPath.includes('Button') || 
            importPath.includes('Card') || 
            importPath.includes('Text') ||
            importPath.includes('Modal') ||
            importPath.includes('Badge') ||
            importPath.includes('Alert')) {
          
          issues.push({
            type: 'relative-import',
            message: `❌ Relative import "${importPath}" within design system. Use @/ui instead.`,
            suggestion: 'Replace with centralized @/ui import'
          });
        }
      }
    });

    return issues;
  }

  // Check for casing issues
  checkCasingIssues(imports) {
    const issues = [];
    
    imports.forEach(importPath => {
      if (importPath.includes('./button') || 
          importPath.includes('./card') || 
          importPath.includes('./text') ||
          importPath.includes('./modal') ||
          importPath.includes('./badge') ||
          importPath.includes('./alert')) {
        
        issues.push({
          type: 'casing-issue',
          message: `❌ Incorrect casing in import "${importPath}". Use PascalCase for component files.`,
          suggestion: 'Fix casing: ./button → ./Button'
        });
      }
    });

    return issues;
  }

  // Check for circular imports
  checkCircularImports(filepath, imports) {
    const issues = [];
    
    if (this.isDesignSystemFile(filepath)) {
      imports.forEach(importPath => {
        if (importPath.includes('src/design/components/ui-components/')) {
          issues.push({
            type: 'circular-import',
            message: `❌ Circular import detected: "${importPath}"`,
            suggestion: 'Use @/ui instead of relative imports within design system'
          });
        }
      });
    }

    return issues;
  }

  // Validate a single file
  validateFile(filepath) {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const imports = this.extractImports(content);
      
      const issues = [
        ...this.checkRelativeImports(filepath, imports),
        ...this.checkCasingIssues(imports),
        ...this.checkCircularImports(filepath, imports)
      ];

      if (issues.length > 0) {
        this.issues.push({
          file: filepath,
          issues: issues
        });
        
        this.stats.issuesFound += issues.length;
        this.stats.relativeImports += issues.filter(i => i.type === 'relative-import').length;
        this.stats.casingIssues += issues.filter(i => i.type === 'casing-issue').length;
        this.stats.circularImports += issues.filter(i => i.type === 'circular-import').length;
      }

      this.stats.filesChecked++;
    } catch (error) {
      console.error(`${colors.red}Error reading file ${filepath}:${colors.reset}`, error.message);
    }
  }

  // Recursively scan directory
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          this.scanDirectory(filepath);
        }
      } else if (this.isCodeFile(file)) {
        this.validateFile(filepath);
      }
    });
  }

  // Print results
  printResults() {
    console.log(`\n${colors.bold}🎯 Import Validation Results${colors.reset}\n`);
    
    if (this.issues.length === 0) {
      console.log(`${colors.green}✅ All imports are consistent!${colors.reset}\n`);
      console.log(`📊 Stats:`);
      console.log(`   Files checked: ${this.stats.filesChecked}`);
      console.log(`   Issues found: ${this.stats.issuesFound}`);
      return;
    }

    console.log(`${colors.red}❌ Found ${this.stats.issuesFound} import issues:${colors.reset}\n`);

    this.issues.forEach(({ file, issues }) => {
      console.log(`${colors.blue}📁 ${file}${colors.reset}`);
      issues.forEach(issue => {
        console.log(`   ${issue.message}`);
        console.log(`   💡 ${issue.suggestion}\n`);
      });
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Files checked: ${this.stats.filesChecked}`);
    console.log(`   Total issues: ${this.stats.issuesFound}`);
    console.log(`   Relative imports: ${this.stats.relativeImports}`);
    console.log(`   Casing issues: ${this.stats.casingIssues}`);
    console.log(`   Circular imports: ${this.stats.circularImports}`);

    console.log(`\n${colors.yellow}💡 To fix these issues:${colors.reset}`);
    console.log(`   1. Replace relative imports with @/ui`);
    console.log(`   2. Fix casing: ./button → ./Button`);
    console.log(`   3. Use centralized imports for design system components`);
  }

  // Run validation
  run() {
    console.log(`${colors.bold}🔍 Scanning for import consistency issues...${colors.reset}\n`);
    
    const projectRoot = path.resolve(__dirname, '..');
    this.scanDirectory(path.join(projectRoot, 'src'));
    
    this.printResults();
    
    // Exit with error code if issues found
    if (this.issues.length > 0) {
      process.exit(1);
    }
  }
}

// Run the validator
const validator = new ImportValidator();
validator.run(); 