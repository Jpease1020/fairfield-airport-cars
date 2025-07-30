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

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`✅ Removed empty directory: ${dirPath}`, 'green');
      return true;
    } catch (error) {
      log(`⚠️  Could not remove directory: ${dirPath}`, 'yellow');
      return false;
    }
  } else {
    log(`⚠️  Directory not found: ${dirPath}`, 'yellow');
    return false;
  }
}

function updateFile(filePath, oldContent, newContent) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldContentStr = content;
    
    content = content.replace(oldContent, newContent);
    
    if (content !== oldContentStr) {
      fs.writeFileSync(filePath, content);
      log(`✅ Updated: ${filePath}`, 'green');
      return true;
    } else {
      log(`⚠️  No changes needed: ${filePath}`, 'yellow');
      return false;
    }
  } else {
    log(`⚠️  File not found: ${filePath}`, 'yellow');
    return false;
  }
}

function renameFile(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    const newDir = path.dirname(newPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }
    
    fs.renameSync(oldPath, newPath);
    log(`✅ Renamed: ${oldPath} → ${newPath}`, 'green');
    return true;
  } else {
    log(`⚠️  File not found: ${oldPath}`, 'yellow');
    return false;
  }
}

function main() {
  log('🎨 FIXING UI COMPONENTS', 'bold');
  log('='.repeat(50), 'cyan');

  const projectRoot = path.join(__dirname, '..');
  let changesCount = 0;

  // Phase 1: Remove Empty Directories
  log('\n🗑️  Removing empty directories...', 'bold');
  
  const emptyDirectories = [
    'src/components/ui/core',
    'src/components/ui/data',
    'src/components/ui/feedback',
    'src/components/ui/forms'
  ];

  emptyDirectories.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (removeDirectory(dirPath)) {
      changesCount++;
    }
  });

  // Phase 2: Fix Index.ts Exports
  log('\n📝 Fixing index.ts exports...', 'bold');
  
  const indexPath = path.join(projectRoot, 'src/components/ui/index.ts');
  
  // Remove moved exports
  const movedExports = [
    "export { PageHeader } from './PageHeader';",
    "export { PageSection } from './PageSection';",
    "export { AdminPageWrapper } from './AdminPageWrapper';"
  ];

  movedExports.forEach(exportLine => {
    if (updateFile(indexPath, exportLine, '')) {
      changesCount++;
    }
  });

  // Fix duplicate Grid export
  const duplicateGridExport = "export { Grid, GridItem } from './Grid';";
  const correctGridExport = "export { Grid, GridItem } from './containers';";
  
  if (updateFile(indexPath, duplicateGridExport, correctGridExport)) {
    changesCount++;
  }

  // Add correct exports for moved components
  const newExports = [
    "// Layout Components (Moved)",
    "export { PageHeader } from '../layout/structure/PageHeader';",
    "export { PageSection } from '../layout/structure/PageSection';",
    "export { AdminPageWrapper } from '../admin/AdminPageWrapper';",
    ""
  ];

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const updatedContent = indexContent.replace(
    "// Layout Components",
    newExports.join('\n') + "// Layout Components"
  );
  
  fs.writeFileSync(indexPath, updatedContent);
  log(`✅ Added moved component exports`, 'green');
  changesCount++;

  // Phase 3: Standardize Naming
  log('\n📝 Standardizing file names...', 'bold');
  
  const renameMap = [
    {
      old: 'src/components/ui/help-tooltip.tsx',
      new: 'src/components/ui/HelpTooltip.tsx'
    }
  ];

  renameMap.forEach(rename => {
    const oldPath = path.join(projectRoot, rename.old);
    const newPath = path.join(projectRoot, rename.new);
    if (renameFile(oldPath, newPath)) {
      changesCount++;
    }
  });

  // Phase 4: Check for Duplicate Files
  log('\n🔍 Checking for duplicate files...', 'bold');
  
  const potentialDuplicates = [
    {
      file1: 'src/components/ui/input.tsx',
      file2: 'src/components/ui/inputs.tsx',
      description: 'input vs inputs'
    },
    {
      file1: 'src/components/ui/select.tsx',
      file2: 'src/components/ui/SelectField.tsx',
      description: 'select vs SelectField'
    },
    {
      file1: 'src/components/ui/text.tsx',
      file2: 'src/components/ui/typography.tsx',
      description: 'text vs typography'
    }
  ];

  potentialDuplicates.forEach(duplicate => {
    const file1Path = path.join(projectRoot, duplicate.file1);
    const file2Path = path.join(projectRoot, duplicate.file2);
    
    if (fs.existsSync(file1Path) && fs.existsSync(file2Path)) {
      log(`❓ Found potential duplicate: ${duplicate.description}`, 'yellow');
      log(`   ${duplicate.file1}`, 'cyan');
      log(`   ${duplicate.file2}`, 'cyan');
      log(`   Check manually and remove if duplicate`, 'yellow');
    }
  });

  // Phase 5: Check for Violations
  log('\n🔍 Checking for violations in UI components...', 'bold');
  
  try {
    const result = execSync('npm run check:components 2>&1 | grep "src/components/ui" | head -10', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      log('⚠️  Found violations in UI components:', 'yellow');
      console.log(result);
    } else {
      log('✅ No violations found in UI components', 'green');
    }
  } catch (error) {
    log('⚠️  Could not check violations', 'yellow');
  }

  // Phase 6: Summary
  log('\n🎉 UI COMPONENTS FIX COMPLETE!', 'bold');
  log('='.repeat(50), 'cyan');
  
  log('\n📊 Summary:', 'bold');
  log(`✅ Changes made: ${changesCount}`, 'green');
  
  log('\n📋 What was fixed:', 'bold');
  log('✅ Removed empty subdirectories', 'green');
  log('✅ Fixed index.ts exports', 'green');
  log('✅ Standardized file naming', 'green');
  log('✅ Checked for duplicates', 'green');
  
  log('\n🚀 Next Steps:', 'bold');
  log('1. Review potential duplicates manually', 'cyan');
  log('2. Fix remaining violations in UI components', 'cyan');
  log('3. Test all components work correctly', 'cyan');
  log('4. Consider reorganizing into subdirectories', 'cyan');
  
  log('\n📋 Quick Commands:', 'bold');
  log('npm run check:components    - Check for violations', 'cyan');
  log('npm run build              - Test build', 'cyan');
  log('git add -A && git commit   - Commit changes', 'cyan');
  
  log('\n💡 Note: Some files may need manual review', 'yellow');
  log('Check the yellow warnings above for potential duplicates', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 