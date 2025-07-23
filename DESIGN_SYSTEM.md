# Fairfield Airport Cars - Design System

A comprehensive design system for consistent, accessible, and maintainable UI components.

## 🎯 Grid System Philosophy

### Core Principles
1. **Margins belong to layouts, not components** - Reusable components should not have margins built-in
2. **Consistent spacing scale** - Use predefined spacing values for consistency
3. **Page-level control** - Spacing between components is controlled at the page layout level
4. **Flexible composition** - Components can be composed with different spacing contexts

### Spacing Scale
```tsx
// Spacing values (in rem)
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)
```

## 📦 Enhanced Container & Layout System

### Container with Margin Controls
```tsx
import { Container } from '@/components/ui';

// Basic usage
<Container maxWidth="xl" padding="lg">
  <p>Content with max width and padding</p>
</Container>

// With margin controls
<Container 
  maxWidth="xl" 
  padding="lg"
  margin="md"
  marginTop="lg"
  marginBottom="xl"
>
  <p>Content with controlled margins</p>
</Container>
```

### Box with Margin Controls
```tsx
import { Box } from '@/components/ui';

<Box 
  variant="elevated" 
  padding="lg" 
  rounded="lg"
  margin="md"
  marginTop="lg"
>
  <p>Elevated box with controlled margins</p>
</Box>
```

### Section with Margin Controls
```tsx
import { Section } from '@/components/ui';

<Section 
  variant="brand" 
  padding="xl"
  margin="lg"
  marginBottom="xl"
>
  <H2>Brand Section</H2>
  <Text>Content with controlled margins</Text>
</Section>
```

### Card with Margin Controls
```tsx
import { Card } from '@/components/ui';

<Card 
  variant="elevated" 
  padding="lg" 
  hover
  margin="md"
  marginTop="lg"
>
  <H3>Card Title</H3>
  <Text>Card content with controlled margins</Text>
</Card>
```

### Stack with Margin Controls
```tsx
import { Stack } from '@/components/ui';

<Stack 
  direction="vertical" 
  spacing="md" 
  align="center"
  margin="lg"
  marginTop="xl"
>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

### Grid with Margin Controls
```tsx
import { Grid } from '@/components/ui';

<Grid 
  cols={3} 
  gap="lg" 
  responsive
  margin="md"
  marginBottom="xl"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

### Layout Component for Page-Level Spacing
```tsx
import { Layout } from '@/components/ui';

<Layout spacing="lg" container maxWidth="xl">
  <HeroSection />
  <FeaturesSection />
  <FAQSection />
  <ContactSection />
</Layout>
```

### Spacer Component for Explicit Spacing
```tsx
import { Spacer } from '@/components/ui';

// Vertical spacing
<Spacer size="lg" />

// Horizontal spacing
<Spacer size="md" axis="horizontal" />

// Between components
<HeroSection />
<Spacer size="xl" />
<FeaturesSection />
```

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

### 1. Component Design Philosophy
- **No built-in margins**: Reusable components should not have margins
- **Composition over configuration**: Use layout components to control spacing
- **Consistent spacing**: Use the predefined spacing scale
- **Page-level control**: Manage spacing at the page layout level

### 2. Layout Patterns
```tsx
// ✅ Good - Page controls spacing
<Layout spacing="lg">
  <HeroSection />
  <FeaturesSection />
  <FAQSection />
</Layout>

// ✅ Good - Explicit spacing
<HeroSection />
<Spacer size="xl" />
<FeaturesSection />

// ❌ Bad - Component has built-in margins
<HeroSection className="mb-8" />
```

### 3. Grid Usage
```tsx
// ✅ Good - Grid controls spacing
<Grid cols={3} gap="lg" margin="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// ✅ Good - Stack for vertical spacing
<Stack spacing="md" margin="lg">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>
```

### 4. Container Usage
```tsx
// ✅ Good - Container with margin controls
<Container 
  maxWidth="xl" 
  padding="lg"
  margin="md"
  marginTop="xl"
>
  <Content />
</Container>
```

### 5. Section Usage
```tsx
// ✅ Good - Section with margin controls
<Section 
  variant="brand" 
  padding="xl"
  margin="lg"
  marginBottom="xl"
>
  <Content />
</Section>
```

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

### Complete Page Layout Example
```tsx
import { 
  Layout, 
  Container, 
  Stack, 
  Grid,
  Card,
  Button,
  Spacer
} from '@/components/ui';

export default function ExamplePage() {
  return (
    <Layout spacing="xl" container maxWidth="xl">
      {/* Hero Section */}
      <Container padding="lg" margin="none">
        <Stack spacing="lg" align="center">
          <H1>Welcome to Our Service</H1>
          <Text size="lg">Professional airport transportation</Text>
          <Stack direction="horizontal" spacing="md">
            <Button size="lg">Book Now</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </Stack>
        </Stack>
      </Container>

      <Spacer size="xl" />

      {/* Features Grid */}
      <Grid cols={3} gap="lg" margin="none">
        <Card padding="lg">
          <H3>Feature 1</H3>
          <Text>Description of feature 1</Text>
        </Card>
        <Card padding="lg">
          <H3>Feature 2</H3>
          <Text>Description of feature 2</Text>
        </Card>
        <Card padding="lg">
          <H3>Feature 3</H3>
          <Text>Description of feature 3</Text>
        </Card>
      </Grid>

      <Spacer size="xl" />

      {/* Contact Section */}
      <Section variant="brand" padding="xl" margin="none">
        <Container padding="none">
          <Stack spacing="md" align="center">
            <H2>Contact Us</H2>
            <Text variant="inverse">Get in touch today</Text>
            <Button variant="outline" size="lg">
              Contact Now
            </Button>
          </Stack>
        </Container>
      </Section>
    </Layout>
  );
}
```

### Form Layout Example
```tsx
import { 
  Container, 
  Card, 
  Stack, 
  EnhancedInput, 
  Button,
  Spacer
} from '@/components/ui';

export default function ContactForm() {
  return (
    <Container maxWidth="md" padding="lg">
      <Card padding="lg" margin="none">
        <Stack spacing="lg">
          <H2>Contact Form</H2>
          
          <Stack spacing="md">
            <EnhancedInput
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
            
            <EnhancedInput
              label="Email Address"
              placeholder="your@email.com"
              required
            />
            
            <EnhancedTextarea
              label="Message"
              placeholder="Enter your message"
              rows={4}
            />
          </Stack>

          <Spacer size="md" />

          <Stack direction="horizontal" spacing="md">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}
```

This enhanced design system provides a solid foundation for building consistent, accessible, and maintainable user interfaces across the Fairfield Airport Cars application, with proper spacing control at the page layout level. 