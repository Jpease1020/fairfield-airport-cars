#!/usr/bin/env node

/**
 * Grid System Migration Analyzer
 * 
 * Analyzes the design directory to identify components that need migration
 * to the new flexbox-based grid system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Design tokens for analysis
const DESIGN_DIR = path.join(__dirname, '../../src/design/components');
const OUTPUT_FILE = path.join(__dirname, '../../reports/grid-migration-analysis.json');

// Patterns to look for
const PATTERNS = {
  FLEXBOX: /display:\s*flex/gi,
  GRID: /display:\s*grid/gi,
  STYLED_COMPONENTS: /styled\.div/gi,
  INLINE_STYLES: /style=\{\{[^}]*display[^}]*\}/gi,
  OLD_GRID: /Grid\s+cols=/gi,
  OLD_CONTAINER: /Container\s+maxWidth=/gi,
  OLD_STACK: /Stack\s+direction=/gi,
};

// Component categories
const CATEGORIES = {
  LAYOUT: 'layout',
  UI_COMPONENTS: 'ui-components',
  FORMS: 'forms',
  SECTIONS: 'sections',
  NOTIFICATIONS: 'notifications',
  ICONS: 'icons',
  PROVIDERS: 'providers',
};

// Priority levels
const PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const analysis = {
    file: relativePath,
    category: getCategory(filePath),
    priority: PRIORITIES.LOW,
    issues: [],
    migrationEffort: 'low',
    impact: 'low',
    readyForMigration: false,
  };

  // Check for flexbox usage
  if (PATTERNS.FLEXBOX.test(content)) {
    analysis.issues.push('Uses flexbox with hardcoded styles');
    analysis.priority = PRIORITIES.HIGH;
    analysis.migrationEffort = 'medium';
    analysis.readyForMigration = true;
  }

  // Check for CSS Grid usage
  if (PATTERNS.GRID.test(content)) {
    analysis.issues.push('Uses CSS Grid - needs flexbox migration');
    analysis.priority = PRIORITIES.HIGH;
    analysis.migrationEffort = 'medium';
    analysis.readyForMigration = true;
  }

  // Check for styled-components
  if (PATTERNS.STYLED_COMPONENTS.test(content)) {
    analysis.issues.push('Uses styled-components for layout');
    analysis.migrationEffort = 'high';
  }

  // Check for inline styles
  if (PATTERNS.INLINE_STYLES.test(content)) {
    analysis.issues.push('Uses inline styles for layout');
    analysis.priority = PRIORITIES.MEDIUM;
    analysis.readyForMigration = true;
  }

  // Check for old grid system usage
  if (PATTERNS.OLD_GRID.test(content)) {
    analysis.issues.push('Uses old Grid component');
    analysis.priority = PRIORITIES.CRITICAL;
    analysis.readyForMigration = true;
  }

  // Check for old container usage
  if (PATTERNS.OLD_CONTAINER.test(content)) {
    analysis.issues.push('Uses old Container component');
    analysis.priority = PRIORITIES.HIGH;
    analysis.readyForMigration = true;
  }

  // Check for old stack usage
  if (PATTERNS.OLD_STACK.test(content)) {
    analysis.issues.push('Uses old Stack component');
    analysis.priority = PRIORITIES.MEDIUM;
    analysis.readyForMigration = true;
  }

  // Determine impact based on category
  if (analysis.category === CATEGORIES.LAYOUT) {
    analysis.impact = 'high';
    analysis.priority = analysis.priority === PRIORITIES.LOW ? PRIORITIES.HIGH : analysis.priority;
  }

  return analysis;
}

function getCategory(filePath) {
  if (filePath.includes('/layout/')) return CATEGORIES.LAYOUT;
  if (filePath.includes('/ui-components/')) return CATEGORIES.UI_COMPONENTS;
  if (filePath.includes('/forms/')) return CATEGORIES.FORMS;
  if (filePath.includes('/sections/')) return CATEGORIES.SECTIONS;
  if (filePath.includes('/notifications/')) return CATEGORIES.NOTIFICATIONS;
  if (filePath.includes('/icons/')) return CATEGORIES.ICONS;
  if (filePath.includes('/providers/')) return CATEGORIES.PROVIDERS;
  return 'unknown';
}

function findComponents(dir) {
  const components = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        components.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return components;
}

function generateReport(analyses) {
  const report = {
    summary: {
      totalComponents: analyses.length,
      readyForMigration: analyses.filter(a => a.readyForMigration).length,
      criticalPriority: analyses.filter(a => a.priority === PRIORITIES.CRITICAL).length,
      highPriority: analyses.filter(a => a.priority === PRIORITIES.HIGH).length,
      mediumPriority: analyses.filter(a => a.priority === PRIORITIES.MEDIUM).length,
      lowPriority: analyses.filter(a => a.priority === PRIORITIES.LOW).length,
    },
    byPriority: {
      critical: analyses.filter(a => a.priority === PRIORITIES.CRITICAL),
      high: analyses.filter(a => a.priority === PRIORITIES.HIGH),
      medium: analyses.filter(a => a.priority === PRIORITIES.MEDIUM),
      low: analyses.filter(a => a.priority === PRIORITIES.LOW),
    },
    byCategory: {
      layout: analyses.filter(a => a.category === CATEGORIES.LAYOUT),
      uiComponents: analyses.filter(a => a.category === CATEGORIES.UI_COMPONENTS),
      forms: analyses.filter(a => a.category === CATEGORIES.FORMS),
      sections: analyses.filter(a => a.category === CATEGORIES.SECTIONS),
      notifications: analyses.filter(a => a.category === CATEGORIES.NOTIFICATIONS),
      icons: analyses.filter(a => a.category === CATEGORIES.ICONS),
      providers: analyses.filter(a => a.category === CATEGORIES.PROVIDERS),
    },
    readyForMigration: analyses.filter(a => a.readyForMigration),
    allAnalyses: analyses,
  };

  return report;
}

function printSummary(report) {
  console.log('\n🎯 Grid System Migration Analysis Summary');
  console.log('==========================================\n');
  
  console.log(`📊 Total Components: ${report.summary.totalComponents}`);
  console.log(`✅ Ready for Migration: ${report.summary.readyForMigration}`);
  console.log(`🚨 Critical Priority: ${report.summary.criticalPriority}`);
  console.log(`🔥 High Priority: ${report.summary.highPriority}`);
  console.log(`⚡ Medium Priority: ${report.summary.mediumPriority}`);
  console.log(`📝 Low Priority: ${report.summary.lowPriority}`);
  
  console.log('\n🚀 Ready for Migration (Critical & High Priority):');
  console.log('==================================================');
  
  const readyComponents = report.readyForMigration
    .filter(a => a.priority === PRIORITIES.CRITICAL || a.priority === PRIORITIES.HIGH)
    .sort((a, b) => {
      if (a.priority === PRIORITIES.CRITICAL && b.priority !== PRIORITIES.CRITICAL) return -1;
      if (b.priority === PRIORITIES.CRITICAL && a.priority !== PRIORITIES.CRITICAL) return 1;
      return 0;
    });
  
  readyComponents.forEach(component => {
    const priorityIcon = component.priority === PRIORITIES.CRITICAL ? '🚨' : '🔥';
    console.log(`${priorityIcon} ${component.file}`);
    component.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log('');
  });
  
  console.log('\n📋 Migration Timeline Recommendation:');
  console.log('====================================');
  console.log('Week 1: Layout components (Navigation, Footer, PageLayout)');
  console.log('Week 2: Section components (HeroSection, ContactSection)');
  console.log('Week 3: UI components (Card, BookingCard, DataTable)');
  console.log('Week 4: Form components and testing');
}

function main() {
  console.log('🔍 Analyzing design components for grid system migration...\n');
  
  try {
    // Find all components
    const components = findComponents(DESIGN_DIR);
    console.log(`Found ${components.length} components to analyze`);
    
    // Analyze each component
    const analyses = components.map(analyzeFile);
    
    // Generate report
    const report = generateReport(analyses);
    
    // Save report to file
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${OUTPUT_FILE}`);
    
    // Print summary
    printSummary(report);
    
  } catch (error) {
    console.error('❌ Error analyzing components:', error.message);
    process.exit(1);
  }
}

main(); 