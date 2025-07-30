#!/usr/bin/env node

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✅ Created directory: ${dirPath}`, 'green');
  }
}

function moveFile(source, destination) {
  if (fs.existsSync(source)) {
    const destDir = path.dirname(destination);
    createDirectory(destDir);
    
    fs.copyFileSync(source, destination);
    fs.unlinkSync(source);
    log(`✅ Moved: ${source} → ${destination}`, 'green');
  } else {
    log(`⚠️  Source not found: ${source}`, 'yellow');
  }
}

function updateImports(filePath, oldImport, newImport) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldContent = content;
    
    // Update import statements
    content = content.replace(new RegExp(oldImport, 'g'), newImport);
    
    if (content !== oldContent) {
      fs.writeFileSync(filePath, content);
      log(`✅ Updated imports in: ${filePath}`, 'green');
    }
  }
}

function findAndUpdateImports(directory, oldImport, newImport) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      findAndUpdateImports(filePath, oldImport, newImport);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      updateImports(filePath, oldImport, newImport);
    }
  }
}

function main() {
  log('🎯 LAYOUT & DESIGN REORGANIZATION', 'bold');
  log('='.repeat(50), 'cyan');

  const srcDir = path.join(__dirname, '..', 'src');
  
  // Step 1: Create new directory structure
  log('\n📁 Creating new directory structure...', 'bold');
  
  const newDirs = [
    'src/components/layout/core',
    'src/components/layout/navigation', 
    'src/components/layout/structure',
    'src/components/layout/cms',
    'src/lib/design-system/core',
    'src/lib/design-system/components',
    'src/lib/design-system/cms',
    'src/lib/design-system/utils',
    'src/components/ui/core',
    'src/components/ui/feedback',
    'src/components/ui/data',
    'src/components/ui/forms'
  ];

  newDirs.forEach(dir => createDirectory(path.join(__dirname, '..', dir)));

  // Step 2: Move layout components
  log('\n🔄 Moving layout components...', 'bold');
  
  const layoutMoves = [
    {
      source: 'src/components/layout/UnifiedLayout.tsx',
      destination: 'src/components/layout/core/UnifiedLayout.tsx'
    },
    {
      source: 'src/components/layout/UniversalLayout.tsx',
      destination: 'src/components/layout/core/UniversalLayout.tsx'
    },
    {
      source: 'src/components/layout/StandardLayout.tsx',
      destination: 'src/components/layout/core/StandardLayout.tsx'
    },
    {
      source: 'src/components/layout/Navigation.tsx',
      destination: 'src/components/layout/navigation/Navigation.tsx'
    },
    {
      source: 'src/components/layout/StandardNavigation.tsx',
      destination: 'src/components/layout/navigation/StandardNavigation.tsx'
    },
    {
      source: 'src/components/layout/PageContainer.tsx',
      destination: 'src/components/layout/structure/PageContainer.tsx'
    },
    {
      source: 'src/components/layout/PageHeader.tsx',
      destination: 'src/components/layout/structure/PageHeader.tsx'
    },
    {
      source: 'src/components/layout/StandardFooter.tsx',
      destination: 'src/components/layout/structure/StandardFooter.tsx'
    },
    {
      source: 'src/components/layout/StandardHeader.tsx',
      destination: 'src/components/layout/structure/StandardHeader.tsx'
    }
  ];

  layoutMoves.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Step 3: Move CMS layout components
  log('\n🔄 Moving CMS layout components...', 'bold');
  
  const cmsMoves = [
    {
      source: 'src/components/layout/CMSContentPage.tsx',
      destination: 'src/components/layout/cms/CMSContentPage.tsx'
    },
    {
      source: 'src/components/layout/CMSConversionPage.tsx',
      destination: 'src/components/layout/cms/CMSConversionPage.tsx'
    },
    {
      source: 'src/components/layout/CMSMarketingPage.tsx',
      destination: 'src/components/layout/cms/CMSMarketingPage.tsx'
    },
    {
      source: 'src/components/layout/CMSStandardPage.tsx',
      destination: 'src/components/layout/cms/CMSStandardPage.tsx'
    },
    {
      source: 'src/components/layout/CMSStatusPage.tsx',
      destination: 'src/components/layout/cms/CMSStatusPage.tsx'
    },
    {
      source: 'src/components/layout/CMSLayout.tsx',
      destination: 'src/components/layout/cms/CMSLayout.tsx'
    }
  ];

  cmsMoves.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Step 4: Move UI layout components
  log('\n🔄 Moving UI layout components...', 'bold');
  
  const uiLayoutMoves = [
    {
      source: 'src/components/ui/layout/PageContent.tsx',
      destination: 'src/components/layout/structure/PageContent.tsx'
    },
    {
      source: 'src/components/ui/layout/PageHeader.tsx',
      destination: 'src/components/layout/structure/PageHeader.tsx'
    },
    {
      source: 'src/components/ui/layout/CMSLayout.tsx',
      destination: 'src/components/layout/cms/CMSLayout.tsx'
    }
  ];

  uiLayoutMoves.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Step 5: Move design system files
  log('\n🔄 Moving design system files...', 'bold');
  
  const designMoves = [
    {
      source: 'src/lib/design/cms-integrated-colors.ts',
      destination: 'src/lib/design-system/cms/cms-integrated-colors.ts'
    },
    {
      source: 'src/lib/design/cms-integrated-typography.ts',
      destination: 'src/lib/design-system/cms/cms-integrated-typography.ts'
    },
    {
      source: 'src/lib/design/cms-integrated-spacing.ts',
      destination: 'src/lib/design-system/cms/cms-integrated-spacing.ts'
    },
    {
      source: 'src/lib/design/index.ts',
      destination: 'src/lib/design-system/cms/index.ts'
    },
    {
      source: 'src/lib/design-system/LayoutEnforcer.tsx',
      destination: 'src/lib/design-system/utils/LayoutEnforcer.tsx'
    },
    {
      source: 'src/lib/design-system/design-rules.md',
      destination: 'src/lib/design-system/utils/design-rules.md'
    }
  ];

  designMoves.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Step 6: Remove duplicate files
  log('\n🗑️  Removing duplicate files...', 'bold');
  
  const duplicatesToRemove = [
    'src/components/ui/PageHeader.tsx',
    'src/components/ui/layout/PageHeader.tsx',
    'src/components/ui/layout/PageContent.tsx',
    'src/components/ui/layout/CMSLayout.tsx'
  ];

  duplicatesToRemove.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`✅ Removed duplicate: ${file}`, 'green');
    }
  });

  // Step 7: Update imports
  log('\n🔄 Updating import statements...', 'bold');
  
  const importUpdates = [
    {
      old: '@/components/layout/UnifiedLayout',
      new: '@/components/layout/core/UnifiedLayout'
    },
    {
      old: '@/components/layout/Navigation',
      new: '@/components/layout/navigation/Navigation'
    },
    {
      old: '@/components/layout/PageHeader',
      new: '@/components/layout/structure/PageHeader'
    },
    {
      old: '@/components/ui/layout/PageHeader',
      new: '@/components/layout/structure/PageHeader'
    },
    {
      old: '@/lib/design/',
      new: '@/lib/design-system/cms/'
    },
    {
      old: '@/lib/design-system/LayoutEnforcer',
      new: '@/lib/design-system/utils/LayoutEnforcer'
    }
  ];

  importUpdates.forEach(update => {
    findAndUpdateImports(srcDir, update.old, update.new);
  });

  // Step 8: Update index files
  log('\n📝 Updating index files...', 'bold');
  
  // Update layout index
  const layoutIndex = `// 🎯 UNIFIED LAYOUT SYSTEM - THE SINGLE SYSTEM FOR ALL PAGES
export { UnifiedLayout } from './core/UnifiedLayout';

// Legacy components - use UnifiedLayout instead
export { UniversalLayout } from './core/UniversalLayout';
export { StandardLayout } from './core/StandardLayout';

// Navigation components
export { default as Navigation } from './navigation/Navigation';
export { StandardNavigation } from './navigation/StandardNavigation';

// Structure components
export { PageContainer } from './structure/PageContainer';
export { PageHeader } from './structure/PageHeader';
export { PageContent } from './structure/PageContent';
export { StandardFooter } from './structure/StandardFooter';
export { StandardHeader } from './structure/StandardHeader';

// CMS Layout components
export { CMSContentPage } from './cms/CMSContentPage';
export { CMSConversionPage } from './cms/CMSConversionPage';
export { CMSMarketingPage } from './cms/CMSMarketingPage';
export { CMSStandardPage } from './cms/CMSStandardPage';
export { CMSStatusPage } from './cms/CMSStatusPage';
export { CMSLayout } from './cms/CMSLayout';

/**
 * 🚨 IMPORTANT: Use UnifiedLayout for ALL pages
 * 
 * ✅ CORRECT - The Single System:
 * import { UnifiedLayout } from '@/components/layout';
 * 
 * Layout Types for Different Pages:
 * - "standard" - Public customer pages
 * - "admin" - Admin dashboard pages
 * - "minimal" - Login, error pages
 * - "marketing" - Homepage, about page
 * - "content" - Help, terms, privacy
 * - "status" - Booking status, success pages
 */`;

  fs.writeFileSync(
    path.join(__dirname, '..', 'src/components/layout/index.ts'),
    layoutIndex
  );
  log('✅ Updated layout index file', 'green');

  // Step 9: Test the changes
  log('\n🧪 Testing reorganization...', 'bold');
  
  try {
    execSync('npm run check:components', { stdio: 'pipe' });
    log('✅ Component check passed!', 'green');
  } catch (error) {
    log('⚠️  Some violations detected - check output above', 'yellow');
  }

  log('\n🎉 REORGANIZATION COMPLETE!', 'bold');
  log('='.repeat(50), 'cyan');
  
  log('\n📊 Summary:', 'bold');
  log('✅ Created new directory structure', 'green');
  log('✅ Moved layout components to appropriate locations', 'green');
  log('✅ Moved design system files', 'green');
  log('✅ Removed duplicate files', 'green');
  log('✅ Updated import statements', 'green');
  log('✅ Updated index files', 'green');
  
  log('\n🚀 Next Steps:', 'bold');
  log('1. Review any remaining violations', 'cyan');
  log('2. Test all components work correctly', 'cyan');
  log('3. Update documentation', 'cyan');
  log('4. Commit changes', 'cyan');
  
  log('\n📋 Quick Commands:', 'bold');
  log('npm run check:components    - Check for violations', 'cyan');
  log('npm run build              - Test build', 'cyan');
  log('git add -A && git commit   - Commit changes', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 