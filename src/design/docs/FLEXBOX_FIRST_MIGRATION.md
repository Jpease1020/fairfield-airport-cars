# Flexbox-First Migration Guide

## 🎯 **Overview**

This guide helps you migrate from margin-based spacing to flexbox-first patterns for better consistency, performance, and maintainability.

## 🚨 **What Changed**

We've moved from margin-based spacing to flexbox-based spacing across all layout components:

- ✅ **Flexbox `gap`** for spacing between components
- ✅ **Padding** for internal component spacing  
- ✅ **Limited `margin: auto`** for edge-case positioning
- ❌ **Deprecated margin-based offsets** (conflicts with flexbox)

## 🔧 **Migration Patterns**

### **1. Column Offsets → Spacer Component**

```tsx
// ❌ Old way (margin-based, conflicts with flexbox)
<Row>
  <Col span={6} offset={2}>Content</Col>
  <Col span={4}>Content</Col>
</Row>

// ✅ New way (flexbox-first)
<Row>
  <Spacer span={2} />
  <Col span={6}>Content</Col>
  <Col span={4}>Content</Col>
</Row>
```

### **2. Complex Layouts → Enhanced Grid**

```tsx
// ❌ Old way (multiple offsets)
<Row>
  <Col span={3} offset={1}>Left</Col>
  <Col span={4} offset={1}>Center</Col>
  <Col span={2} offset={1}>Right</Col>
</Row>

// ✅ New way (CSS Grid with precise positioning)
<Grid cols={12} gap="md">
  <GridItem span={3} start={2}>Left</GridItem>
  <GridItem span={4} start={6}>Center</GridItem>
  <GridItem span={2} start={11}>Right</GridItem>
</Grid>
```

### **3. Push to Edge → Flexible Spacers**

```tsx
// ❌ Old way (margin auto)
<Row>
  <div>Left content</div>
  <div style={{ marginLeft: 'auto' }}>Right content</div>
</Row>

// ✅ New way (growing spacer)
<Row>
  <div>Left content</div>
  <Spacer grow />
  <div>Right content</div>
</Row>
```

### **4. Size-based Spacing → Spacer Sizes**

```tsx
// ❌ Old way (margins everywhere)
<div style={{ marginRight: '1rem' }}>Content</div>

// ✅ New way (spacer component)
<Row>
  <div>Content</div>
  <Spacer size="md" direction="horizontal" />
  <div>More content</div>
</Row>
```

## 🎨 **Component Usage Examples**

### **Spacer Component**

```tsx
// Size-based spacing
<Spacer size="lg" direction="horizontal" />
<Spacer size="sm" direction="vertical" />

// Grid column spacing (replaces offset)
<Spacer span={3} /> // 3-column spacer

// Flexible spacing
<Spacer grow /> // Grows to fill space
<Spacer shrink={false} /> // Doesn't shrink

// Positioning
<Spacer margin="auto" alignSelf="center" />
```

### **Enhanced GridItem**

```tsx
// Precise positioning
<GridItem span={6} start={3}>Centered content</GridItem>
<GridItem start={2} end={8}>Spans columns 2-7</GridItem>

// With flexbox positioning
<GridItem 
  span={4} 
  start={5} 
  alignSelf="center" 
  margin="auto"
>
  Positioned content
</GridItem>
```

### **Updated Layout Components**

```tsx
// All components now support limited margin
<Container margin="auto" alignSelf="center">
<Section margin="none" alignSelf="flex-end">
<Box margin="auto" alignSelf="stretch">
<Row margin="none" alignSelf="center">
<Col margin="auto" alignSelf="flex-start">
<Stack margin="none" alignSelf="flex-end">
```

## 📋 **Migration Checklist**

### **1. Find and Replace Patterns**

- [ ] Search for `offset=` and replace with `<Spacer span={X} />`
- [ ] Search for `margin=` with spacing values and replace with flexbox alternatives
- [ ] Look for `style={{ margin: }}` and convert to flexbox patterns

### **2. Component Updates**

- [ ] Replace `Col` offsets with `Spacer` components
- [ ] Use `Grid` with `start/end` for complex layouts
- [ ] Convert margin-based spacing to `gap` on parent containers
- [ ] Use `margin="auto"` only for edge-case positioning

### **3. Testing**

- [ ] Verify layouts look identical after migration
- [ ] Test responsive behavior at all breakpoints
- [ ] Check for console warnings about deprecated patterns
- [ ] Validate accessibility with screen readers

## 🎯 **When to Use Each Approach**

### **Use Spacer Component When:**
- Replacing column offsets (`offset` prop)
- Creating flexible spacing that grows/shrinks
- Adding size-based spacing between elements
- Need precise control over spacing direction

### **Use Enhanced Grid When:**
- Complex layouts with multiple positioned elements
- Need precise column start/end positioning
- Building dashboard-style layouts
- Content needs to span specific grid positions

### **Use Limited Margin When:**
- Pushing element to container edge (`margin="auto"`)
- Override parent alignment for single element
- Edge cases where flexbox properties don't work

### **Use Gap (Parent Containers) When:**
- Spacing between all children uniformly
- Working with flexbox containers (Row, Stack)
- Building responsive layouts
- Want consistent spacing that scales

## 🚨 **Common Pitfalls**

### **1. Mixing Margin and Gap**
```tsx
// ❌ Don't mix margin with flexbox gap
<Row gap="md">
  <div style={{ margin: '1rem' }}>Content</div> // Conflicts!
</Row>

// ✅ Use gap consistently
<Row gap="md">
  <div>Content</div>
</Row>
```

### **2. Using Offset in Flexbox Containers**
```tsx
// ❌ Offset conflicts with flexbox
<Row gap="md">
  <Col span={6} offset={2}>Content</Col> // Warning!
</Row>

// ✅ Use Spacer instead
<Row gap="md">
  <Spacer span={2} />
  <Col span={6}>Content</Col>
</Row>
```

### **3. Overusing Spacer Components**
```tsx
// ❌ Too many spacers
<Row>
  <Spacer size="sm" />
  <div>Content</div>
  <Spacer size="sm" />
  <div>Content</div>
  <Spacer size="sm" />
</Row>

// ✅ Use gap instead
<Row gap="sm">
  <div>Content</div>
  <div>Content</div>
</Row>
```

## 🎉 **Benefits of Flexbox-First**

1. **Consistent Spacing**: All spacing controlled by flexbox `gap`
2. **Better Performance**: Fewer CSS properties to calculate
3. **Responsive**: Flexbox gap scales better than margin
4. **Maintainable**: Single spacing system vs margin + gap
5. **Accessible**: Better screen reader navigation
6. **Modern**: Aligns with current CSS best practices

## 📚 **Further Reading**

- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Modern CSS Layout Patterns](https://web.dev/one-line-layouts/)
- [Flexbox vs Grid Decision Tree](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Relationship_of_Grid_Layout)
