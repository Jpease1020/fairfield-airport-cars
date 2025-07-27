# 🚀 Cursor Agents Quick Reference

## **Copy This AI Prompt Template:**

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

## **Quick Tag Replacements:**

| ❌ Forbidden | ✅ Allowed |
|-------------|-----------|
| `<div>` | `<Container>` |
| `<span>` | `<Span>` |
| `<p>` | `<Text>` or `<Paragraph>` |
| `<h1-h6>` | `<H1-H6>` |
| `<section>` | `<Section>` |
| `<article>` | `<Card>` |
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<textarea>` | `<Textarea>` |
| `<select>` | `<Select>` |
| `<label>` | `<Label>` |
| `<a>` | `<Link>` |
| `<img>` | `<Image>` |

## **Import Statements:**

```tsx
// ✅ Correct imports
import { Container, Stack, Card, Text, Span, H1, H2, H3, H4, H5, H6, Button, Input, Textarea, Select, Label, Fieldset, Legend, Link, Image, Form } from '@/components/ui';
import { Stack, Card } from '@/components/ui/containers';
```

## **Component Props Examples:**

```tsx
// ❌ Wrong
<Container className="p-4 max-w-lg">
<Button className="btn-primary">

// ✅ Correct
<Container padding="md" maxWidth="lg">
<Button variant="primary" size="md">
```

## **Priority Components to Fix:**

1. `src/components/admin/EditableField.tsx` - Fix span tag
2. `src/components/admin/SimpleCommentSystem.tsx` - Fix div tag  
3. `src/components/feedback/StarRating.tsx` - Fix className prop

## **Special Cases:**

### dangerouslySetInnerHTML:
```tsx
<span 
  dangerouslySetInnerHTML={{ __html: content }}
  style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}
/>
```

### Required Inline Styles:
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

## **Validation Checklist:**
- [ ] No className props in reusable components
- [ ] No generic HTML tags
- [ ] Correct import statements
- [ ] All functionality preserved
- [ ] Accessibility maintained

## **Report Progress:**
"Fixed component X, reduced violations from Y to Z. Ready for review." 