# 🎨 Universal Design System Rules

## 📋 **MANDATORY RULES - NO EXCEPTIONS**

### 🏗️ **Layout Requirements**
1. **ALL pages MUST use `UniversalLayout`** - No custom layout patterns allowed
2. **ALL pages MUST have `.standard-layout` wrapper** - Automatically provided by UniversalLayout
3. **ALL content MUST go inside `.standard-content`** - Ensures consistent spacing and max-width

### 🎯 **Component Requirements**
1. **Use standard CSS classes ONLY** - No Tailwind, no inline styles
2. **Use design tokens from `standard-layout.css`** - All colors, spacing, typography from CSS variables
3. **Follow semantic HTML structure** - Proper heading hierarchy (h1 → h2 → h3)

### 🎨 **Visual Requirements**
1. **Consistent spacing** - Use `var(--spacing-*)` tokens only
2. **Consistent colors** - Use `var(--*-color)` tokens only  
3. **Consistent typography** - Use `var(--font-size-*)` tokens only
4. **Consistent borders/shadows** - Use predefined `var(--shadow-*)` and `var(--border-radius)`

## 📐 **Layout Types**

### 🌐 **Standard Layout** (`layoutType="standard"`)
- **Used for**: Public pages (home, about, help, booking)
- **Includes**: Navigation + Header + Content + Footer
- **Example**:
```tsx
<UniversalLayout 
  layoutType="standard"
  title="Page Title" 
  subtitle="Page description"
>
  <section className="content-section">
    // Your content
  </section>
</UniversalLayout>
```

### 🔧 **Admin Layout** (`layoutType="admin"`)
- **Used for**: Admin dashboard and management pages
- **Includes**: Admin Navigation + Content (no footer)
- **Example**:
```tsx
<UniversalLayout 
  layoutType="admin"
  title="Admin Page Title"
>
  <div className="admin-content">
    // Your admin content
  </div>
</UniversalLayout>
```

### 📄 **Minimal Layout** (`layoutType="minimal"`)
- **Used for**: Login pages, error pages, simple forms
- **Includes**: Content only (no nav, header, footer)
- **Example**:
```tsx
<UniversalLayout layoutType="minimal">
  <div className="minimal-content">
    // Your minimal content
  </div>
</UniversalLayout>
```

## 🧩 **Required Components**

### 📦 **Cards**
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
    <p className="card-description">Description</p>
  </div>
  <div className="card-body">
    // Card content
  </div>
</div>
```

### 🔘 **Buttons**
```tsx
<a href="/link" className="btn btn-primary">Primary Action</a>
<button className="btn btn-outline">Secondary Action</button>
```

### 📊 **Grids**
```tsx
<div className="grid grid-2">  // 2 columns
<div className="grid grid-3">  // 3 columns  
<div className="grid grid-4">  // 4 columns
```

## 🚫 **FORBIDDEN PATTERNS**

### ❌ **Never Use**
- Inline styles: `style={{color: 'red'}}`
- Tailwind classes: `className="flex justify-center p-4"`
- Custom CSS files per page
- Hardcoded colors/spacing: `margin: 20px`
- Multiple layout patterns in one app

### ✅ **Always Use**
- CSS classes from `standard-layout.css`
- Design tokens: `var(--spacing-lg)`
- Semantic HTML elements
- UniversalLayout wrapper
- Standard component patterns

## 🔍 **Enforcement**

### 🛠️ **Development Tools**
1. **LayoutEnforcer component** - Validates design system compliance
2. **ESLint rules** - Prevents forbidden patterns
3. **Console warnings** - Shows violations in development
4. **Type checking** - Ensures proper prop usage

### 📋 **Review Checklist**
- [ ] Uses UniversalLayout with correct layoutType
- [ ] No inline styles anywhere
- [ ] No Tailwind classes
- [ ] Uses standard CSS classes only
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Consistent spacing using design tokens
- [ ] Follows card/button/grid patterns

## 💡 **Benefits**

1. **Consistent User Experience** - Every page feels like part of the same app
2. **Faster Development** - Reusable patterns speed up coding
3. **Easier Maintenance** - Changes to design system affect all pages
4. **Better Accessibility** - Standard patterns ensure accessibility
5. **Professional Look** - Cohesive design across entire application

## 🎯 **Implementation**

Update all existing pages to follow these rules:

```tsx
// ❌ Old Pattern
export default function MyPage() {
  return (
    <div style={{padding: '20px'}}>
      <h1 className="text-3xl font-bold">Title</h1>
      // content
    </div>
  );
}

// ✅ New Pattern  
export default function MyPage() {
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Title"
      >
        <section className="content-section">
          // content using standard classes
        </section>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
```

**Result**: Every page will have the same professional look, consistent behavior, and maintainable code structure. 