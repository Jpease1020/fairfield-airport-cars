const fs = require('fs');
const path = require('path');

class EditableTextFixer {
  constructor() {
    this.pages = [
      'src/app/page.tsx',
      'src/app/about/page.tsx', 
      'src/app/help/page.tsx',
      'src/app/book/page.tsx'
    ];
  }

  fixHomePage() {
    const filePath = 'src/app/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix imports
    content = content.replace(
      /import.*EditableTitle.*EditableContent.*EditableLabel.*from.*EditableField.*;/,
      `import { EditableTitle, EditableSubtitle, EditableContent, EditableLabel } from '@/components/admin/EditableField';`
    );

    // Remove old Input and Textarea imports
    content = content.replace(/import.*Input.*from.*ui\/input.*;/g, '');
    content = content.replace(/import.*Textarea.*from.*ui\/textarea.*;/g, '');

    // Replace old Input components with EditableField
    content = content.replace(
      /<Input\s+className="editable-input[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g,
      '<EditableTitle value={$1} onChange={$2} />'
    );

    // Replace old Textarea components with EditableContent
    content = content.replace(
      /<Textarea\s+className="editable-textarea[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s+rows=\{([^}]+)\}\s*\/>/g,
      '<EditableContent value={$1} onChange={$2} rows={$3} />'
    );

    // Fix handleFieldChange calls to use the new pattern
    content = content.replace(
      /handleFieldChange\('([^']+)', '([^']+)', e\.target\.value\)/g,
      "handleFieldChange('home', '$1', e.target.value)"
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed homepage editable text');
  }

  fixAboutPage() {
    const filePath = 'src/app/about/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace old patterns with new EditModeProvider
    content = content.replace(
      /const \[isAdmin, setIsAdmin\] = useState\(false\);\s+const \[editMode, setEditMode\] = useState\(false\);\s+const \[localContent, setLocalContent\] = useState<any>\(null\);\s+const \[saving, setSaving\] = useState\(false\);\s+const \[saveMsg, setSaveMsg\] = useState<string \| null>\(null\);/,
      `const { 
    isAdmin, 
    editMode, 
    localContent, 
    saving, 
    saveMsg,
    setLocalContent,
    handleFieldChange,
    handleSave,
    handleCancel,
    EditModeToggle,
    EditModeControls
  } = useEditMode();`
    );

    // Remove old useEffect for admin detection
    content = content.replace(
      /useEffect\(\(\) => \{\s+const unsub = onAuthStateChanged\(auth, \(user: User \| null\) => \{\s+if \(user && \(user\.email === 'justin@fairfieldairportcar\.com' \|\| user\.email === 'gregg@fairfieldairportcar\.com'\)\) \{\s+setIsAdmin\(true\);\s+\} else \{\s+setIsAdmin\(false\);\s+\}\s+\}\);\s+return \(\) => unsub\(\);\s+\}, \[\]\);/,
      ''
    );

    // Remove old handleFieldChange, handleSave, handleCancel functions
    content = content.replace(
      /const handleFieldChange = \(field: string, value: string\) => \{\s+setLocalContent\(\(prev: any\) => \(\{ \.\.\.prev, \[field\]: value \}\)\);\s+\};/,
      ''
    );

    content = content.replace(
      /const handleSave = async \(\) => \{[\s\S]*?\};/,
      ''
    );

    content = content.replace(
      /const handleCancel = \(\) => \{[\s\S]*?\};/,
      ''
    );

    // Replace old edit controls with new ones
    content = content.replace(
      /\{isAdmin && \([\s\S]*?\)\}/,
      `{/* Standardized Edit Mode Controls */}
      <EditModeToggle />
      {editMode && (
        <EditModeControls 
          cmsConfig={cmsConfig} 
          pageType="about" 
          originalContent={aboutContent}
        />
      )}`
    );

    // Replace Textarea with EditableContent
    content = content.replace(
      /<Textarea\s+className="editable-textarea[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s+rows=\{([^}]+)\}\s*\/>/g,
      '<EditableContent value={$1} onChange={$2} rows={$3} />'
    );

    // Fix handleFieldChange calls
    content = content.replace(
      /handleFieldChange\('([^']+)', e\.target\.value\)/g,
      "handleFieldChange('about', '$1', e.target.value)"
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed about page editable text');
  }

  fixHelpPage() {
    const filePath = 'src/app/help/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace old patterns with new EditModeProvider
    content = content.replace(
      /const \[isAdmin, setIsAdmin\] = useState\(false\);\s+const \[editMode, setEditMode\] = useState\(false\);\s+const \[localContent, setLocalContent\] = useState<any>\(null\);\s+const \[saving, setSaving\] = useState\(false\);\s+const \[saveMsg, setSaveMsg\] = useState<string \| null>\(null\);/,
      `const { 
    isAdmin, 
    editMode, 
    localContent, 
    saving, 
    saveMsg,
    setLocalContent,
    handleFieldChange,
    handleSave,
    handleCancel,
    EditModeToggle,
    EditModeControls
  } = useEditMode();`
    );

    // Remove old useEffect for admin detection
    content = content.replace(
      /useEffect\(\(\) => \{\s+const unsub = onAuthStateChanged\(auth, \(user: User \| null\) => \{\s+if \(user && \(user\.email === 'justin@fairfieldairportcar\.com' \|\| user\.email === 'gregg@fairfieldairportcar\.com'\)\) \{\s+setIsAdmin\(true\);\s+\} else \{\s+setIsAdmin\(false\);\s+\}\s+\}\);\s+return \(\) => unsub\(\);\s+\}, \[\]\);/,
      ''
    );

    // Remove old handleFieldChange, handleSave, handleCancel functions
    content = content.replace(
      /const handleFieldChange = \(field: string, value: unknown, subfield\?: string\) => \{[\s\S]*?\};/,
      ''
    );

    content = content.replace(
      /const handleFAQChange = \(idx: number, field: string, value: string\) => \{[\s\S]*?\};/,
      ''
    );

    content = content.replace(
      /const handleSave = async \(\) => \{[\s\S]*?\};/,
      ''
    );

    content = content.replace(
      /const handleCancel = \(\) => \{[\s\S]*?\};/,
      ''
    );

    // Replace old edit controls with new ones
    content = content.replace(
      /\{isAdmin && \([\s\S]*?\)\}/,
      `{/* Standardized Edit Mode Controls */}
      <EditModeToggle />
      {editMode && (
        <EditModeControls 
          cmsConfig={cmsConfig} 
          pageType="help" 
          originalContent={helpContent}
        />
      )}`
    );

    // Replace Input components with EditableField
    content = content.replace(
      /<Input\s+className="editable-input[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g,
      '<EditableTitle value={$1} onChange={$2} />'
    );

    // Replace Textarea components with EditableContent
    content = content.replace(
      /<Textarea\s+className="editable-textarea[^"]*"\s+value=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s+rows=\{([^}]+)\}\s*\/>/g,
      '<EditableContent value={$1} onChange={$2} rows={$3} />'
    );

    // Fix handleFieldChange calls
    content = content.replace(
      /handleFieldChange\('([^']+)', \{ \.\.\.localContent\?\.([^}]+), ([^}]+): e\.target\.value \}\)/g,
      "handleFieldChange('help', '$1', { ...localContent?.$2, $3: e.target.value })"
    );

    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed help page editable text');
  }

  fixBookPage() {
    const filePath = 'src/app/book/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // The book page is already mostly correct, just ensure it's using the right patterns
    // Check if it has the right imports
    if (!content.includes('useEditMode')) {
      console.log('⚠️ Book page needs manual review');
    } else {
      console.log('✅ Book page is already properly configured');
    }
  }

  run() {
    console.log('🔧 Fixing all editable text elements...');
    
    this.fixHomePage();
    this.fixAboutPage();
    this.fixHelpPage();
    this.fixBookPage();
    
    console.log('✅ All pages updated for editable text!');
  }
}

// Run the fixer
const fixer = new EditableTextFixer();
fixer.run(); 