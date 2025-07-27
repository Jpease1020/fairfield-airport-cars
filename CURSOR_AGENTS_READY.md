# 🚀 Cursor Agents - JSX Cleanup Project

## **Project Overview**
You are helping refactor a React/Next.js codebase for Fairfield Airport Cars to follow a strict design system. The goal is to replace generic HTML tags with custom React components and remove className props from reusable components.

## **Current Status (BASELINE ESTABLISHED)**
- **Total Violations**: 617 (CONFIRMED BASELINE)
- **Files with Violations**: 73
- **Completed Components**: 2 (EditableField, SimpleCommentSystem)
- **Target**: Reduce violations by 100-150 in this session
- **Session Goal**: Fix 10-15 priority components

## **🎯 START HERE - Copy This AI Prompt**

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

## **Priority Components to Fix**

### **High Priority (Start Here)**
1. `src/components/feedback/StarRating.tsx` - Fix className prop
2. `src/app/layout.tsx` - Fix className prop
3. `src/app/admin/login/page.tsx` - Fix span tags and nested containers
4. `src/app/admin/bookings/page.tsx` - Fix className prop
5. `src/app/admin/calendar/page.tsx` - Fix nested containers

### **Medium Priority**
6. `src/app/admin/cms/business/page.tsx` - Fix span tags
7. `src/app/admin/cms/colors/page.tsx` - Fix div tag and inline styles
8. `src/app/admin/comments/page.tsx` - Fix div tags
9. `src/app/admin/costs/page.tsx` - Fix span tag
10. `src/app/admin/feedback/page.tsx` - Fix div tags

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

## **Special Cases**

### **dangerouslySetInnerHTML**
```tsx
<span 
  dangerouslySetInnerHTML={{ __html: content }}
  style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}
/>
```

### **Required Inline Styles**
```tsx
<div
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  }}
>
  <Container>
    {/* Content */}
  </Container>
</div>
```

## **Workflow**

1. **Copy the AI prompt template above**
2. **Choose a component from the priority list**
3. **Paste the component code into the prompt**
4. **Apply the refactoring**
5. **Test the changes**
6. **Report progress**

## **Progress Reporting**

### **Report Format**
```
"Fixed component X, reduced violations from Y to Z. Ready for review."
```

### **Example Reports**
- "Fixed StarRating.tsx, removed className prop. Ready for review."
- "Fixed layout.tsx, replaced className with proper props. Ready for review."
- "Fixed login page, replaced span tags with Span components. Ready for review."

## **Quality Checklist**

After each refactor, verify:
- [ ] No className props in reusable components
- [ ] No generic HTML tags
- [ ] Correct import statements
- [ ] All functionality preserved
- [ ] Accessibility maintained
- [ ] Component structure intact

## **Error Handling**

If you encounter errors:
1. **TypeScript errors**: Check component prop types
2. **Import errors**: Verify import paths
3. **Functionality breaks**: Revert and try different approach
4. **Accessibility issues**: Ensure ARIA attributes are preserved

## **Success Metrics**

### **Target Goals**
- **Components per session**: 10-15
- **Violations reduced per session**: 100-150
- **Error rate**: < 5%
- **Functionality preservation**: 100%

---

## **📊 MISSION SUMMARY FOR CURSOR AGENTS**

### **🎯 Your Mission**
You are JSX cleanup specialists! Your task is to systematically refactor React components to follow our strict design system rules. You have a clear roadmap and all the tools you need.

### **📈 Current Situation**
- **Baseline**: 617 violations across 73 files (CONFIRMED)
- **Progress**: 2 components already completed
- **Remaining**: 71 files need attention
- **Your Goal**: Fix 10-15 priority components this session

### **🛠 Your Tools**
1. **AI Prompt Template** - Copy/paste ready for each component
2. **Priority List** - High-impact components identified
3. **Quick Reference** - Tag replacements and import fixes
4. **Progress Tracker** - Real-time tracking system

### **🎯 Your Action Plan**
1. **Start with high priority components** (StarRating, layout, login)
2. **Use the AI prompt template** for each component
3. **Follow the workflow** (copy prompt → paste code → refactor → test → report)
4. **Report progress** in the standard format
5. **Work systematically** through the priority list

### **🏆 Success Criteria**
- **Quality**: 100% functionality preservation (non-negotiable)
- **Quantity**: 10-15 components fixed this session
- **Impact**: 100-150 violations reduced
- **Efficiency**: Systematic approach using provided tools

### **📞 Communication**
- **Report progress**: "Fixed [Component], reduced [X] violations. Ready for review."
- **Ask questions**: When you need clarification
- **Flag issues**: When you encounter complex problems
- **Sync regularly**: Keep the main developer informed

### **🚀 Ready to Launch!**

Your mission is clear, your tools are ready, and your targets are identified. The codebase cleanup depends on your systematic work. Focus on quality over speed, and follow the proven patterns we've established.

**Copy the AI prompt template above and start with `src/components/feedback/StarRating.tsx`!**

---

**🎯 Ready to start! Begin with the high priority components and use the AI prompt template for each one.** 