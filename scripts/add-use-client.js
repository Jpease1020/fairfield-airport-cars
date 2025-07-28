#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that use styled-components and need 'use client'
const filesToUpdate = [
  'src/components/ui/Modal.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/StatusMessage.tsx',
  'src/components/ui/FormSection.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/LoadingSpinner.tsx',
  'src/components/ui/spinner.tsx',
  'src/components/ui/EditableHeading.tsx',
  'src/components/ui/EmptyState.tsx',
  'src/components/ui/EditableText.tsx',
  'src/components/ui/text.tsx',
  'src/components/ui/InfoCard.tsx',
  'src/components/ui/Alert.tsx',
  'src/components/ui/StarRating.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/layout/containers.tsx',
  'src/components/ui/HelpCard.tsx',
  'src/components/ui/StatCard.tsx',
  'src/components/ui/layout/grid.tsx',
  'src/components/ui/layout/components.tsx',
  'src/components/ui/EditableButton.tsx',
  'src/components/ui/SettingInput.tsx',
  'src/components/ui/SettingToggle.tsx',
  'src/components/ui/voice-input.tsx',
  'src/components/ui/voice-output.tsx',
  'src/components/ui/AccessibilityEnhancer.tsx',
];

console.log('🔧 Adding "use client" directive to styled-components files...');

let updatedCount = 0;

filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if 'use client' is already present
    if (content.includes("'use client'")) {
      console.log(`✅ Already has 'use client': ${filePath}`);
      return;
    }

    // Add 'use client' at the top
    const updatedContent = "'use client';\n\n" + content;
    
    fs.writeFileSync(fullPath, updatedContent);
    console.log(`✅ Updated: ${filePath}`);
    updatedCount++;
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎯 Updated ${updatedCount} files with 'use client' directive`);
console.log('✅ All styled-components files are now client components'); 