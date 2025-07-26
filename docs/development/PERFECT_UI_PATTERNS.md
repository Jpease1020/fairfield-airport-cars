# 🎯 Perfect UI/JSX Design Patterns

## Overview
This document establishes the **perfect design patterns** for all pages in the Fairfield Airport Cars application. These patterns were meticulously crafted for the home page and must be consistently applied across every page.

---

## 🏗️ **Core Layout Structure**

### **1. UnifiedLayout Configuration**
**ALWAYS use these exact settings for consistency:**

```tsx
<UnifiedLayout 
  layoutType="marketing" // or "standard", "admin", "content"
  showNavigation={true}
  showFooter={true}
  maxWidth="xl"
  padding="lg"
  variant="default" // NOT "brand" to avoid header conflicts
  centerContent={false}
>
  {/* Page content */}
</UnifiedLayout>
```

**🚫 NEVER:**
- Add title/subtitle/description props to UnifiedLayout (creates duplicate headers)
- Use `variant="brand"` (conflicts with content)
- Nest multiple layout components

---

## 📐 **Section Architecture**

### **Perfect Section Pattern:**
```tsx
<section style={{
  padding: 'var(--spacing-3xl) 0', // Consistent vertical rhythm
  background: 'var(--bg-primary)', // CSS variables only
  // Optional: borderRadius, margin for cards
}}>
  <div style={{
    maxWidth: '1200px', // or '800px' for narrow content
    margin: '0 auto',
    padding: '0 var(--spacing-lg)' // Responsive padding
  }}>
    {/* Section content */}
  </div>
</section>
```

### **Section Types:**

**1. Hero Section (Page Top):**
```tsx
<section style={{
  textAlign: 'center',
  padding: 'var(--spacing-4xl) 0 var(--spacing-3xl) 0',
  background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
  borderRadius: 'var(--border-radius-lg)',
  margin: 'var(--spacing-xl) 0',
  color: 'white'
}}>
```

**2. Content Section (Middle):**
```tsx
<section style={{
  padding: 'var(--spacing-3xl) 0',
  background: 'var(--bg-primary)'
}}>
```

**3. CTA Section (Bottom):**
```tsx
<section style={{
  textAlign: 'center',
  padding: 'var(--spacing-4xl) 0',
  background: 'var(--bg-secondary)',
  borderRadius: 'var(--border-radius-lg)',
  margin: 'var(--spacing-xl) 0'
}}>
```

---

## 🎨 **Typography Hierarchy**

### **Perfect Typography Patterns:**

**Page Hero Title:**
```tsx
<h1 style={{
  fontSize: 'var(--font-size-4xl)',
  fontWeight: '800',
  lineHeight: '1.1',
  marginBottom: 'var(--spacing-md)',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)' // Only for white text
}}>
```

**Section Heading:**
```tsx
<h2 style={{
  fontSize: 'var(--font-size-3xl)',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: 'var(--spacing-md)'
}}>
```

**Card/Feature Title:**
```tsx
<h3 style={{
  fontSize: 'var(--font-size-xl)',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: 'var(--spacing-md)'
}}>
```

**Hero Subtitle:**
```tsx
<p style={{
  fontSize: 'var(--font-size-xl)',
  lineHeight: '1.6',
  marginBottom: 'var(--spacing-2xl)',
  opacity: '0.95', // For white text
  maxWidth: '600px',
  margin: '0 auto var(--spacing-2xl) auto'
}}>
```

**Section Description:**
```tsx
<p style={{
  fontSize: 'var(--font-size-lg)',
  color: 'var(--text-secondary)',
  maxWidth: '600px',
  margin: '0 auto'
}}>
```

**Body Text:**
```tsx
<p style={{
  fontSize: 'var(--font-size-base)',
  color: 'var(--text-secondary)',
  lineHeight: '1.6'
}}>
```

---

## 🔲 **Grid Layouts**

### **Perfect Grid Pattern:**
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--spacing-xl)',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  {items.map((item, index) => (
    <div key={index} style={{
      // Card styling
    }}>
      {/* Card content */}
    </div>
  ))}
</div>
```

**Grid Breakpoints:**
- `minmax(300px, 1fr)` - 3 columns → 2 → 1 responsive
- `minmax(250px, 1fr)` - 4 columns → 3 → 2 → 1 responsive  
- `minmax(400px, 1fr)` - 2 columns → 1 responsive

---

## 🎴 **Card Components**

### **Perfect Card Pattern:**
```tsx
<div style={{
  background: 'white',
  padding: 'var(--spacing-xl)',
  borderRadius: 'var(--border-radius-lg)',
  textAlign: 'center', // or 'left' for content cards
  border: '1px solid var(--border-primary)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
}}>
  {/* Card content */}
</div>
```

**Card Hover Effects (Optional):**
```tsx
// Add to card style:
'&:hover': {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.15)'
}
```

---

## 🎯 **Spacing System**

### **Consistent Spacing Variables:**
- `var(--spacing-xs)` - 4px - Small gaps
- `var(--spacing-sm)` - 8px - Tight spacing  
- `var(--spacing-md)` - 16px - Standard spacing
- `var(--spacing-lg)` - 24px - Comfortable spacing
- `var(--spacing-xl)` - 32px - Section padding
- `var(--spacing-2xl)` - 48px - Large separation
- `var(--spacing-3xl)` - 64px - Section vertical padding
- `var(--spacing-4xl)` - 96px - Hero padding

### **Spacing Rules:**
1. **Section vertical padding:** `var(--spacing-3xl)` or `var(--spacing-4xl)`
2. **Card padding:** `var(--spacing-xl)`
3. **Element margins:** `var(--spacing-md)` to `var(--spacing-xl)`
4. **Grid gaps:** `var(--spacing-xl)`

---

## 🎨 **Color System**

### **ALWAYS Use CSS Variables:**
- `var(--brand-primary)` - Primary brand color
- `var(--brand-secondary)` - Secondary brand color
- `var(--text-primary)` - Main text color
- `var(--text-secondary)` - Secondary text color
- `var(--text-muted)` - Muted text color
- `var(--bg-primary)` - Primary background
- `var(--bg-secondary)` - Secondary background
- `var(--border-primary)` - Border color
- `var(--border-radius-lg)` - Large border radius

### **Background Patterns:**
**Gradient Hero:**
```tsx
background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)'
```

**Subtle Section:**
```tsx
background: 'var(--bg-primary)'
```

**Card Background:**
```tsx
background: 'var(--bg-secondary)'
```

---

## 🔧 **Component Usage**

### **ActionButtonGroup - Perfect Pattern:**
```tsx
import { ActionButtonGroup } from '@/components/ui';

const buttons = [
  {
    label: 'Primary Action',
    onClick: () => window.location.href = '/target',
    variant: 'primary' as const,
    icon: '🚀'
  },
  {
    label: 'Secondary Action',
    onClick: () => window.location.href = '/target',
    variant: 'outline' as const,
    icon: 'ℹ️'
  }
];

<ActionButtonGroup buttons={buttons} />
```

---

## 📱 **Responsive Design**

### **Mobile-First Patterns:**
```tsx
// Perfect responsive container
<div style={{
  maxWidth: '800px', // Desktop max-width
  margin: '0 auto',
  padding: '0 var(--spacing-lg)' // Mobile padding
}}>
```

### **Responsive Typography:**
```tsx
// Headers automatically scale with CSS variables
fontSize: 'var(--font-size-4xl)' // Responsive font sizes
```

---

## ✅ **Quality Checklist**

### **Before Any Page is Complete:**
- [ ] Uses UnifiedLayout with correct props
- [ ] No duplicate headers (no title/subtitle in layout)
- [ ] Semantic section structure
- [ ] Consistent spacing variables
- [ ] CSS variables for all colors
- [ ] Proper typography hierarchy
- [ ] Responsive grid layouts
- [ ] Professional card styling
- [ ] ActionButtonGroup for CTAs
- [ ] Mobile-first responsive design

---

## 🚫 **Anti-Patterns (NEVER DO)**

1. **DON'T** use inline hardcoded colors: `color: '#blue'`
2. **DON'T** use arbitrary padding: `padding: '23px'`
3. **DON'T** nest GridSection inside InfoCard
4. **DON'T** create duplicate headers
5. **DON'T** use raw HTML without styling
6. **DON'T** mix component systems
7. **DON'T** use inconsistent font sizes
8. **DON'T** forget mobile responsiveness

---

## 🎯 **Perfect Example (Home Page)**

The home page (`src/app/page.tsx`) is the **PERFECT REFERENCE** for all design patterns. Every page should follow its structure:

1. **Clean UnifiedLayout setup**
2. **Hero section with gradient**
3. **Features section with grid**
4. **CTA section with strong action**
5. **Consistent spacing and typography**
6. **Professional card design**
7. **Perfect responsive behavior**

**Use the home page as your template for ALL pages.**

---

## 🚀 **Implementation Guide**

1. **Start with UnifiedLayout** - Correct props
2. **Add Hero Section** - Gradient, clear title
3. **Add Content Sections** - Grid layouts, cards
4. **Add CTA Section** - Strong call to action
5. **Test Responsiveness** - Mobile → Desktop
6. **Verify CSS Variables** - All colors, spacing
7. **Check Typography** - Hierarchy, readability
8. **Validate Pattern** - Matches home page quality

**Every page must meet this standard.** No exceptions. 