#!/usr/bin/env node

/**
 * 🎨 Content & Branding Specialist Agent
 * 
 * Makes page titles, metadata, and content dynamic from business settings
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/layout.tsx',
  'src/lib/ai-assistant.ts',
  'src/app/about/page.tsx'
];

function updateContent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Pattern 1: Update layout.tsx page title
  if (filePath.includes('layout.tsx')) {
    const titlePattern = /title:\s*["']Fairfield Airport Cars - Premium Airport Transportation["']/g;
    if (titlePattern.test(content)) {
      content = content.replace(titlePattern, 'title: `${businessSettings?.company?.name || "Fairfield Airport Cars"} - Premium Airport Transportation`');
      updated = true;
    }
  }

  // Pattern 2: Update AI assistant prompts
  if (filePath.includes('ai-assistant.ts')) {
    const promptPatterns = [
      {
        pattern: /You are Gregg's AI assistant for his car service business in Fairfield, CT/g,
        replacement: "You are an AI assistant for ${businessSettings?.company?.name || 'Fairfield Airport Cars'} in ${businessSettings?.company?.address || 'Fairfield, CT'}"
      },
      {
        pattern: /The Fairfield Airport Cars app is built with/g,
        replacement: "The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} app is built with"
      }
    ];

    for (const { pattern, replacement } of promptPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        updated = true;
      }
    }
  }

  // Pattern 3: Update about page content
  if (filePath.includes('about/page.tsx')) {
    const aboutPattern = /About Fairfield Airport Car Service/g;
    if (aboutPattern.test(content)) {
      content = content.replace(aboutPattern, `About ${businessSettings?.company?.name || 'Fairfield Airport Car Service'}`);
      updated = true;
    }
  }

  // Add business settings import and loading if needed
  if (updated && !content.includes("import { cmsService }") && !content.includes("businessSettings")) {
    const importMatch = content.match(/(import\s+.*?from\s+['"][^'"]+['"];?\s*\n)+/);
    if (importMatch) {
      const newImport = `import { cmsService } from '@/lib/cms-service';\n`;
      content = content.replace(importMatch[0], importMatch[0] + newImport);
      
      // Add business settings loading for layout.tsx
      if (filePath.includes('layout.tsx')) {
        const metadataMatch = content.match(/(export\s+const\s+metadata\s*=\s*\{)/);
        if (metadataMatch) {
          const businessSettingsCode = `
  // Load business settings for dynamic content
  const businessSettings = await cmsService.getBusinessSettings();
`;
          content = content.replace(metadataMatch[0], businessSettingsCode + metadataMatch[0]);
        }
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

async function runContentAgent() {
  console.log('🎨 Content Agent: Making content dynamic...\n');
  
  let updatedCount = 0;
  let totalFiles = filesToUpdate.length;

  for (const file of filesToUpdate) {
    if (updateContent(file)) {
      updatedCount++;
    }
  }

  console.log(`\n📊 Content Agent Summary:`);
  console.log(`✅ Updated: ${updatedCount}/${totalFiles} files`);
  
  if (updatedCount > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Test page titles with dynamic business names`);
    console.log(`2. Verify AI assistant uses business settings`);
    console.log(`3. Check about page content updates`);
  }

  return `Content updates completed: ${updatedCount}/${totalFiles} files updated`;
}

if (require.main === module) {
  runContentAgent().then(console.log).catch(console.error);
}

module.exports = { runContentAgent, updateContent }; 