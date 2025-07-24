#!/usr/bin/env node

/**
 * 🔧 Edit Mode Standardization Script
 * 
 * This script standardizes the edit mode implementation across all pages:
 * 1. Replaces inconsistent edit mode patterns with standardized components
 * 2. Ensures consistent admin detection
 * 3. Standardizes save/cancel functionality
 * 4. Implements consistent UI patterns
 */

const fs = require('fs');
const path = require('path');

// Standardization configuration
const STANDARDIZATION_CONFIG = {
  pages: [
    'src/app/page.tsx',
    'src/app/book/page.tsx',
    'src/app/help/page.tsx',
    'src/app/about/page.tsx',
    'src/app/terms/page.tsx',
    'src/app/privacy/page.tsx',
    'src/app/cancel/page.tsx',
    'src/app/success/page.tsx',
    'src/app/feedback/[id]/page.tsx',
    'src/app/booking/[id]/page.tsx',
    'src/app/manage/[id]/page.tsx',
    'src/app/status/[id]/page.tsx'
  ],
  
  // Standard imports to add
  standardImports: [
    "import { useEditMode } from '@/components/admin/EditModeProvider';",
    "import { EditableTitle, EditableSubtitle, EditableContent, EditableLabel } from '@/components/admin/EditableField';"
  ],
  
  // Imports to remove
  removeImports: [
    "import { onAuthStateChanged, User } from 'firebase/auth';",
    "import { auth } from '@/lib/firebase';",
    "import { Button } from '@/components/ui/button';",
    "import { Input } from '@/components/ui/input';",
    "import { Textarea } from '@/components/ui/textarea';"
  ],
  
  // Standard edit mode state replacement
  editModeStateReplacement: {
    old: [
      "const [isAdmin, setIsAdmin] = useState(false);",
      "const [editMode, setEditMode] = useState(false);",
      "const [localContent, setLocalContent] = useState<any>(null);",
      "const [saving, setSaving] = useState(false);",
      "const [saveMsg, setSaveMsg] = useState<string | null>(null);"
    ],
    new: [
      "const {",
      "  isAdmin,",
      "  editMode,",
      "  localContent,",
      "  saving,",
      "  saveMsg,",
      "  setLocalContent,",
      "  handleFieldChange,",
      "  handleSave,",
      "  handleCancel,",
      "  EditModeToggle,",
      "  EditModeControls",
      "} = useEditMode();"
    ]
  },
  
  // Standard admin detection replacement
  adminDetectionReplacement: {
    old: [
      "useEffect(() => {",
      "  const unsub = onAuthStateChanged(auth, (user: User | null) => {",
      "    if (user && (user.email === 'justin@fairfieldairportcar.com' || user.email === 'gregg@fairfieldairportcar.com')) {",
      "      setIsAdmin(true);",
      "    } else {",
      "      setIsAdmin(false);",
      "    }",
      "  });",
      "  return () => unsub();",
      "}, []);"
    ],
    new: [
      "// Admin detection handled by EditModeProvider"
    ]
  },
  
  // Standard edit mode UI replacement
  editModeUIReplacement: {
    old: [
      "{/* Floating Edit Mode Toggle for Admins */}",
      "{isAdmin && (",
      "  <div className=\"fixed top-20 right-6 z-50\">",
      "    {!editMode ? (",
      "      <Button",
      "        onClick={() => setEditMode(true)}",
      "        className=\"bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg\"",
      "      >",
      "        Edit Mode",
      "      </Button>",
      "    ) : (",
      "      <div className=\"flex gap-2\">",
      "        <Button",
      "          onClick={handleSave}",
      "          disabled={saving}",
      "          className=\"bg-success text-text-inverse rounded shadow hover:bg-success-hover\"",
      "        >",
      "          {saving ? 'Saving...' : 'Save'}",
      "        </Button>",
      "        <Button",
      "          onClick={handleCancel}",
      "          disabled={saving}",
      "          className=\"px-4 py-2 bg-error text-text-inverse rounded shadow hover:bg-error-hover\"",
      "        >",
      "          Cancel",
      "        </Button>",
      "        {saveMsg && <div className=\"mt-2 text-sm text-green-600\">{saveMsg}</div>}",
      "      </div>",
      "    )}",
      "  </div>",
      ")}"
    ],
    new: [
      "{/* Standardized Edit Mode Controls */}",
      "<EditModeToggle />",
      "{editMode && (",
      "  <EditModeControls",
      "    cmsConfig={cmsConfig}",
      "    pageType=\"{PAGE_TYPE}\"",
      "    originalContent={originalContent}",
      "  />",
      ")}"
    ]
  }
};

class EditModeStandardizer {
  constructor() {
    this.results = [];
  }

  async standardizeAllPages() {
    console.log('🔧 Starting Edit Mode Standardization');
    console.log('=' .repeat(60));
    
    for (const pageFile of STANDARDIZATION_CONFIG.pages) {
      await this.standardizePage(pageFile);
    }
    
    this.generateStandardizationReport();
  }

  async standardizePage(pageFile) {
    console.log(`🔧 Standardizing ${pageFile}...`);
    
    try {
      if (!fs.existsSync(pageFile)) {
        console.log(`  ⚠️ File not found: ${pageFile}`);
        this.results.push({
          file: pageFile,
          status: 'SKIP',
          error: 'File not found'
        });
        return;
      }

      let content = fs.readFileSync(pageFile, 'utf8');
      const originalContent = content;
      
      // Step 1: Add standard imports
      content = this.addStandardImports(content, pageFile);
      
      // Step 2: Remove old imports
      content = this.removeOldImports(content);
      
      // Step 3: Replace edit mode state
      content = this.replaceEditModeState(content, pageFile);
      
      // Step 4: Replace admin detection
      content = this.replaceAdminDetection(content);
      
      // Step 5: Replace edit mode UI
      content = this.replaceEditModeUI(content, pageFile);
      
      // Step 6: Replace old field handlers
      content = this.replaceFieldHandlers(content);
      
      // Step 7: Replace old save/cancel handlers
      content = this.replaceSaveCancelHandlers(content, pageFile);
      
      // Step 8: Replace old input fields with EditableField components
      content = this.replaceInputFields(content);
      
      // Save the standardized file
      if (content !== originalContent) {
        fs.writeFileSync(pageFile, content);
        console.log(`  ✅ Standardized ${pageFile}`);
        this.results.push({
          file: pageFile,
          status: 'SUCCESS',
          changes: 'File standardized successfully'
        });
      } else {
        console.log(`  ℹ️ No changes needed for ${pageFile}`);
        this.results.push({
          file: pageFile,
          status: 'NO_CHANGES',
          changes: 'File already standardized'
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Error standardizing ${pageFile}: ${error.message}`);
      this.results.push({
        file: pageFile,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  addStandardImports(content, pageFile) {
    // Check if imports already exist
    const hasEditModeImport = content.includes("import { useEditMode }");
    const hasEditableFieldImport = content.includes("import { EditableTitle");
    
    if (!hasEditModeImport) {
      // Add after the first import line
      const importMatch = content.match(/^import.*$/m);
      if (importMatch) {
        const insertIndex = content.indexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + STANDARDIZATION_CONFIG.standardImports.join('\n') + content.slice(insertIndex);
      }
    }
    
    return content;
  }

  removeOldImports(content) {
    for (const importToRemove of STANDARDIZATION_CONFIG.removeImports) {
      content = content.replace(new RegExp(`^${importToRemove}$`, 'gm'), '');
    }
    return content;
  }

  replaceEditModeState(content, pageFile) {
    const pageType = this.getPageType(pageFile);
    
    // Replace the old state declarations
    const oldStatePattern = STANDARDIZATION_CONFIG.editModeStateReplacement.old.join('\n');
    const newStatePattern = STANDARDIZATION_CONFIG.editModeStateReplacement.new.join('\n');
    
    if (content.includes('const [isAdmin, setIsAdmin] = useState(false);')) {
      content = content.replace(oldStatePattern, newStatePattern);
    }
    
    return content;
  }

  replaceAdminDetection(content) {
    const oldAdminDetection = STANDARDIZATION_CONFIG.adminDetectionReplacement.old.join('\n');
    const newAdminDetection = STANDARDIZATION_CONFIG.adminDetectionReplacement.new.join('\n');
    
    if (content.includes('onAuthStateChanged(auth, (user: User | null) => {')) {
      content = content.replace(oldAdminDetection, newAdminDetection);
    }
    
    return content;
  }

  replaceEditModeUI(content, pageFile) {
    const pageType = this.getPageType(pageFile);
    
    // Replace the old edit mode UI
    const oldUIPattern = STANDARDIZATION_CONFIG.editModeUIReplacement.old.join('\n');
    const newUIPattern = STANDARDIZATION_CONFIG.editModeUIReplacement.new
      .join('\n')
      .replace('{PAGE_TYPE}', pageType);
    
    if (content.includes('Floating Edit Mode Toggle for Admins')) {
      content = content.replace(oldUIPattern, newUIPattern);
    }
    
    return content;
  }

  replaceFieldHandlers(content) {
    // Replace old handleFieldChange implementations
    const oldFieldHandler = [
      "const handleFieldChange = (section: string, field: string, value: unknown, subfield?: string) => {",
      "  setLocalContent((prev: any) => {",
      "    const updated = { ...prev };",
      "    if (subfield) {",
      "      updated[section][field][subfield] = value;",
      "    } else if (field) {",
      "      updated[section][field] = value;",
      "    } else {",
      "      updated[section] = value;",
      "    }",
      "    return updated;",
      "  });",
      "};"
    ].join('\n');
    
    if (content.includes('const handleFieldChange = (section: string, field: string, value: unknown, subfield?: string) => {')) {
      content = content.replace(oldFieldHandler, '// Field change handler provided by EditModeProvider');
    }
    
    return content;
  }

  replaceSaveCancelHandlers(content, pageFile) {
    const pageType = this.getPageType(pageFile);
    
    // Replace old save handler
    const oldSaveHandler = [
      "const handleSave = async () => {",
      "  setSaving(true);",
      "  setSaveMsg(null);",
      "  try {",
      "    const user = auth.currentUser;",
      "    console.log('Saving CMS content:', { localContent, user: user?.uid });",
      "    ",
      "    const result = await cmsService.updateCMSConfiguration({",
      "      pages: {",
      "        ...cmsConfig?.pages,",
      "        home: localContent,",
      "        help: cmsConfig?.pages.help || { faq: [], contactInfo: { phone: '', email: '', hours: '' } },",
      "      },",
      "    }, user?.uid, user?.email || undefined);",
      "    ",
      "    console.log('Save result:', result);",
      "    ",
      "    if (result.success) {",
      "      setSaveMsg('Saved!');",
      "      setTimeout(() => setSaveMsg(null), 2000);",
      "      setEditMode(false);",
      "    } else {",
      "      setSaveMsg(`Failed to save: ${result.errors?.join(', ')}`);",
      "    }",
      "  } catch (error) {",
      "    console.error('Save error:', error);",
      "    setSaveMsg('Failed to save.');",
      "  } finally {",
      "    setSaving(false);",
      "  }",
      "};"
    ].join('\n');
    
    if (content.includes('const handleSave = async () => {')) {
      content = content.replace(oldSaveHandler, '// Save handler provided by EditModeProvider');
    }
    
    // Replace old cancel handler
    const oldCancelHandler = [
      "const handleCancel = () => {",
      "  setLocalContent(JSON.parse(JSON.stringify(homeContent)));",
      "  setEditMode(false);",
      "  setSaveMsg(null);",
      "};"
    ].join('\n');
    
    if (content.includes('const handleCancel = () => {')) {
      content = content.replace(oldCancelHandler, '// Cancel handler provided by EditModeProvider');
    }
    
    return content;
  }

  replaceInputFields(content) {
    // Replace old Input components with EditableField components
    content = content.replace(
      /<Input\s+className="editable-input[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g,
      '<EditableTitle value={$1} onChange={$2} />'
    );
    
    content = content.replace(
      /<Textarea\s+className="editable-textarea[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g,
      '<EditableContent value={$1} onChange={$2} />'
    );
    
    return content;
  }

  getPageType(pageFile) {
    const fileName = path.basename(pageFile, '.tsx');
    if (fileName === 'page' && pageFile.includes('/book/')) return 'booking';
    if (fileName === 'page' && pageFile.includes('/help/')) return 'help';
    if (fileName === 'page' && pageFile.includes('/about/')) return 'about';
    if (fileName === 'page' && pageFile.includes('/terms/')) return 'terms';
    if (fileName === 'page' && pageFile.includes('/privacy/')) return 'privacy';
    if (fileName === 'page' && pageFile.includes('/cancel/')) return 'cancel';
    if (fileName === 'page' && pageFile.includes('/success/')) return 'success';
    if (fileName === 'page' && pageFile.includes('/feedback/')) return 'feedback';
    if (fileName === 'page' && pageFile.includes('/booking/')) return 'bookingDetails';
    if (fileName === 'page' && pageFile.includes('/manage/')) return 'manage';
    if (fileName === 'page' && pageFile.includes('/status/')) return 'status';
    return 'home'; // Default for main page
  }

  generateStandardizationReport() {
    console.log('\n📊 EDIT MODE STANDARDIZATION REPORT');
    console.log('=' .repeat(60));
    
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'SUCCESS').length,
      noChanges: this.results.filter(r => r.status === 'NO_CHANGES').length,
      error: this.results.filter(r => r.status === 'ERROR').length,
      skip: this.results.filter(r => r.status === 'SKIP').length
    };
    
    console.log(`📈 Summary: ${summary.total} files processed`);
    console.log(`✅ Standardized: ${summary.success}`);
    console.log(`ℹ️ No changes needed: ${summary.noChanges}`);
    console.log(`❌ Errors: ${summary.error}`);
    console.log(`⏭️ Skipped: ${summary.skip}`);
    
    console.log('\n🔍 Detailed Results:');
    this.results.forEach((result, index) => {
      const status = result.status === 'SUCCESS' ? '✅' : 
                     result.status === 'NO_CHANGES' ? 'ℹ️' : 
                     result.status === 'ERROR' ? '❌' : '⏭️';
      console.log(`${status} ${result.file}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.changes) {
        console.log(`   Changes: ${result.changes}`);
      }
    });
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.results
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../reports/edit-mode-standardization-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to: reports/edit-mode-standardization-report.json');
    
    // Generate next steps
    this.generateNextSteps();
  }

  generateNextSteps() {
    console.log('\n🎯 NEXT STEPS FOR COMPLETE STANDARDIZATION');
    console.log('=' .repeat(60));
    
    const failedFiles = this.results.filter(r => r.status === 'ERROR' || r.status === 'SKIP');
    
    if (failedFiles.length === 0) {
      console.log('🎉 All files have been standardized!');
      console.log('\n📋 Manual verification needed:');
      console.log('1. ✅ Check that EditModeProvider is properly imported in layout.tsx');
      console.log('2. ✅ Verify that EditableField components are working correctly');
      console.log('3. ✅ Test admin detection and edit mode toggles');
      console.log('4. ✅ Verify save/cancel functionality works consistently');
      console.log('5. ✅ Test that all pages show edit controls for admins');
    } else {
      console.log('⚠️ Some files need manual attention:');
      failedFiles.forEach(file => {
        console.log(`  ❌ ${file.file}: ${file.error || 'File not found'}`);
      });
    }
    
    console.log('\n🔧 Manual fixes needed:');
    console.log('1. Update any remaining hardcoded edit mode logic');
    console.log('2. Replace any remaining Input/Textarea components with EditableField');
    console.log('3. Ensure all pages use the standardized edit mode pattern');
    console.log('4. Test the complete edit mode flow on all pages');
  }
}

// Main execution
async function runEditModeStandardization() {
  const standardizer = new EditModeStandardizer();
  await standardizer.standardizeAllPages();
}

// Run the standardization
if (require.main === module) {
  runEditModeStandardization().catch(console.error);
}

module.exports = {
  EditModeStandardizer,
  STANDARDIZATION_CONFIG,
  runEditModeStandardization
}; 