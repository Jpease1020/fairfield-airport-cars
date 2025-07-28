# UI Component Standards

## 🎯 Overview

This document outlines the standards and guidelines for UI components in the Fairfield Airport Cars project. Following these standards ensures consistency, maintainability, and accessibility across the entire application.

## 📋 Core Principles

### 1. **Design System Compliance**
- **All styling must use design tokens** from `@/lib/design-system/tokens`
- **No inline styles** except for rare, documented exceptions
- **No className or cn utility** in reusable UI components
- **No direct HTML tags** (`div`, `span`, `p`) for structure/text - use design system primitives

### 2. **Import Structure**
```typescript
// ✅ CORRECT - Layout components
import { Container, Stack, Grid, Section, Card, Box } from '@/components/ui/layout/containers';
import { Grid } from '@/components/ui/layout/grid';

// ❌ WRONG - Old containers
import { Stack } from '@/components/ui/containers';

// ✅ CORRECT - UI components
import { Text, Button, Input, Label } from '@/components/ui';
```

### 3. **Component Organization**
```
src/components/ui/
├── layout/           # Layout primitives (Container, Stack, Grid, etc.)
│   ├── containers.tsx
│   ├── grid.tsx
│   └── index.ts
├── core/            # Core UI components
├── feedback/        # Status, alerts, notifications
├── forms/           # Form components
└── index.ts         # Main exports
```

## 🏗️ Layout Components

### **Container System**
```typescript
// Container variants
<Container variant="default" padding="md">
<Container variant="elevated" padding="lg">
<Container variant="card" padding="sm">

// Stack for layout
<Stack direction="vertical" spacing="md">
<Stack direction="horizontal" spacing="sm" align="center">

// Grid for responsive layouts
<Grid cols={3} gap="md">
```

### **Available Layout Components**
- `Container` - Basic container with variants
- `Box` - Simple container with rounded corners
- `Section` - Page sections with variants
- `Card` - Card container with hover states
- `Stack` - Flexbox layout with spacing
- `Grid` - CSS Grid layout
- `Layout` - Page-level layout wrapper
- `Spacer` - Vertical/horizontal spacing

## 🎨 UI Components

### **Icon Library**
```typescript
// ✅ CORRECT - Use icon library
import { PhoneIcon, WarningIcon, LoadingSpinnerIcon } from '@/components/ui/icons';

<PhoneIcon size="md" />
<WarningIcon size="lg" />
<LoadingSpinnerIcon size="sm" />

// ❌ WRONG - Inline SVG
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="..." />
</svg>
```

**Available Icons:**
- **Navigation**: ChevronDown, ChevronRight, ArrowRight
- **Contact**: Phone, Email, Message, WhatsApp  
- **Status**: CheckCircle, AlertTriangle, Info, Clock, Warning
- **Loading**: LoadingSpinner
- **Actions**: Refresh, Close, Edit, Save, Cancel
- **User**: User, UserGroup
- **Location**: MapPin, Location
- **Vehicle**: Car, Truck
- **Payment**: CreditCard, Dollar
- **Notification**: Bell, Notification

### **Text Components**
```typescript
// Text variants
<Text size="sm" variant="body">
<Text size="lg" variant="lead">
<H1 size="xl">Title</H1>
<H2 size="lg">Subtitle</H2>
<Span>Inline text</Span>
```

### **Form Components**
```typescript
// Form fields with proper accessibility
<Label htmlFor="field-id" required>Field Label</Label>
<Input id="field-id" aria-describedby="error-id" />
<Textarea id="field-id" aria-invalid="true" />
<Select id="field-id" aria-describedby="help-id" />
```

### **Interactive Components**
```typescript
// Button variants
<Button variant="primary" size="md">
<Button variant="outline" size="sm">
<Button variant="ghost" size="lg">

// Status components
<StatusBadge status="success" size="md">
<Alert variant="error" title="Error">
<ToastProvider>
```

## ♿ Accessibility Standards

### **Required ARIA Attributes**
```typescript
// Form fields
aria-invalid={error ? 'true' : 'false'}
aria-describedby={error ? 'error-id' : 'help-id'}

// Interactive elements
aria-label="Close dialog"
aria-expanded={isOpen}
aria-controls="menu-id"
```

### **Keyboard Navigation**
- All interactive elements must be keyboard accessible
- Focus management for modals and dialogs
- Skip links for main content
- Logical tab order

### **Screen Reader Support**
- Proper heading hierarchy (H1 → H2 → H3)
- Descriptive alt text for images
- ARIA labels for icons and buttons
- Error messages associated with form fields

## 🔧 Component Patterns

### **Error Handling**
```typescript
interface ComponentProps {
  error?: string;
  helperText?: string;
  required?: boolean;
}

// Always provide error and help text IDs
const fieldId = `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
const errorId = `${fieldId}-error`;
const helpId = `${fieldId}-help`;
```

### **Loading States**
```typescript
// Use LoadingState component
<LoadingState 
  title="Loading..."
  subtitle="Please wait"
  size="md"
  variant="centered"
/>
```

### **Empty States**
```typescript
// Use EmptyState component
<EmptyState 
  title="No data"
  message="Try adjusting your filters"
  icon="📊"
  action={<Button>Add Item</Button>}
/>
```

## 🚫 Anti-Patterns

### **Never Use**
```typescript
// ❌ NO className in UI components
<div className="flex items-center">

// ❌ NO direct HTML tags for structure
<div>Content</div>
<span>Text</span>

// ❌ NO inline styles
style={{ color: 'red', padding: '10px' }}

// ❌ NO old container imports
import { Stack } from '@/components/ui/containers';
```

### **Always Use**
```typescript
// ✅ Design system components
<Container variant="default" padding="md">
<Stack direction="vertical" spacing="sm">
<Text size="sm" variant="body">

// ✅ Design tokens
colors.primary[500]
spacing.md
fontSize.lg
```

## 🧪 Testing Requirements

### **Component Testing**
- Unit tests for all UI components
- Accessibility testing with screen readers
- Keyboard navigation testing
- Visual regression testing

### **Integration Testing**
- Form submission flows
- Error state handling
- Loading state transitions
- Responsive behavior

## 📚 Documentation

### **Component Documentation**
```typescript
/**
 * Button component with multiple variants
 * 
 * @example
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}
```

### **Storybook Integration**
- All components should have Storybook stories
- Include all variants and states
- Document accessibility features
- Show responsive behavior

## 🔄 Migration Guide

### **Updating Old Components**
1. Replace `className` with design system props
2. Update imports to use new layout structure
3. Add proper accessibility attributes
4. Use design tokens for styling
5. Test with screen readers

### **Example Migration**
```typescript
// Before
<div className="flex items-center p-4 bg-gray-100">
  <span className="text-sm text-gray-600">Label</span>
</div>

// After
<Container variant="default" padding="md">
  <Stack direction="horizontal" align="center">
    <Text size="sm" variant="muted">Label</Text>
  </Stack>
</Container>
```

## 🎯 Quality Checklist

### **Before Committing**
- [ ] No `className` usage in UI components
- [ ] All imports use new layout structure
- [ ] Proper ARIA attributes included
- [ ] Design tokens used for styling
- [ ] Component has proper TypeScript interfaces
- [ ] Accessibility tested
- [ ] Responsive behavior verified
- [ ] Error states handled
- [ ] Loading states implemented

### **Code Review Checklist**
- [ ] Follows design system patterns
- [ ] Uses correct import paths
- [ ] Includes proper accessibility
- [ ] Handles edge cases
- [ ] Has appropriate error handling
- [ ] Uses design tokens consistently
- [ ] No anti-patterns present

## 📞 Support

For questions about UI component standards:
1. Check this document first
2. Review existing components for patterns
3. Ask in the team chat
4. Create an issue for unclear cases

---

**Remember**: Clean, accessible, and consistent UI components are the foundation of a great user experience. Follow these standards to ensure our application remains maintainable and user-friendly. 