# UI Component Standards

> **Production-Ready Component Checklist** - Follow these rules to build components as good as our Button component.

## 🎯 Overview

This document defines the standards for building UI components that are:
- **Accessible** - WCAG 2.1 AA compliant
- **Scalable** - Work across all screen sizes and use cases
- **Themeable** - Use centralized design tokens
- **Maintainable** - Clean, testable, and well-documented
- **Consistent** - Follow established patterns and conventions

---

## ✅ 1. Design System Compliance

### Rule: Use Design Tokens for All Styling

**Why It Matters:** Enables central control and theme support

```typescript
// ✅ GOOD - Use centralized tokens
import { colors, spacing, fontSize, borderRadius, shadows } from '@/lib/design-system/tokens';

const StyledComponent = styled.div`
  background-color: ${colors.primary[600]};
  padding: ${spacing.md};
  font-size: ${fontSize.md};
  border-radius: ${borderRadius.default};
  box-shadow: ${shadows.default};
`;

// ❌ BAD - Hardcoded values
const StyledComponent = styled.div`
  background-color: #2563eb;
  padding: 12px;
  font-size: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
```

### Rule: Never Hardcode Values

**Why It Matters:** Keeps styling consistent and responsive

```typescript
// ✅ GOOD - Use token scales
size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
variant: 'primary' | 'secondary' | 'outline' | 'ghost'
shape: 'default' | 'rounded' | 'pill' | 'square'

// ❌ BAD - Magic numbers
width: '10px'
height: '20px'
```

### Rule: Use Consistent Spacing and Typography Scales

**Why It Matters:** Creates predictable layouts

```typescript
// ✅ GOOD - Consistent scales
const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
};

const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
};
```

---

## ✅ 2. Styled-Component Hygiene

### Rule: Use `.withConfig({ shouldForwardProp })`

**Why It Matters:** Avoids React warnings & unexpected behavior

```typescript
// ✅ GOOD - Filter internal props
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'shape', 'fullWidth', 'loading', 'icon', 'iconPosition'].includes(prop)
})<ButtonProps>`
  /* styles */
`;

// ❌ BAD - Props leak to DOM
const StyledButton = styled.button<ButtonProps>`
  /* styles */
`;
```

### Rule: Filter Out Internal Props

**Why It Matters:** Keeps DOM clean and prevents warnings

```typescript
// ✅ GOOD - Comprehensive filtering
shouldForwardProp: (prop) => ![
  'variant', 'size', 'shape', 'fullWidth', 'loading', 
  'icon', 'iconPosition', 'as'
].includes(prop)

// ❌ BAD - Missing props
shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
```

### Rule: Prefer Semantic Elements

**Why It Matters:** Helps with accessibility and SEO

```typescript
// ✅ GOOD - Semantic elements
const StyledButton = styled.button`
  /* styles */
`;

const StyledLink = styled.a`
  /* styles */
`;

// ❌ BAD - Generic divs for interactive elements
const StyledButton = styled.div`
  /* styles */
`;
```

---

## ✅ 3. Accessibility (a11y)

### Rule: Use ARIA States

**Why It Matters:** Screen reader compatibility

```typescript
// ✅ GOOD - Proper ARIA attributes
<StyledButton
  aria-busy={loading}
  aria-disabled={disabled}
  aria-label={iconOnly ? label : undefined}
>
  {loading && <Spinner size="sm" />}
  <span aria-hidden={loading}>{children}</span>
</StyledButton>
```

### Rule: Keyboard Accessibility

**Why It Matters:** Required by WCAG

```typescript
// ✅ GOOD - Keyboard support
const StyledButton = styled.button`
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;
```

### Rule: Semantic HTML

**Why It Matters:** Improves accessibility tree

```typescript
// ✅ GOOD - Semantic elements
export const Button: React.FC<ButtonProps> = ({ as = 'button', ...props }) => (
  <StyledButton as={as} {...props} />
);

// Usage:
<Button as="a" href="/link">Link Button</Button>
<Button as="button" type="submit">Submit</Button>
```

### Rule: Label Icons

**Why It Matters:** Icons should not confuse assistive tech

```typescript
// ✅ GOOD - Icon labeling
{icon && (
  <IconWrapper 
    position={iconPosition}
    aria-label={iconLabel}
    aria-hidden={!iconLabel}
  >
    {icon}
  </IconWrapper>
)}
```

---

## ✅ 4. States & UX Feedback

### Rule: Include All Interactive States

**Why It Matters:** Visual affordance and feedback

```typescript
// ✅ GOOD - Complete state coverage
const StyledButton = styled.button`
  /* Base styles */
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;
```

### Rule: Loading States

**Why It Matters:** Shows the app is working

```typescript
// ✅ GOOD - Loading state with ARIA
{loading && (
  <>
    <Spinner size="sm" />
    <span aria-hidden={true}>{children}</span>
  </>
)}
```

### Rule: Never Disable Without Context

**Why It Matters:** Prevents user confusion

```typescript
// ✅ GOOD - Provide context
<Button 
  disabled={!isValid} 
  aria-describedby={!isValid ? 'error-message' : undefined}
>
  Submit
</Button>
{!isValid && (
  <div id="error-message" role="alert">
    Please fill in all required fields
  </div>
)}
```

---

## ✅ 5. Responsiveness & Flexibility

### Rule: Mobile-First Design

**Why It Matters:** Mobile usability

```typescript
// ✅ GOOD - Mobile-first approach
const StyledComponent = styled.div`
  padding: ${spacing.sm};
  
  @media (min-width: ${breakpoints.md}) {
    padding: ${spacing.md};
  }
  
  @media (min-width: ${breakpoints.lg}) {
    padding: ${spacing.lg};
  }
`;
```

### Rule: Support Layout Flexibility

**Why It Matters:** Reusability in different layouts

```typescript
// ✅ GOOD - Layout flexibility
export interface ComponentProps {
  fullWidth?: boolean;
  inline?: boolean;
  block?: boolean;
}

const StyledComponent = styled.div<ComponentProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  display: ${({ inline, block }) => {
    if (inline) return 'inline';
    if (block) return 'block';
    return 'inline-flex';
  }};
`;
```

### Rule: Use Flexible Layouts

**Why It Matters:** Fluid design

```typescript
// ✅ GOOD - Flexible layouts
const StyledComponent = styled.div`
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// ❌ BAD - Fixed widths
const StyledComponent = styled.div`
  width: 200px;
  height: 50px;
`;
```

---

## ✅ 6. Composability & Extensibility

### Rule: Accept `as` Prop

**Why It Matters:** Makes components flexible

```typescript
// ✅ GOOD - Polymorphic component
export interface ComponentProps {
  as?: 'button' | 'a' | 'div' | 'span';
}

export const Component: React.FC<ComponentProps> = ({ 
  as: Component = 'div', 
  ...props 
}) => (
  <StyledComponent as={Component} {...props} />
);
```

### Rule: Support Common Props

**Why It Matters:** Covers 80%+ of use cases

```typescript
// ✅ GOOD - Comprehensive prop support
export interface ComponentProps {
  // Variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  // Sizes
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // States
  disabled?: boolean;
  loading?: boolean;
  
  // Layout
  fullWidth?: boolean;
  
  // Icons
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // Shapes
  shape?: 'default' | 'rounded' | 'pill' | 'square';
}
```

### Rule: Allow Rest Props

**Why It Matters:** Keeps components adaptable

```typescript
// ✅ GOOD - Rest props support
export const Component: React.FC<ComponentProps> = ({ 
  variant = 'primary',
  size = 'md',
  ...rest 
}) => (
  <StyledComponent variant={variant} size={size} {...rest} />
);
```

---

## ✅ 7. Testability & Dev Experience

### Rule: Support Testing Props

**Why It Matters:** Enables UI testing with RTL or Cypress

```typescript
// ✅ GOOD - Testing support
export const Component: React.FC<ComponentProps> = ({ 
  'data-testid': testId,
  ...props 
}) => (
  <StyledComponent data-testid={testId} {...props} />
);

// Usage in tests:
<Component data-testid="submit-button" />
```

### Rule: TypeScript Types

**Why It Matters:** Avoids misuse by devs

```typescript
// ✅ GOOD - Comprehensive types
export interface ComponentProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'a' | 'div';
}
```

### Rule: Named Exports

**Why It Matters:** Helps tooling and auto-import

```typescript
// ✅ GOOD - Named exports
export const Button: React.FC<ButtonProps> = ({ ... }) => { ... };
export type { ButtonProps };

// ❌ BAD - Default exports
export default Button;
```

---

## ✅ 8. Animation & Performance

### Rule: Lightweight Transitions

**Why It Matters:** Avoids layout thrashing

```typescript
// ✅ GOOD - Performance-friendly animations
const StyledComponent = styled.div`
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

// ❌ BAD - Layout-heavy animations
const StyledComponent = styled.div`
  transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
`;
```

### Rule: Scoped Animations

**Why It Matters:** Keeps UI smooth

```typescript
// ✅ GOOD - Scoped keyframes
const StyledSpinner = styled.svg`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ❌ BAD - Global animations
// @keyframes spin { ... } // In global CSS
```

### Rule: Optimize Re-renders

**Why It Matters:** Boosts performance

```typescript
// ✅ GOOD - Memoized components
export const Button = React.memo<ButtonProps>(({ ... }) => {
  // Component logic
});

// ✅ GOOD - Split components
const ButtonContent = React.memo<ButtonContentProps>(({ ... }) => {
  // Content logic
});
```

---

## ✅ 9. Code Style Consistency

### Rule: Consistent Prop Order

**Why It Matters:** Easier to read and scan

```typescript
// ✅ GOOD - Consistent order
export const Component: React.FC<ComponentProps> = ({
  // 1. Core props
  children,
  
  // 2. Appearance
  variant = 'primary',
  size = 'md',
  shape = 'default',
  
  // 3. States
  disabled = false,
  loading = false,
  
  // 4. Layout
  fullWidth = false,
  
  // 5. Icons
  icon,
  iconPosition = 'left',
  
  // 6. Events
  onClick,
  
  // 7. HTML attributes
  type = 'button',
  as: Component = 'button',
  
  // 8. Rest props
  ...rest
}) => {
  // Component logic
};
```

### Rule: Destructure Props

**Why It Matters:** Cleaner, shorter logic

```typescript
// ✅ GOOD - Destructured props
export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}) => (
  <StyledComponent variant={variant} size={size} {...rest}>
    {children}
  </StyledComponent>
);

// ❌ BAD - Props object
export const Component: React.FC<ComponentProps> = (props) => (
  <StyledComponent {...props} />
);
```

---

## ✅ 10. Design-to-Code Readiness

### Rule: Match Figma Token Names

**Why It Matters:** Enables easier automation or handoff

```typescript
// ✅ GOOD - Figma-compatible naming
export interface ComponentProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'default' | 'rounded' | 'pill' | 'square';
}

// Design tokens match Figma
const colors = {
  primary: { 50: '#eff6ff', 100: '#dbeafe', /* ... */ },
  secondary: { 50: '#f8fafc', 100: '#f1f5f9', /* ... */ },
};
```

### Rule: Document Prop Combinations

**Why It Matters:** Prevents visual regressions

```typescript
// ✅ GOOD - Documented combinations
/**
 * Button Component
 * 
 * Common combinations:
 * - Primary + Medium + Default: Standard action buttons
 * - Secondary + Small + Rounded: Secondary actions
 * - Outline + Large + Pill: Call-to-action buttons
 * - Ghost + Small + Square: Icon-only buttons
 * 
 * Accessibility:
 * - All buttons are keyboard accessible
 * - Loading state includes aria-busy
 * - Icons are properly labeled
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => { ... };
```

### Rule: Centralized Token Definitions

**Why It Matters:** Cross-platform consistency

```typescript
// ✅ GOOD - Centralized tokens
// src/lib/design-system/tokens.ts
export const colors = { /* ... */ };
export const spacing = { /* ... */ };
export const fontSize = { /* ... */ };
export const borderRadius = { /* ... */ };
export const shadows = { /* ... */ };

// All components import from same source
import { colors, spacing, fontSize, borderRadius, shadows } from '@/lib/design-system/tokens';
```

---

## 🎯 Component Checklist

Use this checklist when building any new UI component:

### Design System
- [ ] Uses design tokens for all styling
- [ ] No hardcoded values (#fff, 10px, etc.)
- [ ] Follows spacing/typography scales
- [ ] Supports theme switching

### Styled Components
- [ ] Uses `.withConfig({ shouldForwardProp })`
- [ ] Filters internal props from DOM
- [ ] Uses semantic HTML elements
- [ ] No inline styles or className props

### Accessibility
- [ ] Includes proper ARIA attributes
- [ ] Keyboard accessible (tabIndex, Enter/Space)
- [ ] Screen reader compatible
- [ ] Icons are labeled or hidden

### States & UX
- [ ] Hover, focus, disabled states
- [ ] Loading states with feedback
- [ ] Error states with context
- [ ] Smooth transitions

### Responsiveness
- [ ] Mobile-first design
- [ ] Flexible layouts (no fixed widths)
- [ ] Supports fullWidth, inline, block
- [ ] Works at all breakpoints

### Composability
- [ ] Accepts `as` prop for polymorphism
- [ ] Supports common variants/sizes
- [ ] Allows rest props (...rest)
- [ ] Extensible for future needs

### Testing & DX
- [ ] Supports data-testid
- [ ] Comprehensive TypeScript types
- [ ] Named exports
- [ ] Well-documented props

### Performance
- [ ] Lightweight animations
- [ ] Scoped keyframes
- [ ] Optimized re-renders
- [ ] No layout thrashing

### Code Style
- [ ] Consistent prop order
- [ ] Destructured props
- [ ] Functional components
- [ ] Clean, readable code

---

## 🚀 Implementation Example

Here's how our Button component follows all these standards:

```typescript
import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/lib/design-system/tokens';
import { Spinner } from './spinner';

// Styled component with proper prop filtering
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'shape', 'fullWidth', 'loading', 'icon', 'iconPosition'].includes(prop)
})<ButtonProps>`
  /* All styles using design tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-shadow: ${shadows.default};
  opacity: ${({ loading }) => (loading ? 0.5 : 1)};
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: none;

  /* Size, variant, and shape styles using tokens */
  ${({ size }) => { /* size logic */ }}
  ${({ variant }) => { /* variant logic */ }}
  ${({ shape }) => { /* shape logic */ }}

  /* Interactive states */
  &:hover:not(:disabled) { opacity: 0.9; }
  &:focus { outline: 2px solid ${colors.primary[600]}; outline-offset: 2px; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// Clean component with proper types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  shape?: 'default' | 'rounded' | 'pill' | 'square';
  as?: 'button' | 'a' | 'div';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  shape = 'default',
  as: Component = 'button',
  ...rest
}) => {
  return (
    <StyledButton
      as={Component}
      variant={variant}
      size={size}
      shape={shape}
      fullWidth={fullWidth}
      loading={loading}
      type={Component === 'button' ? type : undefined}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {icon && !loading && iconPosition === 'left' && (
        <IconWrapper position="left">{icon}</IconWrapper>
      )}
      <span aria-hidden={loading}>{children}</span>
      {icon && !loading && iconPosition === 'right' && (
        <IconWrapper position="right">{icon}</IconWrapper>
      )}
    </StyledButton>
  );
};
```

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Styled Components Best Practices](https://styled-components.com/docs/basics#best-practices)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Design Tokens](https://www.designtokens.org/)

---

*This document should be reviewed and updated regularly as our design system evolves.* 