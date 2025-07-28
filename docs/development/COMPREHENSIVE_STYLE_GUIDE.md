# 🎨 Fairfield Airport Cars - Comprehensive Style Guide

> **Complete Development Standards** - Everything you need to build consistent, maintainable, and professional components and pages.

## 📋 **Overview**

This comprehensive style guide consolidates all our development standards into one unified document. It covers:
- **UI Component Standards** - Building production-ready components
- **Page Template & Layout System** - Unified page structure architecture
- **Component Usage Rules** - How to use components correctly
- **Development Patterns** - Best practices for the entire codebase

---

## 🚨 **AUTOMATED BLOCKERS IN PLACE**

**The following violations are automatically blocked by `npm run check:components`:**

### **🚫 FORBIDDEN PATTERNS (Will Block Commits):**
- ❌ `className` props in reusable components
- ❌ `<div>`, `<span>`, `<p>` tags for structure/text
- ❌ Wrong imports (Stack/Card from `@/components/ui` instead of `@/components/ui/layout`)
- ❌ Inline styles on reusable components

### **✅ REQUIRED PATTERNS:**
- ✅ Use component props (`variant`, `size`, `spacing`, `padding`)
- ✅ Use design system components (`Container`, `Stack`, `Card`, `Text`, `Span`)
- ✅ Import from correct paths (`@/components/ui/layout` for layout components)

**Current Status: 82 violations detected and blocked from committing**

---

## 🏗️ Page Template & Layout System Architecture

### Vision: Unified Page Structure System

**Goal:** Create a system where every page follows the same structural patterns, making the entire app consistent, maintainable, and customizable.

### Rule: Page Template Metadata System

**Why It Matters:** Enables admin customization and consistent page structure

```typescript
// ✅ GOOD - Page template metadata
interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'admin' | 'booking' | 'content';
  sections: PageSection[];
  layout: 'standard' | 'hero' | 'dashboard' | 'form' | 'grid';
  responsive: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface PageSection {
  id: string;
  type: 'hero' | 'content' | 'grid' | 'form' | 'cta' | 'footer';
  components: ComponentConfig[];
  layout: {
    cols: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    responsive: boolean;
  };
  spacing: {
    padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
}

interface ComponentConfig {
  id: string;
  type: string; // 'Button', 'Card', 'Text', etc.
  props: Record<string, any>;
  content?: EditableContent[];
  position: {
    row: number;
    col: number;
    span?: number;
  };
}
```

### Rule: Universal Grid Structure

**Why It Matters:** Every page uses the same layout foundation

```typescript
// ✅ GOOD - Standard page structure
const StandardPageLayout: React.FC<PageProps> = ({ template, content }) => {
  return (
    <PageContainer>
      <HeaderContainer>
        <IconContainer variant="default" size="md">
          {template.icon}
        </IconContainer>
        <ContentContainer direction="vertical" gap="sm">
          <EditableHeading level={1}>{template.title}</EditableHeading>
          <EditableText variant="body" color="secondary">
            {template.description}
          </EditableText>
        </ContentContainer>
        <ActionsContainer align="end" gap="sm">
          {template.actions}
        </ActionsContainer>
      </HeaderContainer>
      
      <Grid cols={template.layout.cols} gap={template.layout.gap} responsive={template.layout.responsive}>
        {template.sections.map(section => (
          <GridSection key={section.id} {...section.layout}>
            {section.components.map(component => (
              <ComponentRenderer key={component.id} config={component} />
            ))}
          </GridSection>
        ))}
      </Grid>
    </PageContainer>
  );
};

// ❌ BAD - Custom layouts per page
const CustomPage = () => (
  <div className="custom-page">
    <div className="custom-header">
      {/* Inconsistent structure */}
    </div>
  </div>
);
```

### Rule: Reusable Layout Components

**Why It Matters:** Eliminates code duplication and ensures consistency

```typescript
// ✅ GOOD - Use layout components from /layout directory
import { 
  IconContainer, 
  ContentContainer, 
  HeaderContainer, 
  ActionsContainer,
  Grid,
  GridSection,
  Container,
  Stack
} from '@/components/ui/layout';

// Every page uses these components
const PageSection: React.FC<SectionProps> = ({ children, layout }) => (
  <Container variant="section" padding={layout.padding}>
    <Grid cols={layout.cols} gap={layout.gap} responsive={layout.responsive}>
      {children}
    </Grid>
  </Container>
);

// ❌ BAD - Custom styled components per page
const PageSection = styled.div`
  /* Custom styles that duplicate layout components */
`;
```

### Rule: Component Library Architecture

**Why It Matters:** Enables drag-and-drop admin system

```typescript
// ✅ GOOD - Component registry system
const ComponentRegistry = {
  Button: { component: Button, defaultProps: { variant: 'primary' } },
  Card: { component: Card, defaultProps: { variant: 'default' } },
  Text: { component: Text, defaultProps: { variant: 'body' } },
  Heading: { component: EditableHeading, defaultProps: { level: 2 } },
  Grid: { component: Grid, defaultProps: { cols: 3, gap: 'md' } },
  // ... all components
};

const ComponentRenderer: React.FC<{ config: ComponentConfig }> = ({ config }) => {
  const Component = ComponentRegistry[config.type]?.component;
  if (!Component) return <div>Unknown component: {config.type}</div>;
  
  return (
    <Component 
      {...ComponentRegistry[config.type].defaultProps}
      {...config.props}
    >
      {config.content?.map(content => (
        <EditableContent key={content.id} {...content} />
      ))}
    </Component>
  );
};
```

### Rule: Admin Customization System

**Why It Matters:** Allows non-technical users to customize pages

```typescript
// ✅ GOOD - Drag-and-drop ready structure
interface AdminPageBuilder {
  templates: PageTemplate[];
  currentPage: PageTemplate;
  selectedComponent: ComponentConfig | null;
  dragState: {
    isDragging: boolean;
    draggedComponent: ComponentConfig | null;
    dropTarget: string | null;
  };
}

// Admin interface structure
const AdminPageBuilder: React.FC = () => (
  <div className="page-builder">
    <TemplateLibrary templates={templates} />
    <PageCanvas page={currentPage} onUpdate={updatePage} />
    <ComponentPalette onDragStart={handleDragStart} />
    <ComponentInspector component={selectedComponent} />
  </div>
);
```

---

## 🏗️ Page Structure Hierarchy

### **1. Page Layout Foundation**
Every page MUST use this exact structure:

```tsx
// 🔥 REQUIRED: Every page must follow this pattern
export default function PageName() {
  return (
    <ToastProvider>
      <PageContent />
    </ToastProvider>
  );
}

function PageContent() {
  const { addToast } = useToast();
  
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Page Title"
        subtitle="Page description"
      >
        {/* Page content using GridSection and InfoCard */}
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
```

### **2. Admin Pages Structure**
Admin pages use `AdminPageWrapper` instead:

```tsx
<AdminPageWrapper
  title="Admin Page Title"
  subtitle="Description of what this admin page does"
  actions={headerActions}
  loading={loading}
  error={error}
  errorTitle="Error Context"
>
  {/* Content using SettingSection */}
</AdminPageWrapper>
```

---

## 📦 **Component Usage Rules**

### **Content Organization**

#### **✅ DO: Use SettingSection for Admin Forms**
```tsx
<SettingSection
  title="Section Title"
  description="What this section is for"
  icon="🎯"
>
  <SettingInput
    id="field-id"
    label="Field Label"
    description="Help text for the user"
    value={value}
    onChange={setValue}
    placeholder="Helpful placeholder"
    icon="📝"
  />
</SettingSection>
```

#### **✅ DO: Use GridSection + InfoCard for Public Pages**
```tsx
<GridSection variant="content" columns={1}>
  <InfoCard
    title="Card Title"
    description="What this card contains"
  >
    {/* Card content */}
  </InfoCard>
</GridSection>
```

### **Form Input Standards**

#### **✅ DO: Use SettingInput for Admin Forms**
```tsx
<SettingInput
  id="unique-id"
  label="Human Readable Label"
  description="Help text explaining the field"
  value={value}
  onChange={setValue}
  placeholder="Helpful placeholder text"
  icon="📝"
  required={true}
  error={error}
/>
```

#### **✅ DO: Use Input for Public Forms**
```tsx
<Input
  id="email"
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  required
/>
```

---

## ✅ UI Component Standards

### **Production-Ready Component Checklist**

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

*This document consolidates all development standards into one comprehensive guide. Update regularly as our design system evolves.* 