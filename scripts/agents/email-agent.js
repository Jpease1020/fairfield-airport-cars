#!/usr/bin/env node

/**
 * 📧 Email & Communication Specialist Agent
 * 
 * Updates all email templates to use business settings from database
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/lib/email-service.ts',
  'src/lib/notification-service.ts',
  'src/app/api/send-confirmation/route.ts',
  'src/app/api/send-feedback-request/route.ts',
  'src/types/cms.ts',
  'src/app/api/init-cms/route.ts'
];

function updateEmailTemplates(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Pattern 1: Replace hardcoded company names in email templates
  const companyNamePatterns = [
    {
      pattern: /organizer:\s*\{\s*name:\s*['"]Fairfield Airport Cars['"]/g,
      replacement: "organizer: { name: businessSettings?.company?.name || 'Fairfield Airport Cars'"
    },
    {
      pattern: /from:\s*[`'"]Fairfield Airport Cars\s*<[^>]+>[`'"]/g,
      replacement: "from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${EMAIL_FROM}>`"
    },
    {
      pattern: /footer:\s*['"]Fairfield Airport Cars['"]/g,
      replacement: "footer: businessSettings?.company?.name || 'Fairfield Airport Cars'"
    }
  ];

  // Pattern 2: Replace hardcoded business names in message content
  const messagePatterns = [
    {
      pattern: /Thank you for booking with Fairfield Airport Car Service!/g,
      replacement: "Thank you for booking with ${businessSettings?.company?.name || 'Fairfield Airport Car Service'}!"
    },
    {
      pattern: /We hope you enjoyed your ride with Fairfield Airport Car Service/g,
      replacement: "We hope you enjoyed your ride with ${businessSettings?.company?.name || 'Fairfield Airport Car Service'}"
    },
    {
      pattern: /Your Fairfield Airport Car Service booking is confirmed/g,
      replacement: "Your ${businessSettings?.company?.name || 'Fairfield Airport Car Service'} booking is confirmed"
    }
  ];

  // Pattern 3: Replace hardcoded business names in CMS types
  const cmsPatterns = [
    {
      pattern: /title:\s*["']Fairfield Airport Car Service["']/g,
      replacement: "title: businessSettings?.company?.name || 'Fairfield Airport Car Service'"
    },
    {
      pattern: /subject:\s*["']Your Fairfield Airport Car Service Booking Confirmation["']/g,
      replacement: "subject: `Your ${businessSettings?.company?.name || 'Fairfield Airport Car Service'} Booking Confirmation`"
    }
  ];

  // Apply all patterns
  const allPatterns = [...companyNamePatterns, ...messagePatterns, ...cmsPatterns];
  
  for (const { pattern, replacement } of allPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  }

  // Add business settings import if needed
  if (updated && !content.includes("import { cmsService }") && !content.includes("businessSettings")) {
    const importMatch = content.match(/(import\s+.*?from\s+['"][^'"]+['"];?\s*\n)+/);
    if (importMatch) {
      const newImport = `import { cmsService } from '@/lib/cms-service';\n`;
      content = content.replace(importMatch[0], importMatch[0] + newImport);
      
      // Add business settings loading
      const functionMatch = content.match(/(async\s+function\s+\w+\s*\([^)]*\)\s*\{)/);
      if (functionMatch) {
        const businessSettingsCode = `
  // Load business settings
  const businessSettings = await cmsService.getBusinessSettings();
`;
        content = content.replace(functionMatch[0], functionMatch[0] + businessSettingsCode);
      }
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

async function runEmailAgent() {
  console.log('📧 Email Agent: Updating email templates...\n');
  
  let updatedCount = 0;
  let totalFiles = filesToUpdate.length;

  for (const file of filesToUpdate) {
    if (updateEmailTemplates(file)) {
      updatedCount++;
    }
  }

  console.log(`\n📊 Email Agent Summary:`);
  console.log(`✅ Updated: ${updatedCount}/${totalFiles} files`);
  
  if (updatedCount > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Test email sending with dynamic company names`);
    console.log(`2. Verify SMS templates use business settings`);
    console.log(`3. Check notification service updates`);
  }

  return `Email template updates completed: ${updatedCount}/${totalFiles} files updated`;
}

if (require.main === module) {
  runEmailAgent().then(console.log).catch(console.error);
}

module.exports = { runEmailAgent, updateEmailTemplates }; 