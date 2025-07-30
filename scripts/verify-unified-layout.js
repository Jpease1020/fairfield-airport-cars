#!/usr/bin/env node

/**
 * 🔍 UNIFIED LAYOUT VERIFICATION SCRIPT
 * 
 * Ensures every single page uses the UnifiedLayout system
 * Verifies 100% consistency across the entire application
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function findAllPages() {
  // Find all page.tsx files
  const pageFiles = glob.sync('src/app/**/page.tsx', { 
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
  });
  
  return pageFiles;
}

function verifyPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const results = {
    path: filePath,
    usesUnifiedLayout: content.includes('UnifiedLayout'),
    usesLegacyLayout: content.includes('UniversalLayout') || content.includes('LayoutEnforcer'),
    usesCMSLayout: content.includes('CMSStandardPage') || content.includes('CMSMarketingPage'),
    hasLayout: content.includes('Layout'),
    isEmpty: content.trim().length < 100,
    hasProperImport: content.includes("from '@/components/layout'"),
    layoutType: extractLayoutType(content),
    title: extractTitle(content),
    status: 'unknown'
  };
  
  // Determine status
  if (results.isEmpty) {
    results.status = 'empty';
  } else if (results.usesUnifiedLayout && !results.usesLegacyLayout && !results.usesCMSLayout) {
    results.status = 'compliant';
  } else if (results.usesLegacyLayout || results.usesCMSLayout) {
    results.status = 'needs_migration';
  } else if (!results.hasLayout) {
    results.status = 'no_layout';
  } else {
    results.status = 'unknown_layout';
  }
  
  return results;
}

function extractLayoutType(content) {
  const match = content.match(/layoutType=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function extractTitle(content) {
  const match = content.match(/title=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function generateReport(results) {
  const compliant = results.filter(r => r.status === 'compliant');
  const needsMigration = results.filter(r => r.status === 'needs_migration');
  const noLayout = results.filter(r => r.status === 'no_layout');
  const empty = results.filter(r => r.status === 'empty');
  const unknown = results.filter(r => r.status === 'unknown_layout');
  
  console.log('🎯 UNIFIED LAYOUT VERIFICATION REPORT\n');
  console.log('=' + '='.repeat(50));
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Total Pages: ${results.length}`);
  console.log(`   ✅ Compliant: ${compliant.length}`);
  console.log(`   ⚠️  Needs Migration: ${needsMigration.length}`);
  console.log(`   ❌ No Layout: ${noLayout.length}`);
  console.log(`   📄 Empty/Template: ${empty.length}`);
  console.log(`   ❓ Unknown: ${unknown.length}`);
  
  // Compliance percentage
  const complianceRate = Math.round((compliant.length / (results.length - empty.length)) * 100);
  console.log(`\n🎯 COMPLIANCE RATE: ${complianceRate}%`);
  
  // Compliant pages
  if (compliant.length > 0) {
    console.log('\n✅ COMPLIANT PAGES:');
    compliant.forEach(page => {
      console.log(`   • ${page.path} (${page.layoutType || 'no type'}) - "${page.title || 'no title'}"`);
    });
  }
  
  // Pages needing migration
  if (needsMigration.length > 0) {
    console.log('\n⚠️  PAGES NEEDING MIGRATION:');
    needsMigration.forEach(page => {
      const issues = [];
      if (page.usesLegacyLayout) issues.push('Legacy Layout');
      if (page.usesCMSLayout) issues.push('CMS Layout');
      console.log(`   • ${page.path} - Issues: ${issues.join(', ')}`);
    });
  }
  
  // Pages with no layout
  if (noLayout.length > 0) {
    console.log('\n❌ PAGES WITH NO LAYOUT:');
    noLayout.forEach(page => {
      console.log(`   • ${page.path}`);
    });
  }
  
  // Layout type distribution
  console.log('\n📈 LAYOUT TYPE DISTRIBUTION:');
  const layoutTypes = compliant.reduce((acc, page) => {
    const type = page.layoutType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(layoutTypes).forEach(([type, count]) => {
    console.log(`   • ${type}: ${count} pages`);
  });
  
  // Success status
  console.log('\n' + '='.repeat(52));
  if (complianceRate === 100) {
    console.log('🎉 SUCCESS: ALL pages use the UnifiedLayout system!');
    console.log('✅ Complete consistency achieved across the application!');
  } else {
    console.log(`⚠️  ${needsMigration.length + noLayout.length} pages still need to be updated`);
    console.log('🎯 Run the migration script to achieve 100% compliance');
  }
  console.log('=' + '='.repeat(50));
  
  return complianceRate === 100;
}

function main() {
  console.log('🔍 Scanning all pages for UnifiedLayout compliance...\n');
  
  const allPages = findAllPages();
  const results = allPages.map(verifyPage);
  
  const isFullyCompliant = generateReport(results);
  
  // Exit with appropriate code
  process.exit(isFullyCompliant ? 0 : 1);
}

if (require.main === module) {
  main();
} 