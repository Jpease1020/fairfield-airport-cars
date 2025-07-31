# Import Fix Strategy - Global Find & Replace

## **Current Problem:**
- Design components moved from `design/` to `src/design/`
- Import paths are broken across the app
- Need unified import system

## **Solution: Global Find & Replace Strategy**

### **Step 1: Update tsconfig.json Paths (DONE)**
✅ Already updated to point to `./src/design/*`
✅ Added `@/ui` path for consolidated export

### **Step 2: Create Consolidated Export (DONE)**
✅ Created `src/design/ui.ts` - main UI components export
✅ Updated tsconfig.json with `@/ui` path

### **Step 3: Global Find & Replace Commands**

#### **Replace ALL component imports with unified export:**

**Replace `@/components/ui` with `@/ui`:**
```bash
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''@/components/ui'\''|from '\''@/ui'\''|g'
```

**Replace `@/components/layout` with `@/ui`:**
```bash
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''@/components/layout'\''|from '\''@/ui'\''|g'
```

**Replace `@/components/ui/layout/containers` with `@/ui`:**
```bash
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''@/components/ui/layout/containers'\''|from '\''@/ui'\''|g'
```

**Replace `@/design/components/core/layout/EditableSystem` with `@/ui`:**
```bash
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''@/design/components/core/layout/EditableSystem'\''|from '\''@/ui'\''|g'
```

### **Step 4: Test the Build**
```bash
npm run build
```

### **Step 5: Update Import Statements**

**Before:**
```tsx
import { Layout } from '@/components/layout';
import { Container, Text } from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
```

**After:**
```tsx
import { Layout, Container, Text, EditableText } from '@/ui';
```

## **Expected Result:**
- All imports point to `@/ui`
- Single unified export system
- Clean, maintainable import structure
- Working build system

## **Files to Check After Replacement:**
1. `src/app/about/page.tsx`
2. `src/app/book/page.tsx`
3. `src/app/portal/page.tsx`
4. All admin pages
5. All other app pages

## **Benefits of New Structure:**
- **Short imports**: `import { Button } from '@/ui'`
- **Single source**: All components from one place
- **Easy maintenance**: Add components to `src/design/ui.ts`
- **Type safety**: All exports properly typed
- **Clear naming**: `ui.ts` clearly indicates UI components

## **Backup Strategy:**
If this doesn't work, we can create individual export files for each component category and import them specifically. 