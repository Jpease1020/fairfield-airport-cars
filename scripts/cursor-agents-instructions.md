# 🚀 Cursor Agents JSX Cleanup Instructions

## **Project Context**
You are helping refactor a React/Next.js codebase for Fairfield Airport Cars to follow a strict design system. The goal is to replace generic HTML tags with custom React components and remove className props from reusable components.

## **Critical Rules (MUST FOLLOW)**

### 🚫 FORBIDDEN PATTERNS (CRITICAL - MUST FIX):
1. **NO className in reusable components** - Use component props instead
2. **NO generic HTML tags** - Replace with custom components:
   - `<div>` → `<Container>`
   - `<span>` → `<Span>`
   - `<p>` → `<Text>` or `<Paragraph>`
   - `<h1-h6>` → `<H1-H6>`
   - `<section>` → `<Section>`
   - `<article>` → `<Card>`
   - `<header>` → `<Container>`
   - `<footer>` → `<Container>`
   - `<main>` → `<Container>`
   - `<aside>` → `<Container>`
   - `<nav>` → `<Container>`
   - `<ul>`, `<ol>`, `<li>` → Use `<Stack>` with proper spacing
   - `<table>` → Use `<DataTable>` component
   - `<form>` → Use `<Form>` component
   - `<a>` → Use `<Link>` component
   - `<img>` → Use `<Image>` component
   - `<button>` → Use `<Button>` component
   - `<input>` → Use `<Input>` component
   - `<textarea>` → Use `<Textarea>` component
   - `<select>` → Use `<Select>` component
   - `<label>` → Use `<Label>` component
   - `<fieldset>` → Use `<Fieldset>` component
   - `<legend>` → Use `<Legend>` component

3. **NO inline styles** - Use component props or CSS variables
4. **NO wrong imports** - Use correct import paths:
   - `Stack` and `Card` from `@/components/ui/containers`
   - Other components from `@/components/ui`

### ✅ REQUIRED PATTERNS:
1. **Use component props instead of className**:
   - `<Container padding="md" maxWidth="lg">` instead of `<Container className="p-4 max-w-lg">`
   - `<Stack spacing="md" direction="vertical">` instead of `<Stack className="space-y-4">`
   - `<Button variant="primary" size="md">` instead of `<Button className="btn-primary">`

2. **Use correct import statements**:
   ```tsx
   import { Container, Stack, Card, Text, Span, H1, H2, H3, H4, H5, H6, Button, Input, Textarea, Select, Label, Fieldset, Legend, Link, Image, Form } from '@/components/ui';
   import { Stack, Card } from '@/components/ui/containers';
   ```

## **AI Prompt Template**

Use this exact prompt for each component you refactor:

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

## **Example Refactoring Patterns**

### Before (❌ Violations):
```tsx
import { Container } from '@/components/ui';

export const MyComponent = ({ className }) => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold">Title</h1>
      <p className="text-gray-600">Content</p>
      <button className="btn-primary">Click me</button>
    </div>
  );
};
```

### After (✅ Fixed):
```tsx
import { Container, H1, Text, Button } from '@/components/ui';

export const MyComponent = ({ variant = 'default' }) => {
  return (
    <Container padding="md" maxWidth="lg">
      <H1>Title</H1>
      <Text variant="muted">Content</Text>
      <Button variant="primary">Click me</Button>
    </Container>
  );
};
```

## **Special Cases**

### 1. dangerouslySetInnerHTML
If you need `dangerouslySetInnerHTML`, use a regular HTML tag with proper styling:
```tsx
<span 
  dangerouslySetInnerHTML={{ __html: content }}
  style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}
/>
```

### 2. Inline Styles Required
If inline styles are absolutely necessary (like positioning), use regular HTML tags:
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

## **Validation Checklist**

After each refactor, verify:
- [ ] No className props in reusable components
- [ ] No generic HTML tags (div, span, p, h1-h6, etc.)
- [ ] Correct import statements
- [ ] All functionality preserved
- [ ] Accessibility maintained
- [ ] Component structure intact

## **Files to Focus On**

Priority components for refactoring:
1. `src/components/admin/EditableField.tsx` - Fix span tag and className
2. `src/components/admin/SimpleCommentSystem.tsx` - Fix div tag
3. `src/components/feedback/StarRating.tsx` - Fix className prop
4. Any component with className props
5. Any component with generic HTML tags

## **Error Handling**

If you encounter errors:
1. **TypeScript errors**: Check component prop types
2. **Import errors**: Verify import paths
3. **Functionality breaks**: Revert and try different approach
4. **Accessibility issues**: Ensure ARIA attributes are preserved

## **Communication Protocol**

When working with the main developer:
1. **Report progress**: "Fixed 3 components, 2 violations remaining"
2. **Ask questions**: "Should I use Container or Section for this layout?"
3. **Flag issues**: "Component X has complex state, needs manual review"
4. **Request sync**: "Ready to sync changes, please review"

## **Performance Notes**

- Focus on one component at a time
- Test each change before moving to next
- Keep changes small and focused
- Document any complex decisions
- Maintain git history with clear commit messages

## **Success Metrics**

Track these metrics:
- Components refactored per session
- Violations reduced per component
- Time saved vs manual refactoring
- Error rate (should be < 5%)
- Functionality preservation rate (should be 100%)

---

**Ready to start refactoring! Copy the AI prompt template and begin with the priority components.**
