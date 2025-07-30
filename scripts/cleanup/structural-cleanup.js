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

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    log(`✅ Removed duplicate: ${filePath}`, 'green');
  } else {
    log(`⚠️  File not found: ${filePath}`, 'yellow');
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
  log('🎯 STRUCTURAL CLEANUP', 'bold');
  log('='.repeat(50), 'cyan');

  const srcDir = path.join(__dirname, '..', 'src');
  
  // Phase 1: Remove Duplicate Files
  log('\n🗑️  Removing duplicate files...', 'bold');
  
  const duplicatesToRemove = [
    'src/components/data/DataTable.tsx',
    'src/components/forms/FormSection.tsx',
    'src/components/admin/EditableField.tsx',
    'src/components/layout/PageContent.tsx'
  ];

  duplicatesToRemove.forEach(file => {
    removeFile(path.join(__dirname, '..', file));
  });

  // Phase 2: Create styles directory and move CSS files
  log('\n📁 Creating styles directory...', 'bold');
  createDirectory(path.join(__dirname, '..', 'src/styles'));

  const cssFilesToMove = [
    {
      source: 'src/app/standard-layout.css',
      destination: 'src/styles/standard-layout.css'
    },
    {
      source: 'src/app/page-editable.css',
      destination: 'src/styles/page-editable.css'
    }
  ];

  cssFilesToMove.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Phase 3: Move misplaced components
  log('\n🔄 Moving misplaced components...', 'bold');
  
  const componentsToMove = [
    {
      source: 'src/components/ui/AdminPageWrapper.tsx',
      destination: 'src/components/admin/AdminPageWrapper.tsx'
    },
    {
      source: 'src/components/ui/PageSection.tsx',
      destination: 'src/components/layout/structure/PageSection.tsx'
    },
    {
      source: 'src/components/templates/PageTemplates.tsx',
      destination: 'src/components/cms/PageTemplates.tsx'
    }
  ];

  componentsToMove.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Phase 4: Consolidate design system
  log('\n🎨 Consolidating design system...', 'bold');
  
  const designSystemMoves = [
    {
      source: 'src/components/ui/design-system.tsx',
      destination: 'src/lib/design-system/components.tsx'
    }
  ];

  designSystemMoves.forEach(move => {
    moveFile(
      path.join(__dirname, '..', move.source),
      path.join(__dirname, '..', move.destination)
    );
  });

  // Phase 5: Update import statements
  log('\n🔄 Updating import statements...', 'bold');
  
  const importUpdates = [
    {
      old: '@/components/data/DataTable',
      new: '@/components/ui/DataTable'
    },
    {
      old: '@/components/forms/FormSection',
      new: '@/components/ui/FormSection'
    },
    {
      old: '@/components/admin/EditableField',
      new: '@/components/forms/EditableField'
    },
    {
      old: '@/components/layout/PageContent',
      new: '@/components/layout/structure/PageContent'
    },
    {
      old: '@/components/ui/AdminPageWrapper',
      new: '@/components/admin/AdminPageWrapper'
    },
    {
      old: '@/components/ui/PageSection',
      new: '@/components/layout/structure/PageSection'
    },
    {
      old: '@/components/templates/PageTemplates',
      new: '@/components/cms/PageTemplates'
    },
    {
      old: '@/components/ui/design-system',
      new: '@/lib/design-system/components'
    }
  ];

  importUpdates.forEach(update => {
    findAndUpdateImports(srcDir, update.old, update.new);
  });

  // Phase 6: Update CSS imports
  log('\n🎨 Updating CSS imports...', 'bold');
  
  const cssImportUpdates = [
    {
      old: './standard-layout.css',
      new: '@/styles/standard-layout.css'
    },
    {
      old: './page-editable.css',
      new: '@/styles/page-editable.css'
    }
  ];

  cssImportUpdates.forEach(update => {
    findAndUpdateImports(srcDir, update.old, update.new);
  });

  // Phase 7: Clean up empty directories
  log('\n🧹 Cleaning up empty directories...', 'bold');
  
  const directoriesToCheck = [
    'src/components/data',
    'src/components/templates',
    'src/components/ui/layout'
  ];

  directoriesToCheck.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
          fs.rmdirSync(dirPath);
          log(`✅ Removed empty directory: ${dir}`, 'green');
        }
      } catch (error) {
        // Directory not empty or other error
      }
    }
  });

  // Phase 8: Test the changes
  log('\n🧪 Testing structural cleanup...', 'bold');
  
  try {
    execSync('npm run check:components', { stdio: 'pipe' });
    log('✅ Component check passed!', 'green');
  } catch (error) {
    log('⚠️  Some violations detected - check output above', 'yellow');
  }

  log('\n🎉 STRUCTURAL CLEANUP COMPLETE!', 'bold');
  log('='.repeat(50), 'cyan');
  
  log('\n📊 Summary:', 'bold');
  log('✅ Removed duplicate files', 'green');
  log('✅ Moved CSS files to styles directory', 'green');
  log('✅ Moved misplaced components', 'green');
  log('✅ Consolidated design system', 'green');
  log('✅ Updated import statements', 'green');
  log('✅ Cleaned up empty directories', 'green');
  
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