# 🚀 Cursor Agents Progress Tracker

## **Current Status (Baseline)**
- **Total Violations**: 617
- **Files with Violations**: 73
- **Date**: $(date)

## **Priority Components for Cursor Agents**

### **High Priority (Start Here)**
1. `src/components/admin/EditableField.tsx` - Fix span tag ✅ **COMPLETED**
2. `src/components/admin/SimpleCommentSystem.tsx` - Fix div tag ✅ **COMPLETED**  
3. `src/components/feedback/StarRating.tsx` - Fix className prop
4. `src/app/layout.tsx` - Fix className prop
5. `src/app/admin/login/page.tsx` - Fix span tags and nested containers

### **Medium Priority**
6. `src/app/admin/bookings/page.tsx` - Fix className prop
7. `src/app/admin/calendar/page.tsx` - Fix nested containers
8. `src/app/admin/cms/business/page.tsx` - Fix span tags
9. `src/app/admin/cms/colors/page.tsx` - Fix div tag and inline styles
10. `src/app/admin/comments/page.tsx` - Fix div tags

### **Lower Priority**
11. `src/app/book/booking-form.tsx` - Fix p tags and label tags
12. `src/app/booking/[id]/edit/page.tsx` - Fix div tags and p tags
13. `src/app/cancel/page.tsx` - Fix p tags and ul/li tags
14. `src/app/privacy/page.tsx` - Fix section tags and ul/li tags
15. `src/app/success/page.tsx` - Fix ul/li tags

## **Violation Types Breakdown**

### **Critical Violations (Must Fix)**
- ❌ **className props**: ~50 violations
- ❌ **Generic HTML tags**: ~200 violations
  - `<div>` → `<Container>`
  - `<span>` → `<Span>`
  - `<p>` → `<Text>`
  - `<section>` → `<Section>`
  - `<ul>/<li>` → `<Stack>`
  - `<button>` → `<Button>`
  - `<input>` → `<Input>`
  - `<label>` → `<Label>`
- ❌ **Wrong imports**: ~20 violations
- ❌ **Inline styles**: ~30 violations
- ❌ **Nested components**: ~15 violations

### **Warnings (Optional)**
- ⚠️ **Hardcoded text**: ~300 warnings

## **Progress Tracking**

### **Session 1 - Cursor Agents**
- **Start Time**: $(date)
- **Target**: Fix 10-15 components
- **Goal**: Reduce violations by 100-150

### **Completed Components**
- [x] `src/components/admin/EditableField.tsx` - Fixed span tag
- [x] `src/components/admin/SimpleCommentSystem.tsx` - Fixed div tag
- [ ] `src/components/feedback/StarRating.tsx` - TODO
- [ ] `src/app/layout.tsx` - TODO
- [ ] `src/app/admin/login/page.tsx` - TODO

### **Current Progress**
- **Components Fixed**: 2/5
- **Violations Reduced**: TBD
- **Time Spent**: TBD

## **AI Prompt Template (Copy This)**

```
Refactor this component to follow our strict design system rules. Apply ALL the following rules:

## **🚫 FORBIDDEN PATTERNS (CRITICAL - MUST FIX):**
- ❌ NO className in reusable components → Use component props instead
- ❌ NO generic HTML tags → Replace with custom components
- ❌ NO inline styles → Use component props or CSS variables
- ❌ NO wrong imports → Use correct import paths

## **✅ REQUIRED PATTERNS:**
- ✅ Use component props instead of className
- ✅ Use correct import statements
- ✅ Maintain all functionality and accessibility
- ✅ Keep component structure intact

## **🔧 REFACTORING RULES:**
1. **ONLY replace HTML tags in JSX usage, NOT in component definitions**
2. **DO NOT change component return statements or definitions**
3. **Maintain all functionality and accessibility**
4. **Keep component structure intact**
5. **Use proper component props instead of className**
6. **Fix import statements to use correct paths**

## **📋 COMPONENT TO REFACTOR:**
[PASTE COMPONENT CODE HERE]
```

## **Quick Reference**

### **Tag Replacements**
| ❌ Forbidden | ✅ Allowed |
|-------------|-----------|
| `<div>` | `<Container>` |
| `<span>` | `<Span>` |
| `<p>` | `<Text>` |
| `<h1-h6>` | `<H1-H6>` |
| `<section>` | `<Section>` |
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<label>` | `<Label>` |

### **Import Fixes**
```tsx
// ❌ Wrong
import { Stack, Card } from '@/components/ui'

// ✅ Correct
import { Stack, Card } from '@/components/ui/containers'
```

### **Props Examples**
```tsx
// ❌ Wrong
<Container className="p-4 max-w-lg">

// ✅ Correct
<Container padding="md" maxWidth="lg">
```

## **Communication Protocol**

### **Report Progress**
```
"Fixed component X, reduced violations from Y to Z. Ready for review."
```

### **Ask Questions**
```
"Should I use Container or Section for this layout?"
"Component X has complex state, needs manual review"
```

### **Flag Issues**
```
"Encountered TypeScript error in component X"
"Functionality break detected, need guidance"
```

## **Success Metrics**

### **Target Goals**
- **Components per session**: 10-15
- **Violations reduced per session**: 100-150
- **Error rate**: < 5%
- **Functionality preservation**: 100%

### **Quality Checklist**
- [ ] No className props in reusable components
- [ ] No generic HTML tags
- [ ] Correct import statements
- [ ] All functionality preserved
- [ ] Accessibility maintained
- [ ] Component structure intact

## **Next Steps**

1. **Start with high priority components**
2. **Use the AI prompt template for each component**
3. **Test each change before moving to next**
4. **Report progress after each component**
5. **Sync changes when ready for review**

---

**Ready to start refactoring! Focus on one component at a time for quality.** 