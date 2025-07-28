# 🚨 CRITICAL: NO CLASSNAME RULE

## **className is FORBIDDEN in Fairfield Airport Cars**

This is a **CRITICAL DESIGN SYSTEM RULE** that must be followed at all times.

### ❌ **WHAT IS FORBIDDEN:**

- `className` props in any component
- `className` in TypeScript interfaces
- `className` in object properties
- `className` in function parameters
- Custom CSS classes
- Inline styles
- Any form of className usage

### ✅ **WHAT TO USE INSTEAD:**

- **styled-components** for component styling
- **Design system tokens** for colors, spacing, typography
- **CSS variables** for dynamic values
- **Component variants** for different styles
- **Design system spacing** for layout

### 🔧 **CORRECT PATTERNS:**

```tsx
// ✅ CORRECT - Using styled-components
const StyledButton = styled.button`
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
`;

// ✅ CORRECT - Using design tokens
const Button = styled.button`
  background-color: ${colors.primary[600]};
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
`;

// ✅ CORRECT - Using component variants
<Button variant="primary" size="md">
  Click me
</Button>

// ✅ CORRECT - Using CSS variables
const Container = styled.div`
  max-width: var(--container-max-width);
  margin: 0 auto;
`;
```

### ❌ **INCORRECT PATTERNS:**

```tsx
// ❌ WRONG - className prop
<Button className="primary-button">Click me</Button>

// ❌ WRONG - className in interface
interface ButtonProps {
  className?: string; // FORBIDDEN
}

// ❌ WRONG - inline styles
<div style={{ backgroundColor: 'blue' }}>Content</div>

// ❌ WRONG - custom CSS classes
<div className="custom-styles">Content</div>
```

### 🚨 **ESLINT ENFORCEMENT:**

The ESLint configuration includes multiple rules to prevent className usage:

1. **no-restricted-properties** - Prevents className props
2. **no-restricted-globals** - Prevents global className usage
3. **no-restricted-syntax** - Prevents className in various contexts

### 🔍 **HOW TO FIX CLASSNAME USAGE:**

1. **Replace with styled-components:**
   ```tsx
   // Before
   <div className="card">Content</div>
   
   // After
   const StyledCard = styled.div`
     background: var(--background-primary);
     padding: var(--spacing-lg);
     border-radius: var(--border-radius-lg);
   `;
   <StyledCard>Content</StyledCard>
   ```

2. **Use design system tokens:**
   ```tsx
   // Before
   <div className="primary-button">Button</div>
   
   // After
   <Button variant="primary" size="md">Button</Button>
   ```

3. **Use CSS variables:**
   ```tsx
   // Before
   <div className="container">Content</div>
   
   // After
   const Container = styled.div`
     max-width: var(--container-max-width);
     margin: 0 auto;
   `;
   ```

### 🎯 **DESIGN SYSTEM COMPLIANCE:**

This rule ensures:
- **Consistency** across all components
- **Maintainability** through design tokens
- **Performance** through optimized styling
- **Accessibility** through proper semantic HTML
- **Scalability** through reusable patterns

### 📋 **CHECKLIST FOR NEW COMPONENTS:**

- [ ] No `className` props in interface
- [ ] No `className` usage in JSX
- [ ] Uses styled-components for styling
- [ ] Uses design system tokens
- [ ] Uses CSS variables for dynamic values
- [ ] Follows component variant patterns
- [ ] Passes ESLint validation

### 🚨 **CRITICAL REMINDER:**

**className is FORBIDDEN. Always use styled-components and design tokens instead.**

This rule is enforced by ESLint and will cause build failures if violated.

---

*This rule is critical for maintaining the design system integrity and ensuring consistent, maintainable code across the entire Fairfield Airport Cars application.* 