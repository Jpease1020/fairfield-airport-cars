# 🎯 CMS Implementation Rules - Iron-Clad Standards

## 📋 **Executive Summary**

This document establishes **iron-clad rules** for implementing CMS functionality based on the **working about page**. These rules are derived from analyzing what works and what doesn't, ensuring consistent CMS behavior across all pages.

## ✅ **Reference Implementation: About Page**

**File:** `src/app/(public)/about/page.tsx`  
**Status:** ✅ **WORKING** - CMS editing functions perfectly  
**Tested:** ✅ **MANUALLY VERIFIED** by user

## 🚨 **CRITICAL RULE: NEVER DUPLICATE InlineTextEditor**

### **❌ FORBIDDEN:**
- **NEVER** add `<InlineTextEditor>` to individual page components
- **NEVER** duplicate the InlineTextEditor component
- **NEVER** override the global InlineTextEditor

### **✅ CORRECT:**
- **ALWAYS** let the global `AppContent` component handle InlineTextEditor
- **ALWAYS** use the existing global InlineTextEditor instance
- **ALWAYS** rely on the main layout providers

## 🏗️ **Page Structure Rules**

### **Rule 1: Page Component Structure**
```tsx
// ✅ CORRECT - About page structure
function AboutPageContent() {
  const { cmsData } = useCMSData();
  const { isAdmin } = useAdmin();
  const { mode } = useInteractionMode();
  
  return (
    <>
      {/* Your content here */}
    </>
  );
}

export default function AboutPage() {
  return <AboutPageContent />;
}
```

### **Rule 2: NEVER Add Layout Components to Page**
```tsx
// ❌ FORBIDDEN - Don't add these to page components
<CustomerNavigation />
<Footer />
<InlineTextEditor />

// ✅ CORRECT - Let layout handle these
// The layout will automatically provide navigation, footer, and CMS editor
```

### **Rule 3: Use Route Groups for Layout**
```tsx
// ✅ CORRECT - About page uses (public) route group
src/app/(public)/about/page.tsx

// ✅ CORRECT - Home page should use route group
src/app/(public)/page.tsx  // NOT src/app/page.tsx
```

## 🔧 **CMS Implementation Rules**

### **Rule 4: Required Hooks (ALL PAGES)**
```tsx
// ✅ MANDATORY - Every CMS-enabled page MUST have these
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function MyPage() {
  const { cmsData } = useCMSData();        // ✅ REQUIRED
  const { isAdmin } = useAdmin();          // ✅ REQUIRED  
  const { mode } = useInteractionMode();   // ✅ REQUIRED
  
  // ... rest of component
}
```

### **Rule 5: Text Component Requirements**
```tsx
// ✅ CORRECT - Every editable text element MUST have:
<Text 
  data-cms-id="pages.page.section.field"  // ✅ REQUIRED
  mode={mode}                              // ✅ REQUIRED
>
  {getCMSField(cmsData, 'pages.page.section.field', 'Fallback Text')}
</Text>

// ❌ FORBIDDEN - Missing required props
<Text>Just text</Text>                    // ❌ No data-cms-id
<Text data-cms-id="field">Text</Text>     // ❌ No mode
<Text mode={mode}>Text</Text>             // ❌ No data-cms-id
```

### **Rule 6: Button Component Requirements**
```tsx
// ✅ CORRECT - Every editable button MUST have:
<Button
  data-cms-id="pages.page.section.button"  // ✅ REQUIRED
  interactionMode={mode}                    // ✅ REQUIRED (NOT mode)
  onClick={() => router.push('/path')}
>
  {getCMSField(cmsData, 'pages.page.section.button', 'Button Text')}
</Button>

// ❌ FORBIDDEN - Wrong prop usage
<Button mode={mode}>Text</Button>          // ❌ Use interactionMode, not mode
```

### **Rule 7: Heading Component Requirements**
```tsx
// ✅ CORRECT - Every editable heading MUST have:
<H1 
  data-cms-id="pages.page.section.title"  // ✅ REQUIRED
  mode={mode}                              // ✅ REQUIRED
>
  {getCMSField(cmsData, 'pages.page.section.title', 'Fallback Title')}
</H1>

// ❌ FORBIDDEN - Missing required props
<H1>Just a title</H1>                     // ❌ No data-cms-id
```

## 📁 **File Organization Rules**

### **Rule 8: Route Group Structure**
```tsx
// ✅ CORRECT - Use route groups for consistent layouts
src/app/(public)/page.tsx          // Home page
src/app/(public)/about/page.tsx    // About page
src/app/(public)/help/page.tsx     // Help page

// ❌ FORBIDDEN - Don't put pages in root app directory
src/app/page.tsx                   // ❌ Wrong location
```

### **Rule 9: Layout Inheritance**
```tsx
// ✅ CORRECT - Let route group layout handle navigation/footer
// (public)/layout.tsx provides CustomerNavigation and Footer

// ❌ FORBIDDEN - Don't duplicate layout components in pages
```

## 🔍 **Content Structure Rules**

### **Rule 10: CMS Path Naming Convention**
```tsx
// ✅ CORRECT - Hierarchical, descriptive paths
"pages.home.hero.title"
"pages.home.features.items.0.title"
"pages.about.cta.primaryButton"

// ❌ FORBIDDEN - Generic or unclear paths
"title"                              // ❌ Too generic
"hero.title"                         // ❌ Missing page context
"feature1"                           // ❌ Unclear structure
```

### **Rule 11: Fallback Content Requirements**
```tsx
// ✅ CORRECT - Meaningful, professional fallback text
{getCMSField(cmsData, 'pages.home.hero.title', 'Professional Airport Transportation')}

// ❌ FORBIDDEN - Generic or placeholder fallback text
{getCMSField(cmsData, 'pages.home.hero.title', 'Title')}           // ❌ Too generic
{getCMSField(cmsData, 'pages.home.hero.title', 'Lorem ipsum')}     // ❌ Placeholder text
```

## 🧪 **Testing Rules**

### **Rule 12: Manual Testing Checklist**
Before marking any page as "CMS Working", verify:

- [ ] **Edit Mode Toggle** - Alt+E or edit button works
- [ ] **Text Clicking** - Clicking text opens edit modal
- [ ] **Content Saving** - Changes save to Firebase
- [ ] **Real-time Updates** - Page updates immediately after save
- [ ] **No Console Errors** - Clean browser console
- [ ] **Admin Authentication** - Only admins can edit

### **Rule 13: Automated Testing Requirements**
```tsx
// ✅ REQUIRED - Every CMS-enabled page MUST have these tests
describe('CMS Functionality', () => {
  it('should render with fallback content when no CMS data', () => {
    // Test fallback text rendering
  });
  
  it('should render with CMS data when available', () => {
    // Test CMS data rendering
  });
  
  it('should have proper data-cms-id attributes', () => {
    // Test all editable elements have required attributes
  });
  
  it('should have proper mode props', () => {
    // Test all editable elements have mode prop
  });
});
```

## 🚫 **Common Failure Patterns**

### **Pattern 1: Duplicate InlineTextEditor**
```tsx
// ❌ FAILURE PATTERN - This breaks CMS functionality
function HomePage() {
  return (
    <>
      <HomePageContent />
      <InlineTextEditor isAdmin={isAdmin} editMode={mode === 'edit'} />  // ❌ DUPLICATE
    </>
  );
}

// ✅ SOLUTION - Remove duplicate, let AppContent handle it
function HomePage() {
  return <HomePageContent />;
}
```

### **Pattern 2: Wrong Route Structure**
```tsx
// ❌ FAILURE PATTERN - Page in wrong location
src/app/page.tsx  // ❌ Wrong - no layout inheritance

// ✅ SOLUTION - Move to route group
src/app/(public)/page.tsx  // ✅ Correct - inherits layout
```

### **Pattern 3: Missing Required Props**
```tsx
// ❌ FAILURE PATTERN - Missing CMS requirements
<Text>Just text</Text>  // ❌ No data-cms-id, no mode

// ✅ SOLUTION - Add required props
<Text 
  data-cms-id="pages.page.field"
  mode={mode}
>
  {getCMSField(cmsData, 'pages.page.field', 'Fallback Text')}
</Text>
```

## 🎯 **Implementation Checklist**

### **Before Creating Any CMS-Enabled Page:**

1. **✅ Route Group** - Use appropriate route group (public, customer, admin)
2. **✅ Required Hooks** - Import and use all three required hooks
3. **✅ Text Components** - Add data-cms-id and mode to all editable text
4. **✅ Button Components** - Add data-cms-id and interactionMode to all editable buttons
5. **✅ Heading Components** - Add data-cms-id and mode to all editable headings
6. **✅ Content Structure** - Use hierarchical CMS paths
7. **✅ Fallback Content** - Provide meaningful fallback text
8. **✅ NO InlineTextEditor** - Don't add CMS editor to page component
9. **✅ NO Layout Components** - Don't add navigation/footer to page component
10. **✅ Testing** - Verify manual testing checklist passes

## 🔧 **Fixing the Home Page**

### **Current Issues:**
1. **❌ Wrong Location** - `src/app/page.tsx` should be `src/app/(public)/page.tsx`
2. **❌ Duplicate InlineTextEditor** - Page has its own CMS editor
3. **❌ Duplicate Layout Components** - Page has navigation and footer
4. **❌ Wrong Route Structure** - Not inheriting from (public) layout

### **Fix Steps:**
1. **Move file** from `src/app/page.tsx` to `src/app/(public)/page.tsx`
2. **Remove** `<InlineTextEditor>` component from page
3. **Remove** `<CustomerNavigation>` and `<Footer>` from page
4. **Simplify** page structure to match about page pattern
5. **Test** using manual testing checklist

## 📚 **Reference Files**

- **✅ Working Implementation:** `src/app/(public)/about/page.tsx`
- **✅ Global CMS Editor:** `src/app/AppContent.tsx`
- **✅ Main Layout:** `src/app/layout.tsx`
- **✅ Route Group Layout:** `src/app/(public)/layout.tsx`
- **✅ CMS Service:** `src/lib/services/cms-service.ts`
- **✅ CMS Types:** `src/types/cms.ts`

---

**Last Updated:** January 2025  
**Status:** 🚨 **CRITICAL RULES** - Must follow exactly  
**Maintainer:** Development Team  
**Next Review:** After fixing home page
