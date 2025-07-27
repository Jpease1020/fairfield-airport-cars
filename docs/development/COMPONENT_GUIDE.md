# Component System Guide

This guide covers our comprehensive component system built with React, TypeScript, and our design system.

## 🚨 CRITICAL COMPONENT REFACTORING RULES

**NEVER remove reusable components during refactoring!**

### **FORBIDDEN:**
- ❌ Replacing `<GridSection>`, `<InfoCard>`, `<ActionButtonGroup>` with custom HTML
- ❌ Removing component architecture for styling purposes
- ❌ Breaking component reusability
- ❌ Adding custom `className` to page/feature components (use reusable components instead)

### **REQUIRED:**
- ✅ Keep reusable components intact
- ✅ Refactor components internally (replace Tailwind/inline styles with semantic CSS)
- ✅ Maintain component props and interfaces
- ✅ Preserve component architecture and reusability
- ✅ Use reusable components instead of custom `className` in pages/features

**See: `docs/development/COMPONENT_REFACTORING_RULES.md` for detailed guidelines.**

## 🎯 Recent Codebase Cleanup Achievements

### **✅ Systematic className Removal (January 2025)**
- **Reduced className instances from 1539 to ~230** (85% reduction)
- **Established clear architecture**: Reusable components keep `className`, pages/features use reusable components
- **Improved maintainability**: Consistent component usage across codebase
- **Enhanced developer experience**: Clear patterns for component usage

### **✅ Component Architecture Standardization**
- **Reusable Components** (`src/components/ui/`): Keep `className` for flexibility and internal styling
- **Page/Feature Components** (`src/app/`, `src/components/marketing/`): Use reusable components with props, no custom `className`
- **Design System Integration**: Consistent use of `Container`, `Stack`, `Text`, `H3`, `H4`, `Span` components

### **✅ Code Quality Improvements**
- **Removed hundreds of unused imports and variables**
- **Fixed ESLint warnings and errors**
- **Improved code consistency and maintainability**
- **Enhanced component reusability patterns**

## 🎯 Design Principles

### 1. **Single Responsibility**
Each component has one clear purpose and handles one specific concern.

```tsx
// ✅ Good - Single purpose
const StatusBadge = ({ status }: { status: BookingStatus }) => {
  return <Badge className={getStatusColor(status)}>{status}</Badge>
}

// ❌ Bad - Multiple responsibilities
const BookingCard = ({ booking, onEdit, onDelete, onView, showActions, showPrice, showNotes }) => {
  // Too many responsibilities
}
```

### 2. **Composition Over Configuration**
Use compound components and flexible props instead of rigid configuration.

```tsx
// ✅ Good - Flexible composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Bad - Rigid configuration
<Card title="Title" description="Description" content="Content" />
```

### 3. **Accessibility First**
All components include proper ARIA attributes and keyboard navigation.

```tsx
// ✅ Good - Accessible
<button
  aria-label="Close dialog"
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <X className="h-4 w-4" />
</button>
```

### 4. **Reusable Component Architecture**
Clear distinction between reusable components and page/feature components.

```tsx
// ✅ Good - Reusable component (keeps className for flexibility)
const ActionButton = ({ className, children, ...props }) => {
  return (
    <button className={cn("action-button", className)} {...props}>
      {children}
    </button>
  )
}

// ✅ Good - Page component (uses reusable components, no custom className)
const BookingPage = () => {
  return (
    <Container>
      <Stack>
        <H3>Book Your Ride</H3>
        <Text>Complete your reservation</Text>
        <ActionButton onClick={handleBooking}>Book Now</ActionButton>
      </Stack>
    </Container>
  )
}
```

## 🧩 Core Components

### Button Component
A flexible button with multiple variants, sizes, and states.

```tsx
import { Button } from '@/components/ui';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="outline" size="lg" onClick={handleClick}>
  Large Outline Button
</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>

// Icon button
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>
```

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info'
- `size`: 'default' | 'sm' | 'lg' | 'icon'

### Container Component
Responsive container with consistent spacing and layout.

```tsx
import { Container } from '@/components/ui';

// Basic usage
<Container>
  <p>Content goes here</p>
</Container>

// With size variants
<Container size="sm">Small container</Container>
<Container size="lg">Large container</Container>
<Container size="xl">Extra large container</Container>
```

### Stack Component
Flexible vertical or horizontal stacking with consistent spacing.

```tsx
import { Stack } from '@/components/ui/containers';

// Vertical stack (default)
<Stack>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="horizontal">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// With spacing
<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### Typography Components
Consistent text styling with semantic meaning.

```tsx
import { Text, H3, H4, Span } from '@/components/ui';

// Headings
<H3>Main Heading</H3>
<H4>Sub Heading</H4>

// Text content
<Text>Regular paragraph text</Text>
<Text variant="muted">Muted text for secondary information</Text>

// Inline text
<Span>Inline text with</Span>
<Span variant="highlight">highlighted content</Span>
```

## 🏗️ Component Architecture

### **Reusable Components** (`src/components/ui/`)
- **Purpose**: Provide building blocks for the entire application
- **className Usage**: ✅ Keep `className` for flexibility and internal styling
- **Props**: Flexible, composable interfaces
- **Examples**: `Button`, `Container`, `Stack`, `Text`, `H3`, `H4`, `Span`

### **Page/Feature Components** (`src/app/`, `src/components/marketing/`)
- **Purpose**: Implement specific features and pages
- **className Usage**: ❌ No custom `className`, use reusable components
- **Props**: Use reusable component props for styling
- **Examples**: `BookingForm`, `AdminDashboard`, `HomePage`

### **Layout Components** (`src/components/layout/`)
- **Purpose**: Provide page structure and layout patterns
- **className Usage**: ✅ Keep `className` for layout flexibility
- **Props**: Layout-specific props and configurations
- **Examples**: `CMSLayout`, `PageContent`, `PageHeader`

## 📋 Component Usage Guidelines

### **✅ DO: Use Reusable Components**
```tsx
// ✅ Good - Using reusable components
const BookingPage = () => {
  return (
    <Container>
      <Stack spacing="lg">
        <H3>Book Your Airport Transfer</H3>
        <Text>Complete your reservation below</Text>
        <BookingForm />
      </Stack>
    </Container>
  )
}
```

### **❌ DON'T: Add Custom className to Pages**
```tsx
// ❌ Bad - Custom className in page component
const BookingPage = () => {
  return (
    <div className="booking-page-container"> {/* Don't do this */}
      <h3 className="booking-title">Book Your Airport Transfer</h3>
      <p className="booking-description">Complete your reservation below</p>
      <BookingForm />
    </div>
  )
}
```

### **✅ DO: Keep className in Reusable Components**
```tsx
// ✅ Good - Reusable component with className flexibility
const ActionButton = ({ className, children, ...props }) => {
  return (
    <button className={cn("action-button", className)} {...props}>
      {children}
    </button>
  )
}
```

## 🔧 Component Development

### **Creating New Reusable Components**
1. **Place in `src/components/ui/`**
2. **Include `className` prop for flexibility**
3. **Use TypeScript interfaces**
4. **Include accessibility attributes**
5. **Add to component index**

```tsx
// Example: New reusable component
interface InfoCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const InfoCard = ({ title, description, className, children }: InfoCardProps) => {
  return (
    <div className={cn("info-card", className)}>
      <h3 className="info-card-title">{title}</h3>
      {description && <p className="info-card-description">{description}</p>}
      {children}
    </div>
  )
}
```

### **Creating Page/Feature Components**
1. **Use reusable components instead of custom className**
2. **Compose with existing components**
3. **Keep logic separate from styling**
4. **Focus on functionality over styling**

```tsx
// Example: Page component using reusable components
const AdminDashboard = () => {
  return (
    <Container>
      <Stack spacing="lg">
        <H3>Admin Dashboard</H3>
        <Text>Manage your business operations</Text>
        <GridSection>
          <InfoCard title="Bookings" description="Manage reservations">
            <BookingList />
          </InfoCard>
          <InfoCard title="Drivers" description="Manage drivers">
            <DriverList />
          </InfoCard>
        </GridSection>
      </Stack>
    </Container>
  )
}
```

## 🧪 Testing Components

### **Unit Testing**
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('Button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### **Integration Testing**
```tsx
test('Booking form integrates with reusable components', () => {
  render(<BookingForm />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## 📚 Best Practices

### **1. Component Organization**
- Keep reusable components in `src/components/ui/`
- Keep page components in `src/app/`
- Keep feature components in `src/components/[feature]/`

### **2. Props Design**
- Use TypeScript interfaces for all props
- Provide sensible defaults
- Include `className` for reusable components
- Use compound components for complex layouts

### **3. Styling Approach**
- Use reusable components instead of custom className in pages
- Keep className in reusable components for flexibility
- Use design system tokens for consistency
- Implement responsive design patterns

### **4. Accessibility**
- Include proper ARIA attributes
- Ensure keyboard navigation
- Provide screen reader support
- Test with accessibility tools

---

*Last Updated: January 2025*  
*Status: Updated to reflect recent codebase cleanup achievements* 