# 🎯 Cursor Agents Action Plan - July 27, 2025

## 🚀 IMMEDIATE PRIORITIES

### **PHASE 1: High Impact Files (>10 violations)**

#### 1. `src/app/privacy/page.tsx` (40 violations)
**Status**: 🔴 URGENT - Highest violation count
**Focus**: Replace div/span tags, fix className props, correct imports

**AI Prompt for this file:**
```
I need to refactor src/app/privacy/page.tsx to follow our design system rules. This file has 40 violations.

CRITICAL RULES:
- Replace <div> with <Container>, <Stack>, or <Card>
- Replace <span> with <Span> 
- Replace <p> with <Text>
- Replace <h1-h6> with <H1>, <H2>, etc.
- Replace <a> with <Link>
- Remove className props from reusable components
- Import Stack and Card from @/components/ui/containers
- Import other UI components from @/components/ui

Please refactor this file and test with 'npm run check:components'
```

#### 2. `src/app/admin/analytics-disabled/page.tsx` (27 violations)
**Status**: 🔴 URGENT - Second highest violation count
**Focus**: Nested containers, hardcoded text, wrong imports

**AI Prompt for this file:**
```
I need to refactor src/app/admin/analytics-disabled/page.tsx to follow our design system rules. This file has 27 violations.

CRITICAL RULES:
- Remove unnecessary nested Container components
- Replace <div> with <Container>, <Stack>, or <Card>
- Replace hardcoded text with EditableText where appropriate
- Fix wrong imports (Card should be from @/components/ui/containers)
- Import Stack and Card from @/components/ui/containers
- Import other UI components from @/components/ui

Please refactor this file and test with 'npm run check:components'
```

#### 3. `src/components/layout/CMSContentPage.tsx` (14 violations)
**Status**: 🟡 HIGH PRIORITY
**Focus**: Layout structure, nested components

#### 4. `src/app/book/booking-form.tsx` (10 violations)
**Status**: 🟡 HIGH PRIORITY
**Focus**: Form elements, inline styles

### **PHASE 2: Quick Wins (5-10 violations)**

#### 5. `src/app/admin/help/page.tsx` (8 violations)
#### 6. `src/app/cancel/page.tsx` (8 violations)
#### 7. `src/components/layout/CMSConversionPage.tsx` (7 violations)
#### 8. `src/components/layout/Navigation.tsx` (7 violations)
#### 9. `src/components/layout/PageHeader.tsx` (7 violations)
#### 10. `src/components/layout/StandardNavigation.tsx` (7 violations)

## 🔧 WORKFLOW FOR EACH FILE

### **Step 1: Choose Target**
Pick the next file from the priority list above.

### **Step 2: Use AI Prompt**
Use the specific AI prompt for that file (see examples above).

### **Step 3: Test Changes**
```bash
npm run check:components
```

### **Step 4: Commit Working Changes**
```bash
git add [filename]
git commit -m "refactor: fix JSX violations in [filename] - [X] violations resolved"
git push
```

### **Step 5: Update Progress**
```bash
npm run monitor:agents
```

## 🎯 SUCCESS METRICS

### **Target Goals**
- **Phase 1**: Reduce errors from 281 to <200
- **Phase 2**: Reduce errors from <200 to <150
- **Phase 3**: Reduce errors from <150 to <100

### **Progress Tracking**
- Track violations per file before/after
- Monitor total error count reduction
- Ensure no new errors introduced

## 🚨 COMMON BLOCKERS & SOLUTIONS

### **Blocker: "Property doesn't exist on type"**
**Solution**: Use native HTML tags for unsupported props
```tsx
// Instead of: <Span dangerouslySetInnerHTML={{ __html: content }} />
// Use: <span dangerouslySetInnerHTML={{ __html: content }} style={{...}} />
```

### **Blocker: "Import not found"**
**Solution**: Use correct import paths
```tsx
// Stack/Card: import { Stack, Card } from '@/components/ui/containers'
// Others: import { Component } from '@/components/ui'
```

### **Blocker: "Infinite recursion"**
**Solution**: Don't replace HTML tags INSIDE component definitions
```tsx
// ❌ Wrong: Inside H1 component definition
const H1 = ({ children }) => <H1>{children}</H1>

// ✅ Correct: Only replace in usage
const H1 = ({ children }) => <h1>{children}</h1>
```

## 📊 PROGRESS CHECKLIST

### **Before Starting Each File**
- [ ] Check current violation count: `npm run check:components`
- [ ] Note the specific violations for this file
- [ ] Use the appropriate AI prompt

### **After Each File**
- [ ] Test changes: `npm run check:components`
- [ ] Verify no new errors introduced
- [ ] Commit working changes
- [ ] Update progress: `npm run monitor:agents`

### **Weekly Goals**
- [ ] Complete Phase 1 (4 files)
- [ ] Reduce total errors by 50+
- [ ] No regression in violation count

## 🚀 QUICK START COMMANDS

```bash
# Check current status
npm run monitor:agents

# Start with highest priority file
# Use AI prompt for src/app/privacy/page.tsx

# Test changes
npm run check:components

# Commit working changes
git add src/app/privacy/page.tsx
git commit -m "refactor: fix JSX violations in privacy page"
git push

# Check progress
npm run monitor:agents
```

## 📞 SUPPORT RESOURCES

1. **Full Rules**: `CURSOR_AGENTS_READY.md`
2. **Quick Reference**: `scripts/cursor-agents-quick-reference.md`
3. **Unblocking Guide**: `scripts/cursor-agents-unblocking-guide.md`
4. **Monitoring**: `npm run monitor:agents`

---

**Remember**: Focus on ONE file at a time. Quality over quantity! 