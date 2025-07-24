#!/usr/bin/env node

/**
 * 🔐 Security & Authentication Specialist Agent
 * 
 * Replaces hardcoded admin email checks with proper role-based authentication
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/privacy/page.tsx',
  'src/app/manage/[id]/page.tsx', 
  'src/app/status/[id]/page.tsx',
  'src/app/feedback/[id]/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/booking/[id]/page.tsx',
  'src/app/success/page.tsx',
  'src/app/cancel/page.tsx',
  'src/components/admin/AdminProvider.tsx',
  'src/components/admin/PageCommentWidget.tsx'
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Pattern 1: Replace hardcoded email checks with role-based auth
  const emailCheckPattern = /if\s*\(\s*user\s*&&\s*\(\s*user\.email\s*===\s*['"]justin@fairfieldairportcar\.com['"]\s*\|\|\s*user\.email\s*===\s*['"]gregg@fairfieldairportcar\.com['"]\s*\)\s*\)/g;
  
  if (emailCheckPattern.test(content)) {
    content = content.replace(emailCheckPattern, `if (user && await authService.isAdmin(user.uid))`);
    updated = true;
  }

  // Pattern 2: Add import for authService if not present
  if (!content.includes("import { authService }") && updated) {
    const importPattern = /import\s+.*?from\s+['"]@\/lib\/auth-service['"];?\s*\n/;
    if (!importPattern.test(content)) {
      // Add import after other imports
      const importMatch = content.match(/(import\s+.*?from\s+['"][^'"]+['"];?\s*\n)+/);
      if (importMatch) {
        const newImport = `import { authService } from '@/lib/auth-service';\n`;
        content = content.replace(importMatch[0], importMatch[0] + newImport);
      }
    }
  }

  // Pattern 3: Update PageCommentWidget hardcoded email
  if (filePath.includes('PageCommentWidget')) {
    const hardcodedEmailPattern = /createdBy:\s*['"]gregg@fairfieldairportcar\.com['"]/g;
    if (hardcodedEmailPattern.test(content)) {
      content = content.replace(hardcodedEmailPattern, `createdBy: user?.email || 'admin'`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

async function runSecurityAgent() {
  console.log('🔐 Security Agent: Starting role-based auth updates...\n');
  
  let updatedCount = 0;
  let totalFiles = filesToUpdate.length;

  for (const file of filesToUpdate) {
    if (updateFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\n📊 Security Agent Summary:`);
  console.log(`✅ Updated: ${updatedCount}/${totalFiles} files`);
  
  if (updatedCount > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Test admin access with role-based auth`);
    console.log(`2. Verify all admin functions work properly`);
    console.log(`3. Update any remaining hardcoded email references`);
  }

  return `Security updates completed: ${updatedCount}/${totalFiles} files updated`;
}

if (require.main === module) {
  runSecurityAgent().then(console.log).catch(console.error);
}

module.exports = { runSecurityAgent, updateFile }; 