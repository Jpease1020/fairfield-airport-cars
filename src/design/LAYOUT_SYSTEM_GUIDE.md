# 🏗️ Layout System Guide

## Overview

The Fairfield Airport Cars layout system is built on a **4-layer architecture** that provides consistent, scalable, and maintainable layouts across the application.

## 🏛️ Layer Architecture

### **Layer 1: Grid System (Foundation)**
**Purpose**: CSS Grid and Flexbox primitives for 2D and 1D layouts
- **Grid**: CSS Grid for 2D layouts with auto-fit, fixed columns
- **Row**: Flexbox row with horizontal alignment and wrapping
- **Col**: Flexbox column with vertical alignment and flex properties

### **Layer 2: Content Layout (Content arrangement)**
**Purpose**: Content grouping, spacing, and styling
- **Box**: Block-level content grouping with variants and padding
- **Stack**: Flexbox-based content stacking with spacing control

### **Layer 3: Layout System (Containers)**
**Purpose**: Page-level containers and sections
- **Container**: Foundational layout component for max-width and centering
- **Section**: Semantic section container with theming and spacing

### **Layer 4: Page Layout (Complete layouts)**
**Purpose**: Complete page layouts with navigation, content, and footer
- **PageLayout**: Unified page layout component (replaces CustomerLayout & StandardLayout)

## 🎯 PageLayout Component

The `PageLayout` component is the single, unified page layout component that consolidates all previous layout patterns.

### **Usage**

```tsx
import { PageLayout } from '@/ui';

// Basic customer layout (default)
<PageLayout>
  <div>Page content</div>
</PageLayout>

// Standard layout with custom options
<PageLayout 
  showNavigation={false} 
  showFooter={true} 
  variant="standard"
  maxWidth="xl"
  spacing="md"
>
  <div>Page content</div>
</PageLayout>
```

### **Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Page content |
| `showNavigation` | boolean | `true` | Show/hide navigation |
| `showFooter` | boolean | `true` | Show/hide footer |
| `variant` | `'customer' \| 'standard'` | `'customer'` | Layout variant |
| `maxWidth` | MaxWidth | `'full'` | Container max width |
| `spacing` | SpacingScale | `'none'` | Stack spacing |

## 🔄 Migration Status

### **Current State**
- **PageLayout**: ✅ Implemented and available via `@/design/ui`
- **CustomerLayout**: ✅ Available as alias via `@/design/ui` (temporary compatibility)
- **StandardLayout**: ✅ Available as alias via `@/design/ui` (temporary compatibility)

### **Pages Still Using CustomerLayout**
The following pages still use the old `CustomerLayout` import and need migration:
- `/book/page.tsx`
- `/about/page.tsx`
- `/terms/page.tsx`
- `/privacy/page.tsx`
- `/success/page.tsx`
- `/portal/page.tsx`
- `/cancel/page.tsx`
- `/help/page.tsx`
- `/tracking/[bookingId]/page.tsx`
- `/manage/[id]/page.tsx`

### **Migration Guide**

#### **From CustomerLayout**
```tsx
// OLD (still works but deprecated)
import { CustomerLayout } from '@/ui';
<CustomerLayout>
  <div>Content</div>
</CustomerLayout>

// NEW (recommended)
import { PageLayout } from '@/ui';
<PageLayout>
  <div>Content</div>
</PageLayout>
```

#### **From StandardLayout**
```tsx
// OLD (still works but deprecated)
import { StandardLayout } from '@/ui';
<StandardLayout showNavigation={false} showFooter={true}>
  <div>Content</div>
</StandardLayout>

// NEW (recommended)
import { PageLayout } from '@/ui';
<PageLayout showNavigation={false} showFooter={true}>
  <div>Content</div>
</PageLayout>
```

## 📐 Layout Systems

### **CSS Grid (Layer 1)**
- **Use for**: 2D layouts, complex arrangements, auto-fit columns
- **Components**: `Grid`, `Col`
- **Example**: Feature grids, card layouts, photo galleries

```tsx
<Grid cols={3} gap="lg" responsive>
  <Col><FeatureCard /></Col>
  <Col><FeatureCard /></Col>
  <Col><FeatureCard /></Col>
</Grid>
```

### **Flexbox (Layer 1 & 2)**
- **Use for**: 1D layouts, alignment, spacing
- **Components**: `Row`, `Col`, `Stack`
- **Example**: Navigation bars, button groups, content stacks

```tsx
<Stack direction="horizontal" spacing="md" align="center">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</Stack>
```

### **Block Layout (Layer 2 & 3)**
- **Use for**: Content grouping, sections, containers
- **Components**: `Box`, `Container`, `Section`
- **Example**: Page sections, content cards, containers

```tsx
<Container maxWidth="xl" padding="lg">
  <Box variant="elevated" padding="md">
    <H2>Section Title</H2>
    <Text>Content goes here</Text>
  </Box>
</Container>
```

## 📱 Responsive Design

All layout components support responsive behavior through the `ResponsiveValue` type:

```tsx
// Responsive grid columns
<Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">

// Responsive spacing
<Stack spacing={{ xs: 'sm', md: 'lg', xl: 'xl' }}>

// Responsive max width
<Container maxWidth={{ xs: 'full', md: 'xl', xl: '2xl' }}>
```

**Note**: The system uses breakpoint-based responsive values (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) rather than device-based values (`mobile`, `tablet`, `desktop`).

## 🎨 Content Sections (Layer 3)

Content sections are built on the layout building blocks and provide reusable patterns:

### **Grid-Based Sections**
- `FeatureGrid`: Feature displays with icons and descriptions
- `ActionGrid`: Action buttons/cards in grid layout
- `ContentGrid`: Generic content grid layouts

### **Stack-Based Sections**
- `HeroSection`: Hero content with centered layout
- `ContentStack`: Vertical content stacking
- `ContentList`: List-based content layouts

### **Container-Based Sections**
- `Section`: Generic sections with titles and content
- `ContentCard`: Card layouts with variants
- `ContentHeader/Footer`: Header and footer content

### **Complex Sections**
- `DataTable`: Table layouts with sorting, pagination
- `FAQSection`: FAQ layouts with expandable content
- `TestimonialCard`: Testimonial layouts with quotes
- `ContactMethods`: Contact method displays
- `ActivityList`: Activity timeline displays

## 🏆 Best Practices

### **1. Use the Right Layer**
- **Layer 1**: For layout structure (Grid, Row, Col)
- **Layer 2**: For content arrangement (Box, Stack)
- **Layer 3**: For page sections (Container, Section)
- **Layer 4**: For complete page layouts (PageLayout)

### **2. Prefer Composition Over Custom CSS**
```tsx
// ✅ Good - Using layout components
<Stack spacing="lg" align="center">
  <H1>Title</H1>
  <Text>Content</Text>
</Stack>

// ❌ Avoid - Custom CSS
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
  <h1>Title</h1>
  <p>Content</p>
</div>
```

### **3. Use Responsive Values**
```tsx
// ✅ Good - Responsive design
<Grid cols={{ xs: 1, md: 2, lg: 3 }} gap={{ xs: 'sm', lg: 'lg' }}>

// ❌ Avoid - Fixed values
<Grid cols={3} gap="md">
```

### **4. Leverage Content Sections**
```tsx
// ✅ Good - Using content sections
<FeatureGrid features={features} columns={3} />

// ❌ Avoid - Building from scratch
<Grid cols={3}>
  {features.map(feature => (
    <Col>
      <Box>
        <Stack>
          <Text>{feature.icon}</Text>
          <H4>{feature.title}</H4>
          <Text>{feature.description}</Text>
        </Stack>
      </Box>
    </Col>
  ))}
</Grid>
```

## 🔧 Decision Matrix

| Use Case | Layer 1 | Layer 2 | Layer 3 | Layer 4 |
|----------|---------|---------|---------|---------|
| **2D Layout** | Grid + Col | - | - | - |
| **1D Layout** | Row + Col | Stack | - | - |
| **Content Grouping** | - | Box | Container | - |
| **Page Sections** | - | - | Section | - |
| **Complete Pages** | - | - | - | PageLayout |
| **Responsive Grid** | Grid (responsive) | - | - | - |
| **Content Cards** | - | Box + Stack | ContentCard | - |
| **Navigation** | - | - | - | PageLayout (navigation) |

## 📋 Common Patterns

### **Hero Section**
```tsx
<PageLayout>
  <HeroSection 
    title="Welcome to Fairfield Airport Cars"
    subtitle="Reliable airport transportation"
    primaryAction={{ label: "Book Now", href: "/book" }}
  />
</PageLayout>
```

### **Feature Grid**
```tsx
<PageLayout>
  <Section title="Our Services">
    <FeatureGrid 
      features={services} 
      columns={{ xs: 1, md: 2, lg: 3 }} 
    />
  </Section>
</PageLayout>
```

### **Content Cards**
```tsx
<PageLayout>
  <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
    <Col>
      <ContentCard 
        title="Reliable Service"
        content="On-time pickup guaranteed"
        icon="⏰"
        variant="elevated"
      />
    </Col>
  </Grid>
</PageLayout>
```

## 🚀 Performance Considerations

### **Bundle Size**
- Layout components are tree-shakeable
- Import only what you need: `import { Grid, Col } from '@/ui'`
- Content sections include only necessary dependencies

### **Rendering Performance**
- Layout components use CSS-in-JS efficiently
- Responsive values are optimized for runtime
- Content sections minimize re-renders

### **Accessibility**
- All layout components support proper ARIA attributes
- Semantic HTML elements (`main`, `header`, `footer`)
- Keyboard navigation support

## 🔄 Future Enhancements

### **Planned Features**
- Admin navigation and footer components (currently using CustomerNavigation/Footer)
- More specialized content sections
- Advanced responsive breakpoints
- Animation and transition support

### **Migration Path**
- Legacy `CustomerLayout` and `StandardLayout` are available as aliases
- All pages should migrate to the unified `PageLayout` component
- Content sections will continue to be enhanced

## 📚 Quick Reference

### **Import All Components**
```tsx
import { 
  PageLayout, Grid, Col, Row, Container, Box, Stack, Section,
  HeroSection, FeatureGrid, ContentCard, DataTable, ActionGrid,
  ContactMethods, ActivityList
} from '@/ui';
```

### **Basic Page Structure**
```tsx
<PageLayout>
  <HeroSection title="Welcome" />
  <Section title="Features">
    <FeatureGrid features={features} />
  </Section>
</PageLayout>
```

### **Responsive Grid**
```tsx
<Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
  <Col>Content 1</Col>
  <Col>Content 2</Col>
  <Col>Content 3</Col>
  <Col>Content 4</Col>
</Grid>
```

## ⚠️ Important Notes

### **Import Structure**
- All components are available via `@/design/ui`
- The design system uses a unified export structure
- No need to import from individual directories

### **Type Definitions**
- Responsive values use breakpoint-based system (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
- All components have strict TypeScript definitions
- Validation functions are available for runtime type checking

### **Component Duplication**
- Some components exist in both `ui-components` and `content-sections`
- Use the `content-sections` versions for content patterns
- Use the `ui-components` versions for basic UI elements

This layout system provides a solid foundation for building consistent, responsive, and maintainable pages across the Fairfield Airport Cars application. 