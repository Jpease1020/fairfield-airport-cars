# Grid System Guide - Flexbox-Based Layout System

## Overview

The Fairfield Airport Cars grid system is a comprehensive flexbox-based layout system designed for consistent, responsive layouts across all pages. It combines new Row/Col components with enhanced existing Container/Stack components.

## Core Components

### Row Component
Flexbox row container with responsive behavior and comprehensive flexbox controls.

```tsx
import { Row } from '@/design/components/grid-system';

<Row gap="md" align="center" justify="space-between">
  <Col span={6}>Left content</Col>
  <Col span={6}>Right content</Col>
</Row>
```

**Props:**
- `direction`: 'row' | 'column' | 'row-reverse' | 'column-reverse'
- `wrap`: 'wrap' | 'nowrap' | 'wrap-reverse'
- `align`: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
- `justify`: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
- `gap`: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `padding`: Spacing values
- `margin`: Spacing values
- `fullWidth`: boolean
- `responsive`: boolean (auto-switches to column on mobile)

### Col Component
Flexible column with responsive spans and offsets.

```tsx
import { Col } from '@/design/components/grid-system';

// Simple span
<Col span={6}>Content</Col>

// Responsive spans
<Col span={{ xs: 12, md: 6, lg: 4 }}>Responsive content</Col>

// With offset
<Col span={6} offset={1}>Content with offset</Col>
```

**Props:**
- `span`: number | ResponsiveColSpan (1-12 grid system)
- `offset`: number | ResponsiveColSpan (1-12 grid system)
- `align`: Flexbox alignment
- `justify`: Flexbox justification
- `padding`: Spacing values
- `margin`: Spacing values
- `order`: number (CSS order)
- `grow`: boolean (flex-grow)
- `shrink`: boolean (flex-shrink)

### Container Component
Responsive container with max-width and centering.

```tsx
import { Container } from '@/design/components/grid-system';

<Container maxWidth="2xl" padding="lg" center>
  <Row gap="md">
    <Col span={6}>Content</Col>
    <Col span={6}>Content</Col>
  </Row>
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: Spacing values
- `margin`: Spacing values
- `center`: boolean (auto-centers container)
- `fluid`: boolean (full-width container)

### Stack Component
Flexible stack for vertical/horizontal layouts.

```tsx
import { Stack } from '@/design/components/grid-system';

<Stack direction="vertical" spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

**Props:**
- `direction`: 'horizontal' | 'vertical'
- `spacing`: Spacing between items
- `align`: Flexbox alignment
- `justify`: Flexbox justification
- `wrap`: Flexbox wrap
- `gap`: CSS gap property
- `padding`: Spacing values
- `margin`: Spacing values

## Layout Patterns

### Basic Grid Layout
```tsx
<Container maxWidth="2xl" padding="lg">
  <Row gap="lg">
    <Col span={8}>
      <h2>Main Content</h2>
      <p>Primary content area</p>
    </Col>
    <Col span={4}>
      <h3>Sidebar</h3>
      <p>Secondary content</p>
    </Col>
  </Row>
</Container>
```

### Responsive Grid
```tsx
<Container maxWidth="2xl" padding="lg">
  <Row gap="md" responsive>
    <Col span={{ xs: 12, md: 6, lg: 4 }}>
      <Card>Feature 1</Card>
    </Col>
    <Col span={{ xs: 12, md: 6, lg: 4 }}>
      <Card>Feature 2</Card>
    </Col>
    <Col span={{ xs: 12, md: 6, lg: 4 }}>
      <Card>Feature 3</Card>
    </Col>
  </Row>
</Container>
```

### Form Layout
```tsx
<Container maxWidth="lg" padding="lg">
  <Stack direction="vertical" spacing="lg">
    <Row gap="md">
      <Col span={6}>
        <label>First Name</label>
        <input type="text" />
      </Col>
      <Col span={6}>
        <label>Last Name</label>
        <input type="text" />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <label>Email</label>
        <input type="email" />
      </Col>
    </Row>
  </Stack>
</Container>
```

### Navigation Layout
```tsx
<Container maxWidth="2xl" padding="md">
  <Row align="center" justify="space-between">
    <Col span={6}>
      <Logo />
    </Col>
    <Col span={6}>
      <Stack direction="horizontal" spacing="md" justify="end">
        <NavLink>Home</NavLink>
        <NavLink>About</NavLink>
        <NavLink>Contact</NavLink>
      </Stack>
    </Col>
  </Row>
</Container>
```

## Spacing System

The grid system uses a consistent spacing scale:

- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 0.75rem (12px)
- `lg`: 1rem (16px)
- `xl`: 1.5rem (24px)
- `2xl`: 2rem (32px)

## Breakpoints

Responsive behavior uses these breakpoints:

- `xs`: < 640px (mobile)
- `sm`: 640px+ (tablet)
- `md`: 768px+ (small desktop)
- `lg`: 1024px+ (desktop)
- `xl`: 1280px+ (large desktop)
- `2xl`: 1536px+ (extra large)

## Best Practices

### 1. Use Container for Page Layouts
```tsx
// ✅ Good
<Container maxWidth="2xl" padding="lg">
  <Row gap="md">
    <Col span={6}>Content</Col>
    <Col span={6}>Content</Col>
  </Row>
</Container>

// ❌ Avoid
<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
  <div style={{ display: 'flex' }}>
    <div style={{ width: '50%' }}>Content</div>
    <div style={{ width: '50%' }}>Content</div>
  </div>
</div>
```

### 2. Use Responsive Spans
```tsx
// ✅ Good - Responsive
<Col span={{ xs: 12, md: 6, lg: 4 }}>Content</Col>

// ❌ Avoid - Fixed width
<Col span={4}>Content</Col>
```

### 3. Use Stack for Vertical Layouts
```tsx
// ✅ Good
<Stack direction="vertical" spacing="md">
  <Header />
  <Content />
  <Footer />
</Stack>

// ❌ Avoid
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <Header />
  <Content />
  <Footer />
</div>
```

### 4. Use Gap Instead of Margins
```tsx
// ✅ Good
<Row gap="md">
  <Col span={6}>Content</Col>
  <Col span={6}>Content</Col>
</Row>

// ❌ Avoid
<Row>
  <Col span={6} margin="md">Content</Col>
  <Col span={6} margin="md">Content</Col>
</Row>
```

## Migration Guide

### From Old Grid System
```tsx
// Old
<Grid cols={3} gap="md">
  <GridItem span={2}>Content</GridItem>
  <GridItem span={1}>Content</GridItem>
</Grid>

// New
<Row gap="md">
  <Col span={8}>Content</Col>
  <Col span={4}>Content</Col>
</Row>
```

### From Inline Styles
```tsx
// Old
<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
  <div>Content</div>
  <div>Content</div>
</div>

// New
<Row gap="md" align="center">
  <Col>Content</Col>
  <Col>Content</Col>
</Row>
```

## Performance Considerations

1. **Use Responsive Props**: Avoid unnecessary re-renders by using responsive props instead of JavaScript-based responsive logic.

2. **Minimize Styled Components**: The grid system uses styled-components efficiently with proper prop filtering.

3. **Lazy Loading**: Consider lazy loading grid components for large pages.

## Accessibility

The grid system is built with accessibility in mind:

- Semantic HTML elements via `as` prop
- Proper ARIA attributes support
- Screen reader friendly structure
- Keyboard navigation support

## Testing

```tsx
// Test grid layout
<Row data-testid="grid-row" gap="md">
  <Col data-testid="grid-col" span={6}>Content</Col>
  <Col data-testid="grid-col" span={6}>Content</Col>
</Row>
```

## Troubleshooting

### Common Issues

1. **Columns not aligning**: Check if parent Row has proper `align` prop
2. **Responsive not working**: Ensure breakpoints are correctly applied
3. **Spacing inconsistent**: Use `gap` prop instead of individual margins
4. **Container not centering**: Set `center={true}` prop on Container

### Debug Mode

Enable debug mode to see grid outlines:

```tsx
<Row debug gap="md">
  <Col span={6}>Content</Col>
  <Col span={6}>Content</Col>
</Row>
``` 