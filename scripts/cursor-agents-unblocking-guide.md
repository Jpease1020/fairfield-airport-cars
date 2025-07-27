# 🔧 Cursor Agents Unblocking Guide

## 🚨 AGENTS STUCK? START HERE

### **Quick Diagnostic**
1. **Run the monitor**: `npm run monitor:agents`
2. **Check violations**: `npm run check:components`  
3. **Test build**: `npm run build`
4. **Check git status**: `git status`

---

## 🎯 COMMON BLOCKERS & SOLUTIONS

### **1. ❌ "Property doesn't exist on type" Errors**

**Problem**: Component doesn't support the prop you're trying to use.

**Solution**: Use native HTML tags for special cases:
```tsx
// ❌ This will fail
<Text dangerouslySetInnerHTML={{ __html: content }} />

// ✅ Use native HTML tag instead
<span 
  dangerouslySetInnerHTML={{ __html: content }}
  style={{ color: 'var(--text-primary)' }}
/>
```

**Special Cases Where You MUST Use Native HTML:**
- `dangerouslySetInnerHTML`
- Complex `style` objects for positioning
- Event handlers not supported by custom components
- Third-party component integration

---

### **2. 📦 "Cannot find module" Import Errors**

**Problem**: Wrong import paths.

**Solution**: Use these exact import patterns:
```tsx
// ❌ Wrong
import { Stack, Card } from '@/components/ui'

// ✅ Correct
import { Stack, Card } from '@/components/ui/containers'

// ❌ Wrong  
import { Container } from '@/components/ui/containers'

// ✅ Correct
import { Container, Text, Button, Input } from '@/components/ui'
```

**Import Cheat Sheet:**
- **Stack, Card**: `@/components/ui/containers`
- **Everything else**: `@/components/ui`

---

### **3. 🔄 "Infinite Recursion" or "Maximum Call Stack" Errors**

**Problem**: You're replacing HTML tags INSIDE component definitions.

**Solution**: Only replace tags in USAGE, not DEFINITIONS:
```tsx
// ❌ DON'T DO THIS (inside component definition)
export const MyButton = () => {
  return <Button>Click me</Button>; // This creates recursion!
}

// ✅ DO THIS (leave component definitions alone)
export const MyButton = () => {
  return <button>Click me</button>; // Keep as HTML tag
}

// ✅ ONLY REPLACE IN USAGE
<MyButton /> // Use the component
<Button>Click me</Button> // Or use Button component directly
```

**Rule**: Never replace HTML tags inside component return statements!

---

### **4. 🎨 "className prop not working" on Custom Components**

**Problem**: Custom components don't accept className props.

**Solution**: Use component-specific props:
```tsx
// ❌ Wrong
<Container className="p-4 max-w-lg bg-white">

// ✅ Correct
<Container padding="md" maxWidth="lg" variant="white">

// ❌ Wrong
<Button className="btn-primary btn-lg">

// ✅ Correct  
<Button variant="primary" size="lg">

// ❌ Wrong
<Stack className="space-y-4 flex-col">

// ✅ Correct
<Stack spacing="md" direction="vertical">
```

**Common Prop Conversions:**
- `className="p-4"` → `padding="md"`
- `className="max-w-lg"` → `maxWidth="lg"`
- `className="space-y-4"` → `spacing="md"`
- `className="flex-col"` → `direction="vertical"`

---

### **5. 🔍 TypeScript Errors After Refactoring**

**Problem**: Component props don't match expected types.

**Solution**: Check component definitions or use native HTML:
```tsx
// ❌ If this fails with TypeScript errors
<Input placeholder="Enter text" customProp="value" />

// ✅ Try native HTML tag instead
<input placeholder="Enter text" customProp="value" />
```

**Quick Fix Strategy:**
1. Try the custom component first
2. If TypeScript errors, use native HTML tag
3. Focus on fixing violations, not perfecting props

---

### **6. 🏗️ Build Failing After Changes**

**Problem**: Your changes broke the build.

**Solution**: Test incrementally:
```bash
# Test your changes
npm run build

# If it fails, check specific issues
npm run check:components

# Revert if needed
git checkout -- [filename]

# Make smaller changes
```

**Safe Approach:**
1. Make ONE change at a time
2. Test with `npm run build`
3. Commit working changes: `git add . && git commit -m "fix: [description]"`
4. Move to next change

---

## 🎯 STEP-BY-STEP UNBLOCKING PROCESS

### **If You're Completely Stuck:**

1. **Choose ONE high-priority file**:
   ```bash
   npm run monitor:agents
   ```
   Pick the first file from the "HIGH PRIORITY FILES" list.

2. **Start with the simplest violation**:
   - Look for `<div>` tags → replace with `<Container>`
   - Look for `<span>` tags → replace with `<Span>`
   - Look for `className` props → convert to component props

3. **Use the AI prompt template**:
   Copy this from `CURSOR_AGENTS_READY.md` and paste the file content.

4. **Test your change**:
   ```bash
   npm run check:components
   npm run build
   ```

5. **Commit if it works**:
   ```bash
   git add .
   git commit -m "fix: replace div with Container in [filename]"
   ```

6. **Move to next violation**.

---

## 🚀 PRIORITY FILES TO UNBLOCK ON

### **Start Here (High Impact)**
Run `npm run monitor:agents` to get current priorities, but typically:

1. `src/app/privacy/page.tsx` - Many section/ul/li tags
2. `src/app/admin/analytics-disabled/page.tsx` - Multiple violations  
3. `src/components/layout/CMSContentPage.tsx` - Structural issues
4. `src/app/book/booking-form.tsx` - Form-related violations

### **Quick Wins (Easy Fixes)**
- Any file with `<div>` tags
- Any file with `<span>` tags  
- Any file with `className` props
- Any file with `<button>` tags

---

## 📋 AI PROMPT TEMPLATE (COPY-PASTE READY)

```
I need to refactor this React component to follow strict design system rules. Here are the requirements:

🚫 FORBIDDEN (MUST FIX):
- ❌ NO className props on reusable components
- ❌ NO generic HTML tags (div, span, p, button, etc.)
- ❌ NO wrong import paths

✅ REQUIRED:
- ✅ Replace div → Container
- ✅ Replace span → Span  
- ✅ Replace p → Text
- ✅ Replace button → Button
- ✅ Use component props instead of className
- ✅ Import Stack/Card from @/components/ui/containers
- ✅ Import other components from @/components/ui

SPECIAL RULES:
- Keep native HTML tags for dangerouslySetInnerHTML
- Don't replace HTML tags INSIDE component definitions
- Only replace tags in component USAGE

COMPONENT TO REFACTOR:
[PASTE YOUR COMPONENT CODE HERE]
```

---

## 🆘 EMERGENCY PROTOCOLS

### **If Nothing Is Working:**
1. **Reset to known good state**:
   ```bash
   git stash
   npm run check:components
   ```

2. **Pick the simplest file**:
   Look for a file with only 1-2 violations.

3. **Make minimal changes**:
   Fix just ONE violation at a time.

4. **Ask for help**:
   Share the specific error message and what you tried.

### **If Build Keeps Failing:**
1. **Check for syntax errors**:
   Look for unclosed tags, missing imports, typos.

2. **Revert recent changes**:
   ```bash
   git checkout HEAD~1
   ```

3. **Start over with a different file**.

---

## ✅ SUCCESS CHECKLIST

After each fix, verify:
- [ ] `npm run build` passes
- [ ] `npm run check:components` shows fewer violations
- [ ] No new TypeScript errors
- [ ] Component still functions correctly
- [ ] Changes committed to git

---

## 📞 GETTING HELP

**If you're stuck for more than 10 minutes on one issue:**

1. **Document what you tried**:
   - What file you're working on
   - What change you attempted  
   - What error you got

2. **Share specific error messages**

3. **Try a different file** - don't get stuck on one problem

4. **Focus on quantity over perfection** - it's better to fix 5 simple violations than struggle with 1 complex one

---

**Remember**: The goal is to reduce violation counts systematically. Some violations might need manual review later - focus on the ones you can fix confidently!

🚀 **Ready to get unblocked? Start with `npm run monitor:agents` to see current priorities!**