# Fairfield Airport Cars - Design System

A comprehensive design system for consistent, accessible, and maintainable UI components.

## 🎨 Typography System

### Headings
```tsx
import { H1, H2, H3, H4, H5, H6 } from '@/components/ui';

// Usage
<H1>Main Page Title</H1>
<H2>Section Heading</H2>
<H3>Subsection Title</H3>
<H4>Card Title</H4>
<H5>Small Heading</H5>
<H6>Smallest Heading</H6>
```

### Text Variants
```tsx
import { Text, Lead, Small, Muted, Inverse } from '@/components/ui';

// Usage
<Text>Regular body text</Text>
<Lead>Leading paragraph text</Lead>
<Small>Small helper text</Small>
<Muted>Muted secondary text</Muted>
<Inverse>White text on dark backgrounds</Inverse>

// With size variants
<Text size="lg">Large text</Text>
<Text size="sm">Small text</Text>
```

## 📦 Container & Layout System

### Container
```tsx
import { Container } from '@/components/ui';

<Container maxWidth="xl" padding="lg">
  <p>Content with max width and padding</p>
</Container>
```

### Box
```tsx
import { Box } from '@/components/ui';

<Box variant="elevated" padding="lg" rounded="lg">
  <p>Elevated box with shadow</p>
</Box>

<Box variant="outlined" padding="md">
  <p>Outlined box with border</p>
</Box>
```

### Section
```tsx
import { Section } from '@/components/ui';

<Section variant="brand" padding="xl">
  <H2>Brand Section</H2>
  <Text>Content with brand colors</Text>
</Section>

<Section variant="alternate" padding="lg">
  <H2>Alternate Section</H2>
  <Text>Content with alternate background</Text>
</Section>
```

### Card
```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" padding="lg" hover>
  <H3>Card Title</H3>
  <Text>Card content with hover effect</Text>
</Card>
```

### Stack
```tsx
import { Stack } from '@/components/ui';

<Stack direction="vertical" spacing="md" align="center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>

<Stack direction="horizontal" spacing="lg" justify="between">
  <Text>Left content</Text>
  <Text>Right content</Text>
</Stack>
```

### Grid
```tsx
import { Grid } from '@/components/ui';

<Grid cols={3} gap="lg" responsive>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

## 🎛️ Enhanced Input System

### Enhanced Input
```tsx
import { EnhancedInput, EmailInput, PhoneInput, PasswordInput } from '@/components/ui';

<EnhancedInput
  label="Full Name"
  placeholder="Enter your name"
  error="Name is required"
  helper="Enter your full legal name"
  size="lg"
  variant="filled"
/>

<EmailInput
  label="Email Address"
  placeholder="your@email.com"
  required
/>

<PhoneInput
  label="Phone Number"
  countryCode="+1"
  placeholder="(555) 123-4567"
/>

<PasswordInput
  label="Password"
  placeholder="Enter your password"
/>
```

### Enhanced Textarea
```tsx
import { EnhancedTextarea } from '@/components/ui';

<EnhancedTextarea
  label="Description"
  placeholder="Enter your description"
  rows={4}
  variant="outlined"
/>
```

### Enhanced Select
```tsx
import { EnhancedSelect, SelectItem } from '@/components/ui';

<EnhancedSelect
  label="Select Option"
  placeholder="Choose an option"
  value={value}
  onValueChange={setValue}
>
  <SelectItem value="option1">Option 1</SelectItem>
  <SelectItem value="option2">Option 2</SelectItem>
</EnhancedSelect>
```

### Form Field
```tsx
import { FormField, EnhancedInput } from '@/components/ui';

<FormField
  label="Username"
  error="Username is required"
  helper="Choose a unique username"
  required
>
  <EnhancedInput placeholder="Enter username" />
</FormField>
```

## 🎯 Button System

### Button Variants
```tsx
import { Button } from '@/components/ui';

<Button variant="default">Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
<Button variant="destructive">Delete Button</Button>
<Button variant="success">Success Button</Button>
<Button variant="warning">Warning Button</Button>
<Button variant="info">Info Button</Button>
```

### Button Sizes
```tsx
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">Icon Button</Button>
```

## 🏷️ Badge System

```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

## 📊 Data Display

### Status Badge
```tsx
import { StatusBadge } from '@/components/ui';

<StatusBadge status="confirmed" />
<StatusBadge status="pending" />
<StatusBadge status="completed" />
<StatusBadge status="cancelled" />
```

### Loading States
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner text="Loading..." />
<LoadingSpinner size="sm" />
<LoadingSpinner size="lg" />
```

## 🎨 Color System

### Brand Colors
- `brand-primary`: #0B1F3A (Dark Blue)
- `brand-primary-hover`: #08142A (Darker Blue)
- `brand-secondary`: #6B7C93 (Medium Blue)

### Semantic Colors
- `success`: #10B981 (Green)
- `warning`: #F59E0B (Orange)
- `error`: #EF4444 (Red)
- `info`: #3B82F6 (Blue)

### Text Colors
- `text-primary`: #111827 (Dark Gray)
- `text-secondary`: #6B7280 (Medium Gray)
- `text-muted`: #9CA3AF (Light Gray)
- `text-inverse`: #FFFFFF (White)

### Background Colors
- `bg-primary`: #FFFFFF (White)
- `bg-secondary`: #F9FAFB (Light Gray)
- `bg-muted`: #F3F4F6 (Very Light Gray)

## 📱 Responsive Design

All components are built with responsive design in mind:

- **Mobile First**: Components start with mobile styles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: Responsive grid with automatic column adjustment
- **Typography**: Responsive font sizes using Tailwind's responsive prefixes

## ♿ Accessibility

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Focus States**: Clear focus indicators for keyboard navigation
- **Color Contrast**: All text meets WCAG AA contrast requirements
- **Screen Reader Support**: Proper semantic HTML and ARIA attributes

## 🎯 Usage Guidelines

### 1. Consistency
- Always use the design system components instead of custom CSS
- Maintain consistent spacing using the spacing scale
- Use the typography system for all text

### 2. Hierarchy
- Use heading levels properly (H1 → H2 → H3)
- Maintain visual hierarchy with size and weight
- Use color and spacing to create clear sections

### 3. Forms
- Always include labels for form fields
- Provide helpful error messages
- Use appropriate input types (email, tel, password, etc.)

### 4. Buttons
- Use primary buttons for main actions
- Use secondary buttons for less important actions
- Use destructive buttons sparingly for dangerous actions

### 5. Layout
- Use Container for page-level content
- Use Section for major content blocks
- Use Card for contained content
- Use Stack for consistent spacing

## 🔧 Customization

The design system is built on CSS custom properties, making it easy to customize:

```css
:root {
  --brand-primary: #0B1F3A;
  --brand-primary-hover: #08142A;
  /* Add more custom properties as needed */
}
```

## 📚 Component Examples

### Complete Form Example
```tsx
import { 
  Container, 
  Card, 
  Stack, 
  EnhancedInput, 
  EnhancedTextarea, 
  Button 
} from '@/components/ui';

<Container maxWidth="lg">
  <Card padding="lg">
    <Stack spacing="lg">
      <H2>Contact Form</H2>
      
      <EnhancedInput
        label="Full Name"
        placeholder="Enter your full name"
        required
      />
      
      <EmailInput
        label="Email Address"
        placeholder="your@email.com"
        required
      />
      
      <PhoneInput
        label="Phone Number"
        placeholder="(555) 123-4567"
      />
      
      <EnhancedTextarea
        label="Message"
        placeholder="Enter your message"
        rows={4}
      />
      
      <Stack direction="horizontal" spacing="md">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </Stack>
    </Stack>
  </Card>
</Container>
```

### Hero Section Example
```tsx
import { Section, Container, Stack, H1, Text, Button } from '@/components/ui';

<Section variant="brand" padding="xl">
  <Container>
    <Stack align="center" spacing="lg">
      <H1>Premium Airport Transportation</H1>
      <Text size="lg" variant="inverse">
        Reliable, comfortable rides to and from Fairfield Airport
      </Text>
      <Stack direction="horizontal" spacing="md">
        <Button variant="outline" size="lg">
          Learn More
        </Button>
        <Button size="lg">
          Book Now
        </Button>
      </Stack>
    </Stack>
  </Container>
</Section>
```

This design system provides a solid foundation for building consistent, accessible, and maintainable user interfaces across the Fairfield Airport Cars application. 