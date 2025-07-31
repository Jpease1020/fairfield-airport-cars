# 🎨 Design System Documentation

## 📅 Date: January 27, 2025

---

## 🎯 **Overview**

The Fairfield Airport Cars design system provides a consistent, accessible, and maintainable foundation for all UI components. This system is built on CSS variables and TypeScript tokens for maximum flexibility and type safety.

## 📁 **File Structure**

```
src/
├── styles/
│   ├── variables.css           # Single source of truth for CSS variables
│   ├── standard-layout.css     # Base styles and layout utilities
│   └── page-editable.css       # CMS editing styles
├── lib/
│   └── design-system/
│       ├── tokens.ts           # TypeScript design tokens
│       ├── types.ts            # TypeScript type definitions
│       ├── components/         # Design system components
│       ├── utils/              # Utility functions
│       └── cms/               # CMS-specific design components
└── components/
    ├── layout/                # Layout components
    └── ui/                    # UI components
```

## 🎨 **Color System**

### **Primary Colors**
- **Main**: `#0B1F3A` (Dark Blue)
- **Hover**: `#08142A` (Darker Blue)
- **Scale**: 50-900 with semantic variations

### **Secondary Colors**
- **Main**: `#4b5563` (Gray)
- **Hover**: `#374151` (Darker Gray)
- **Scale**: 50-900 with semantic variations

### **Semantic Colors**
- **Success**: `#16a34a` (Green)
- **Warning**: `#ca8a04` (Yellow)
- **Error**: `#dc2626` (Red)
- **Info**: `#3b82f6` (Blue)

### **Usage**
```css
/* Use CSS variables for consistency */
color: var(--primary-color);
background-color: var(--background-primary);
border-color: var(--border-color);
```

## 📏 **Spacing System**

### **8px Grid System**
- **Base Unit**: 8px (0.5rem)
- **Scale**: 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px

### **Usage**
```css
/* Use spacing variables */
padding: var(--space-4);  /* 16px */
margin: var(--space-2);   /* 8px */
gap: var(--space-6);      /* 24px */
```

## 🔤 **Typography System**

### **Font Families**
- **Sans**: System fonts with fallbacks
- **Mono**: Monospace fonts for code

### **Font Sizes**
- **Scale**: xs (12px) to 6xl (60px)
- **Base**: 16px (1rem)

### **Font Weights**
- **Range**: 100-900 (thin to black)
- **Common**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### **Usage**
```css
/* Typography variables */
font-size: var(--text-lg);
font-weight: var(--font-semibold);
line-height: var(--leading-normal);
```

## 🎯 **Border Radius**

### **Scale**
- **None**: 0
- **Small**: 2px
- **Base**: 4px
- **Medium**: 6px
- **Large**: 8px
- **XL**: 12px
- **2XL**: 16px
- **Full**: 9999px (circular)

### **Usage**
```css
border-radius: var(--radius-lg);
```

## 🌟 **Shadows**

### **Scale**
- **Small**: Subtle elevation
- **Base**: Default elevation
- **Medium**: Card elevation
- **Large**: Modal elevation
- **XL**: Dropdown elevation
- **2XL**: Maximum elevation

### **Usage**
```css
box-shadow: var(--shadow-md);
```

## ⚡ **Transitions**

### **Durations**
- **Fast**: 150ms
- **Base**: 200ms
- **Slow**: 300ms

### **Usage**
```css
transition: all var(--transition-base);
```

## 📱 **Breakpoints**

### **Responsive Design**
- **Small**: 640px
- **Medium**: 768px
- **Large**: 1024px
- **XL**: 1280px
- **2XL**: 1536px

### **Usage**
```css
@media (min-width: var(--breakpoint-md)) {
  /* Medium screen and up */
}
```

## 🧩 **Component Guidelines**

### **Layout Components**
- Use semantic HTML elements
- Implement proper accessibility attributes
- Follow responsive design principles
- Use CSS Grid and Flexbox for layouts

### **UI Components**
- Maintain consistent spacing
- Use design tokens for colors and typography
- Implement proper focus states
- Ensure keyboard navigation

### **Form Components**
- Provide clear labels and descriptions
- Show validation states
- Use consistent styling
- Implement proper error handling

## ♿ **Accessibility Standards**

### **WCAG 2.1 AA Compliance**
- **Color Contrast**: Minimum 4.5:1 for normal text
- **Focus Indicators**: Visible focus states
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Reader Support**: Proper ARIA labels

### **Implementation**
```css
/* Focus styles */
*:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  /* Enhanced contrast styles */
}
```

## 🔧 **Development Guidelines**

### **CSS Variables**
- Always use CSS variables for design tokens
- Don't hardcode colors or spacing values
- Use semantic variable names

### **Component Structure**
- Keep components focused and single-purpose
- Use TypeScript for type safety
- Implement proper prop interfaces

### **Performance**
- Minimize CSS bundle size
- Use efficient selectors
- Optimize for critical rendering path

## 📚 **Resources**

### **Tools**
- **Color Contrast Checker**: WebAIM Contrast Checker
- **Accessibility Testing**: axe-core
- **CSS Validation**: W3C CSS Validator

### **References**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens](https://www.designtokens.org/)

## 🚀 **Future Enhancements**

### **Planned Features**
- **CMS Color Management**: Dynamic color updates
- **Dark Mode Support**: Theme switching
- **Component Playground**: Interactive documentation
- **Automated Testing**: Style validation

### **Roadmap**
- **Phase 1**: Consolidate existing system ✅
- **Phase 2**: Add CMS integration
- **Phase 3**: Implement dark mode
- **Phase 4**: Create component library

---

*Last Updated: January 27, 2025*
*Status: ✅ Documented and Organized* 