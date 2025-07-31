# Grid System Guide

## 🎯 Philosophy

Our grid system is built on the principle that **margins belong to layouts, not components**. This ensures:

1. **Reusable components** can be used in any context without spacing conflicts
2. **Consistent spacing** across the entire application
3. **Page-level control** over spacing and layout
4. **Flexible composition** of components

## 📏 Spacing Scale

We use a consistent spacing scale throughout the application:

```tsx
// Spacing values (in rem)
xs: 0.25rem (4px)   - Minimal spacing
sm: 0.5rem  (8px)   - Small spacing
md: 1rem    (16px)  - Medium spacing (default)
lg: 1.5rem  (24px)  - Large spacing
xl: 2rem    (32px)  - Extra large spacing
2xl: 3rem   (48px)  - Double extra large spacing
```

## 🧩 Core Components

### Layout Component
The main container for page-level spacing control.

```tsx
import { Layout } from '@/components/ui';

<Layout spacing="lg" container maxWidth="xl">
  <HeroSection />
  <FeaturesSection />
  <FAQSection />
  <ContactSection />
</Layout>
```

**Props:**
- `spacing`: Controls vertical spacing between child components
- `container`: Whether to wrap content in a Container
- `maxWidth`: Maximum width of the container

### Container Component
Provides max-width and padding with margin controls.

```tsx
import { Container } from '@/components/ui';

<Container 
  maxWidth="xl" 
  padding="lg"
  margin="md"
  marginTop="lg"
  marginBottom="xl"
>
  <Content />
</Container>
```

**Props:**
- `maxWidth`: Maximum width constraint
- `padding`: Internal padding
- `margin`: All-around margin
- `marginTop`: Top margin only
- `marginBottom`: Bottom margin only

### Section Component
Full-width sections with background variants and margin controls.

```tsx
import { Section } from '@/components/ui';

<Section 
  variant="brand" 
  padding="xl"
  margin="lg"
  marginBottom="xl"
>
  <Content />
</Section>
```

**Props:**
- `variant`: Background variant (default, alternate, brand, muted)
- `padding`: Vertical padding
- `margin`: All-around margin
- `marginTop`: Top margin only
- `marginBottom`: Bottom margin only

### Grid Component
Responsive grid layout with gap and margin controls.

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

**Props:**
- `cols`: Number of columns (1-12)
- `gap`: Gap between grid items
- `responsive`: Whether to use responsive breakpoints
- `margin`: All-around margin
- `marginTop`: Top margin only
- `marginBottom`: Bottom margin only

### Stack Component
Flexbox layout with spacing and margin controls.

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

**Props:**
- `direction`: horizontal or vertical
- `spacing`: Space between items
- `align`: Alignment of items
- `justify`: Justification of items
- `margin`: All-around margin
- `marginTop`: Top margin only
- `marginBottom`: Bottom margin only

### Spacer Component
Explicit spacing element for fine-grained control.

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

**Props:**
- `size`: Spacing size
- `axis`: horizontal or vertical

## 📋 Usage Patterns

### 1. Page Layout Pattern
```tsx
export default function ExamplePage() {
  return (
    <Layout spacing="xl" container maxWidth="xl">
      {/* Hero Section */}
      <Container padding="lg" margin="none">
        <HeroSection />
      </Container>

      {/* Features Grid */}
      <Grid cols={3} gap="lg" margin="none">
        <FeatureCard />
        <FeatureCard />
        <FeatureCard />
      </Grid>

      {/* Contact Section */}
      <Section variant="brand" padding="xl" margin="none">
        <ContactSection />
      </Section>
    </Layout>
  );
}
```

### 2. Form Layout Pattern
```tsx
export default function ContactForm() {
  return (
    <Container maxWidth="md" padding="lg">
      <Card padding="lg" margin="none">
        <Stack spacing="lg">
          <H2>Contact Form</H2>
          
          <Stack spacing="md">
            <EnhancedInput label="Name" />
            <EnhancedInput label="Email" />
            <EnhancedTextarea label="Message" />
          </Stack>

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

### 3. Card Grid Pattern
```tsx
export default function FeaturesPage() {
  return (
    <Container maxWidth="xl" padding="lg">
      <Stack spacing="xl">
        <div className="text-center">
          <H1>Our Features</H1>
          <Text>Discover what makes us special</Text>
        </div>
        
        <Grid cols={3} gap="lg" margin="none">
          <Card padding="lg">
            <H3>Feature 1</H3>
            <Text>Description</Text>
          </Card>
          <Card padding="lg">
            <H3>Feature 2</H3>
            <Text>Description</Text>
          </Card>
          <Card padding="lg">
            <H3>Feature 3</H3>
            <Text>Description</Text>
          </Card>
        </Grid>
      </Stack>
    </Container>
  );
}
```

## ✅ Best Practices

### 1. Component Design
```tsx
// ✅ Good - No built-in margins
const FeatureCard = ({ title, description }) => (
  <Card padding="lg">
    <H3>{title}</H3>
    <Text>{description}</Text>
  </Card>
);

// ❌ Bad - Built-in margins make component context-specific
const FeatureCard = ({ title, description }) => (
  <Card padding="lg" className="mb-4">
    <H3>{title}</H3>
    <Text>{description}</Text>
  </Card>
);
```

### 2. Layout Control
```tsx
// ✅ Good - Layout controls spacing
<Layout spacing="lg">
  <FeatureCard />
  <FeatureCard />
  <FeatureCard />
</Layout>

// ✅ Good - Explicit spacing
<FeatureCard />
<Spacer size="lg" />
<FeatureCard />

// ❌ Bad - Component controls spacing
<FeatureCard className="mb-4" />
<FeatureCard className="mb-4" />
<FeatureCard />
```

### 3. Grid Usage
```tsx
// ✅ Good - Grid controls spacing
<Grid cols={3} gap="lg" margin="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// ❌ Bad - Manual spacing
<div className="grid grid-cols-3 gap-4 mb-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
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

// ❌ Bad - Manual container with margins
<div className="max-w-xl mx-auto p-6 m-4 mt-12">
  <Content />
</div>
```

## 🎨 Responsive Design

All grid components are responsive by default:

```tsx
// Responsive grid (1 col on mobile, 2 on tablet, 3 on desktop)
<Grid cols={3} gap="lg" responsive>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Fixed grid (always 3 columns)
<Grid cols={3} gap="lg" responsive={false}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

## 🔧 Customization

### Custom Spacing
```tsx
// Use custom spacing with className
<Container 
  maxWidth="xl" 
  padding="lg"
  className="my-custom-spacing"
>
  <Content />
</Container>
```

### Custom Grid Layouts
```tsx
// Custom grid with specific breakpoints
<Grid 
  cols={3} 
  gap="lg" 
  responsive={false}
  className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

## 📚 Migration Guide

### From Old Pattern to New Pattern

**Before:**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold mb-4">Title</h2>
    <p className="text-lg">Description</p>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <Card className="mb-4">Item 1</Card>
    <Card className="mb-4">Item 2</Card>
    <Card className="mb-4">Item 3</Card>
  </div>
</div>
```

**After:**
```tsx
<Container maxWidth="xl" padding="lg">
  <Stack spacing="lg" align="center">
    <div className="text-center">
      <H2>Title</H2>
      <Text size="lg">Description</Text>
    </div>
    <Grid cols={3} gap="lg">
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Grid>
  </Stack>
</Container>
```

This grid system provides a solid foundation for building consistent, maintainable layouts while following the principle that margins belong to layouts, not components. 