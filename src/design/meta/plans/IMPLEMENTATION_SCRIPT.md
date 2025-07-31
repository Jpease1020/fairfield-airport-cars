# 🚀 Design Directory Reorganization Implementation Script

## 📅 **Date**: January 27, 2025
## 🎯 **Purpose**: Execute the design directory reorganization step-by-step

---

## 🔧 **Phase 1: Foundation Setup**

### **Step 1.1: Create New Directory Structure**
```bash
# Create new directory structure
mkdir -p design/design-system/tokens
mkdir -p design/design-system/rules
mkdir -p design/design-system/documentation
mkdir -p design/design-system/utils

mkdir -p design/components/core/buttons
mkdir -p design/components/core/forms
mkdir -p design/components/core/layout
mkdir -p design/components/core/navigation
mkdir -p design/components/core/feedback

mkdir -p design/components/business/booking
mkdir -p design/components/business/admin
mkdir -p design/components/business/marketing
mkdir -p design/components/business/cms

mkdir -p design/components/icons/svg
mkdir -p design/components/providers

mkdir -p design/layout/templates
mkdir -p design/layout/navigation
mkdir -p design/layout/structure

mkdir -p design/templates/forms
mkdir -p design/templates/layouts
mkdir -p design/templates/marketing

mkdir -p design/documentation
```

### **Step 1.2: Consolidate Design Tokens**
```bash
# Move and split tokens into separate files
# Extract colors from design-system/tokens.ts
grep -A 50 "export const colors" design/design-system/tokens.ts > design/design-system/tokens/colors.ts

# Extract spacing from design-system/tokens.ts
grep -A 30 "export const spacing" design/design-system/tokens.ts > design/design-system/tokens/spacing.ts

# Extract typography from design-system/tokens.ts
grep -A 40 "export const fontFamily" design/design-system/tokens.ts > design/design-system/tokens/typography.ts

# Create main tokens index
echo "// Design System Tokens - Main Export
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './breakpoints';" > design/design-system/tokens/index.ts
```

### **Step 1.3: Consolidate CSS Variables**
```bash
# Move CSS variables to centralized location
cp design/styles/variables.css design/styles/variables.css.backup
# Keep variables.css as single source of truth
```

---

## 🔧 **Phase 2: Component Reorganization**

### **Step 2.1: Move Core UI Components**
```bash
# Move button components
mv design/components/ui/button.tsx design/components/core/buttons/
mv design/components/ui/EditableButton.tsx design/components/core/buttons/

# Move form components
mv design/components/ui/form.tsx design/components/core/forms/
mv design/components/ui/input.tsx design/components/core/forms/
mv design/components/ui/textarea.tsx design/components/core/forms/
mv design/components/ui/select.tsx design/components/core/forms/
mv design/components/ui/switch.tsx design/components/core/forms/
mv design/components/ui/voice-input.tsx design/components/core/forms/
mv design/components/ui/voice-output.tsx design/components/core/forms/

# Move layout components
mv design/components/ui/layout/* design/components/core/layout/
mv design/components/ui/Box.tsx design/components/core/layout/
mv design/components/ui/Container.tsx design/components/core/layout/
mv design/components/ui/Grid.tsx design/components/core/layout/
mv design/components/ui/Section.tsx design/components/core/layout/

# Move navigation components
mv design/components/ui/navigation/* design/components/core/navigation/

# Move feedback components
mv design/components/ui/Alert.tsx design/components/core/feedback/
mv design/components/ui/ToastProvider.tsx design/components/core/feedback/
mv design/components/ui/StatusMessage.tsx design/components/core/feedback/
mv design/components/ui/LoadingSpinner.tsx design/components/core/feedback/
```

### **Step 2.2: Move Business Components**
```bash
# Move booking components
mv design/components/booking/* design/components/business/booking/

# Move admin components
mv design/components/admin/* design/components/business/admin/

# Move marketing components
mv design/components/marketing/* design/components/business/marketing/

# Move CMS components
mv design/components/cms/* design/components/business/cms/
```

### **Step 2.3: Move Icons and Providers**
```bash
# Move icon components
mv design/components/icons/* design/components/icons/
mv design/components/ui/icons/* design/components/icons/

# Move providers
mv design/components/providers/* design/components/providers/
```

### **Step 2.4: Clean Up Empty Directories**
```bash
# Remove empty directories
find design/components -type d -empty -delete
find design/components/ui -type d -empty -delete
```

---

## 🔧 **Phase 3: Layout Reorganization**

### **Step 3.1: Move Layout Components**
```bash
# Move layout templates
mv design/layout/cms/* design/layout/templates/
mv design/layout/core/* design/layout/templates/

# Move navigation components
mv design/layout/navigation/* design/layout/navigation/

# Move structure components
mv design/layout/structure/* design/layout/structure/
```

### **Step 3.2: Update Layout Exports**
```bash
# Create new layout index
echo "// Layout Components - Main Export
export * from './templates';
export * from './navigation';
export * from './structure';" > design/layout/index.ts
```

---

## 🔧 **Phase 4: Template Reorganization**

### **Step 4.1: Organize Templates**
```bash
# Move form templates
mv design/templates/form-components.ts design/templates/forms/booking-form.ts
mv design/templates/form-components.ts design/templates/forms/contact-form.ts

# Move layout templates
mv design/templates/layout-components.ts design/templates/layouts/card-layout.ts
mv design/templates/layout-components.ts design/templates/layouts/grid-layout.ts

# Move marketing templates
mv design/templates/marketing-templates.ts design/templates/marketing/hero-section.ts
mv design/templates/marketing-templates.ts design/templates/marketing/feature-grid.ts
```

### **Step 4.2: Update Template Registry**
```bash
# Update registry.ts to reflect new structure
cp design/templates/registry.ts design/templates/registry.ts.backup
# Update registry with new paths
```

---

## 🔧 **Phase 5: Documentation Updates**

### **Step 5.1: Create New Documentation**
```bash
# Create component guide
echo "# Component Usage Guide

## Core Components
- Buttons: \`design/components/core/buttons/\`
- Forms: \`design/components/core/forms/\`
- Layout: \`design/components/core/layout/\`
- Navigation: \`design/components/core/navigation/\`
- Feedback: \`design/components/core/feedback/\`

## Business Components
- Booking: \`design/components/business/booking/\`
- Admin: \`design/components/business/admin/\`
- Marketing: \`design/components/business/marketing/\`
- CMS: \`design/components/business/cms/\`" > design/documentation/component-guide.md

# Create migration guide
echo "# Migration Guide

## Import Path Updates
- Old: \`design/components/ui/button\`
- New: \`design/components/core/buttons/button\`

## Token Updates
- Old: \`design/design-system/tokens\`
- New: \`design/design-system/tokens/colors\`" > design/documentation/migration-guide.md
```

### **Step 5.2: Update Main Documentation**
```bash
# Update main README
cp design/design-system/README.md design/documentation/README.md
# Update paths in README
```

---

## 🔧 **Phase 6: Import Path Updates**

### **Step 6.1: Find and Replace Import Paths**
```bash
# Update import paths in TypeScript files
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/components/ui/|design/components/core/|g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/components/admin/|design/components/business/admin/|g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/components/booking/|design/components/business/booking/|g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/components/marketing/|design/components/business/marketing/|g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/components/cms/|design/components/business/cms/|g'
```

### **Step 6.2: Update Design System Imports**
```bash
# Update design system imports
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|design/design-system/tokens|design/design-system/tokens/colors|g'
```

---

## 🔧 **Phase 7: Testing and Validation**

### **Step 7.1: Test Build Process**
```bash
# Test that the application still builds
npm run build

# Test that components can be imported
npm run test

# Test that styles are applied correctly
npm run dev
```

### **Step 7.2: Validate Structure**
```bash
# Check that all files are in correct locations
find design/ -type f -name "*.tsx" -o -name "*.ts" | sort

# Check for any remaining empty directories
find design/ -type d -empty

# Check for any broken imports
npm run lint
```

---

## 🎯 **Success Criteria**

### **✅ Phase 1 Complete When:**
- [ ] New directory structure created
- [ ] Design tokens consolidated
- [ ] CSS variables centralized
- [ ] No broken imports

### **✅ Phase 2 Complete When:**
- [ ] Components reorganized
- [ ] No duplicate components
- [ ] Empty directories removed
- [ ] All imports updated

### **✅ Phase 3 Complete When:**
- [ ] Layout components moved
- [ ] Navigation components organized
- [ ] Structure components in place
- [ ] Layout exports updated

### **✅ Phase 4 Complete When:**
- [ ] Templates reorganized
- [ ] Template registry updated
- [ ] No redundant templates
- [ ] Clear template structure

### **✅ Phase 5 Complete When:**
- [ ] Documentation updated
- [ ] Migration guide created
- [ ] Component guide created
- [ ] All paths updated

### **✅ Phase 6 Complete When:**
- [ ] All import paths updated
- [ ] No broken imports
- [ ] Application builds successfully
- [ ] Tests pass

### **✅ Phase 7 Complete When:**
- [ ] Application runs without errors
- [ ] All components render correctly
- [ ] Styles apply correctly
- [ ] No console errors

---

## 🚨 **Rollback Plan**

If issues arise during migration:

```bash
# Restore from backup
git checkout HEAD -- design/
# Or restore from specific backup files
cp design/styles/variables.css.backup design/styles/variables.css
cp design/templates/registry.ts.backup design/templates/registry.ts
```

---

*This script provides a step-by-step approach to reorganizing the design directory structure while maintaining functionality and minimizing disruption.* 