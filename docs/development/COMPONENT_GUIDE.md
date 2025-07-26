# Component System Guide

This guide covers our comprehensive component system built with React, TypeScript, and our design system.

## 🚨 CRITICAL COMPONENT REFACTORING RULES

**NEVER remove reusable components during refactoring!**

### **FORBIDDEN:**
- ❌ Replacing `<GridSection>`, `<InfoCard>`, `<ActionButtonGroup>` with custom HTML
- ❌ Removing component architecture for styling purposes
- ❌ Breaking component reusability

### **REQUIRED:**
- ✅ Keep reusable components intact
- ✅ Refactor components internally (replace Tailwind/inline styles with semantic CSS)
- ✅ Maintain component props and interfaces
- ✅ Preserve component architecture and reusability

**See: `docs/development/COMPONENT_REFACTORING_RULES.md` for detailed guidelines.**

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
- `loading`: boolean
- `loadingSpinner`: React.ReactNode

### Input Component
Enhanced input with built-in validation and accessibility.

```tsx
import { Input } from '@/components/ui';

// Basic usage
<Input placeholder="Enter your name" />

// With label and error
<Input
  label="Email"
  type="email"
  error="Please enter a valid email"
  required
/>

// With helper text
<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `required`: boolean
- All standard input props

### Card Component
Compound component pattern for flexible card layouts.

```tsx
import { Card } from '@/components/ui';

// Basic usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// With custom styling
<Card className="bg-bg-secondary border-brand-primary">
  <CardContent>
    <p>Custom styled card</p>
  </CardContent>
</Card>
```

**Props:**
- `shadow`: boolean
- `hoverable`: boolean
- All standard div props

## 📊 Data Components

### DataTable Component
Flexible table with sorting, loading states, and error handling.

```tsx
import { DataTable } from '@/components/ui';

// Basic usage
<DataTable
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' }
  ]}
/>

// With custom rendering
<DataTable
  data={bookings}
  columns={[
    { key: 'name', label: 'Name' },
    { 
      key: 'status', 
      label: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />
    },
    { key: 'amount', label: 'Amount' }
  ]}
  onRowClick={(booking) => navigate(`/booking/${booking.id}`)}
/>

// With loading state
<DataTable
  data={data}
  columns={columns}
  loading={isLoading}
  emptyMessage="No bookings found"
/>
```

**Props:**
- `data`: T[]
- `columns`: Column<T>[]
- `onRowClick`: (item: T) => void
- `loading`: boolean
- `emptyMessage`: React.ReactNode
- `errorFallback`: Component
- `hoverable`: boolean
- `loadingComponent`: React.ReactNode

### FormField Component
Complete form field with validation and error handling.

```tsx
import { FormField } from '@/components/ui';

// Basic usage
<FormField
  label="Email"
  type="email"
  placeholder="Enter your email"
/>

// With validation
<FormField
  label="Password"
  type="password"
  required
  error="Password must be at least 8 characters"
  helperText="Use a strong password"
/>

// With custom validation
<FormField
  label="Age"
  type="number"
  min={18}
  max={100}
  error={ageError}
/>
```

## 🛡️ Error Handling

### ErrorBoundary Component
Catches JavaScript errors and displays fallback UI.

```tsx
import { ErrorBoundary } from '@/components/ui';

// Basic usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary 
  fallback={({ error, resetError }) => (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## 🎨 Loading States

### LoadingSpinner Component
Multiple variants for different loading scenarios.

```tsx
import { LoadingSpinner } from '@/components/ui';

// Basic usage
<LoadingSpinner />

// With custom size and color
<LoadingSpinner size="lg" className="text-brand-primary" />

// With text
<LoadingSpinner text="Loading..." />

// Dots variant
<LoadingSpinner variant="dots" />

// Centered
<LoadingSpinner centered />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'spinner' | 'dots' | 'pulse'
- `text`: string
- `centered`: boolean

## 🧪 Testing

### Test Utilities
Comprehensive testing utilities for consistent component testing.

```tsx
import { render, createMockBooking, expectToBeAccessible } from '@/lib/test-utils';

// Basic test
test('Button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

// With mock data
test('BookingCard displays booking information', () => {
  const booking = createMockBooking({ name: 'John Doe' });
  const { getByText } = render(<BookingCard booking={booking} />);
  
  expect(getByText('John Doe')).toBeInTheDocument();
});

// Accessibility test
test('Component is accessible', () => {
  const { container } = render(<MyComponent />);
  expectToBeAccessible(container);
});
```

## 🎯 Best Practices

### 1. **Use Design System Colors**
Always use our CSS variables instead of hardcoded colors.

```tsx
// ✅ Good
className="bg-brand-primary text-text-inverse"

// ❌ Bad
className="bg-blue-600 text-white"
```

### 2. **Provide Sensible Defaults**
Components should work out of the box with minimal props.

```tsx
// ✅ Good - Works with minimal props
<Button>Click me</Button>

// ✅ Good - Customizable when needed
<Button variant="outline" size="lg">Large Button</Button>
```

### 3. **Include Proper Documentation**
All components include JSDoc with examples.

```tsx
/**
 * A flexible button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button onClick={handleClick}>Click me</Button>
 * <Button variant="outline" size="lg">Large Button</Button>
 * ```
 */
```

### 4. **Handle Edge Cases**
Components gracefully handle loading, error, and empty states.

```tsx
// Loading state
if (loading) return <LoadingSpinner />;

// Error state
if (error) return <ErrorFallback error={error} />;

// Empty state
if (data.length === 0) return <EmptyState message="No data" />;
```

### 5. **Performance Optimization**
Use React.memo for expensive components and proper dependency arrays.

```tsx
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);
  
  return <div>{/* Render processed data */}</div>;
});
```

## 📦 Component Organization

```
src/components/
├── ui/                    # Basic UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── index.ts
├── forms/                 # Form-specific components
│   ├── FormField.tsx
│   ├── FormSection.tsx
│   └── index.ts
├── layout/                # Layout components
│   ├── PageContainer.tsx
│   └── PageHeader.tsx
├── data/                  # Data display components
│   ├── DataTable.tsx
│   └── StatusBadge.tsx
└── feedback/              # User feedback components
    ├── Modal.tsx
    └── Alert.tsx
```

## 🚀 Getting Started

1. **Import components:**
```tsx
import { Button, Input, Card } from '@/components/ui';
```

2. **Use with TypeScript:**
```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  );
};
```

3. **Test your components:**
```tsx
import { render } from '@/lib/test-utils';

test('MyComponent renders correctly', () => {
  const { getByText } = render(
    <MyComponent title="Test" onAction={jest.fn()} />
  );
  expect(getByText('Test')).toBeInTheDocument();
});
```

This component system provides a solid foundation for building consistent, accessible, and maintainable React applications. 