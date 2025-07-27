# 🤖 **AI Prompt with Complete Linter Rules**

## **🎯 Comprehensive Refactoring Prompt for Cursor Agents**

Use this prompt with Cursor Agents to refactor components according to your exact linter rules:

---

```
Refactor this component to follow our strict design system rules. Apply ALL the following rules:

## **🚫 FORBIDDEN PATTERNS (CRITICAL - MUST FIX):**

### **HTML Tag Replacements:**
- ❌ `<div>` → Use `<Container>`, `<Stack>`, or `<Card>` for structure
- ❌ `<span>` → Use `<Span>` component for text
- ❌ `<p>` → Use `<Text>` component for text
- ❌ `<h1-h6>` → Use `<H1>`, `<H2>`, `<H3>`, `<H4>`, `<H5>`, `<H6>` components
- ❌ `<section>` → Use `<Section>` component
- ❌ `<article>` → Use `<Card>` component
- ❌ `<header>`, `<footer>`, `<main>`, `<aside>`, `<nav>` → Use `<Container>` component
- ❌ `<ul>`, `<ol>` → Use `<Stack>` component for lists
- ❌ `<li>` → Use `<Container>` component for list items
- ❌ `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` → Use design system table components
- ❌ `<form>` → Use `<Form>` component
- ❌ `<input>` → Use `<Input>` component
- ❌ `<textarea>` → Use `<Textarea>` component
- ❌ `<select>` → Use `<Select>` component
- ❌ `<label>` → Use `<Label>` component
- ❌ `<fieldset>` → Use `<Fieldset>` component
- ❌ `<legend>` → Use `<Legend>` component
- ❌ `<a>` → Use `<Link>` component
- ❌ `<img>` → Use `<Image>` component
- ❌ `<button>` → Use `<Button>` component

### **Component-Specific Rules:**
- ❌ `className` prop in reusable components → Use component props (variant, size, spacing, padding)
- ❌ Nested `<Container>` components → Remove nested, keep only outer one
- ❌ Nested `<Stack>` components → Remove nested, keep only outer one
- ❌ Nested `<Card>` components → Remove nested, keep only outer one
- ❌ Inline styles → Use component props instead

### **Import Rules:**
- ❌ `Stack` from `@/components/ui` → Import from `@/components/ui/containers`
- ❌ `Card` from `@/components/ui` → Import from `@/components/ui/containers`

## **✅ REQUIRED PATTERNS:**

### **Component Props (instead of className):**
- ✅ `Container`: Use `maxWidth`, `padding`, `margin` props
- ✅ `Stack`: Use `direction`, `spacing`, `align`, `justify` props
- ✅ `Card`: Use `variant`, `padding`, `hover` props
- ✅ `Text`: Use `variant`, `size`, `color` props
- ✅ `Button`: Use `variant`, `size`, `loading` props

### **Import Structure:**
- ✅ `Container`, `Text`, `H1-H6`, `Span` from `@/components/ui`
- ✅ `Stack`, `Card` from `@/components/ui/containers`
- ✅ `Button`, `Input`, `Form` from `@/components/ui`

## **⚠️ WARNINGS (Consider fixing):**
- ⚠️ Hardcoded text in `<Text>`, `<Span>`, `<H1-H6>`, `<Button>` → Consider using `<EditableText>` for database-driven content

## **🔧 REFACTORING RULES:**

1. **ONLY replace HTML tags in JSX usage, NOT in component definitions**
2. **DO NOT change component return statements or definitions**
3. **Maintain all functionality and accessibility**
4. **Keep component structure intact**
5. **Use proper component props instead of className**
6. **Fix import statements to use correct paths**

## **📋 COMPONENT TO REFACTOR:**

[PASTE COMPONENT CODE HERE]

## **🎯 EXPECTED OUTPUT:**
- All forbidden patterns fixed
- All required patterns implemented
- Component functionality preserved
- Accessibility maintained
- Clean, consistent code structure
```

---

## **🔧 Usage Instructions**

### **Step 1: Copy Component Code**
```bash
# Find a component with violations
npm run check:components | grep "className" | head -5

# Copy the component code from the file
```

### **Step 2: Apply AI Prompt**
1. Open Cursor Agents
2. Paste the comprehensive prompt above
3. Replace `[PASTE COMPONENT CODE HERE]` with your component code
4. Run the AI refactoring

### **Step 3: Validate Results**
```bash
# Check if violations were reduced
npm run check:components

# Test functionality
npm run test

# Build to check for errors
npm run build
```

## **🎯 Example Usage**

**Before applying AI:**
```tsx
// Component with violations
export const MyComponent = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Title</h1>
      <p>Description</p>
      <span>Details</span>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};
```

**After applying AI:**
```tsx
// Component following all rules
export const MyComponent = () => {
  return (
    <Container maxWidth="4xl" padding="lg" margin="auto">
      <H1>Title</H1>
      <Text>Description</Text>
      <Span>Details</Span>
      <Button onClick={handleClick}>Click me</Button>
    </Container>
  );
};
```

## **🚨 Safety Checklist**

Before committing AI-refactored code:
- [ ] All forbidden patterns fixed
- [ ] All required patterns implemented
- [ ] Component still functions correctly
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] Accessibility preserved
- [ ] Tests pass
- [ ] Visual appearance maintained

## **💡 Tips for Best Results**

1. **Apply to one component at a time**
2. **Review AI changes carefully**
3. **Test thoroughly before committing**
4. **Use git branches for safety**
5. **Keep rollback points**
6. **Document successful patterns**

---

**This prompt includes ALL your linter rules and will ensure Cursor Agents refactor components exactly according to your design system requirements.** 