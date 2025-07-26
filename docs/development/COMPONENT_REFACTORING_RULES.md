# 🚨 CRITICAL COMPONENT REFACTORING RULES

## ⚠️ NEVER REMOVE REUSABLE COMPONENTS

### **FORBIDDEN ACTIONS:**
- ❌ **NEVER** replace reusable components with custom HTML sections
- ❌ **NEVER** remove component architecture in favor of inline elements
- ❌ **NEVER** replace `<GridSection>`, `<InfoCard>`, `<ActionButtonGroup>` with `<section>` or `<div>`
- ❌ **NEVER** break component reusability for styling purposes

### **REQUIRED APPROACH:**
- ✅ **ALWAYS** keep reusable components intact
- ✅ **ALWAYS** refactor components internally (replace Tailwind/inline styles with semantic CSS)
- ✅ **ALWAYS** maintain component props and interfaces
- ✅ **ALWAYS** preserve component architecture and reusability

## 🎯 CORRECT REFACTORING PATTERN

### **Before (WRONG - Don't do this):**
```tsx
// ❌ WRONG - Removing reusable components
<section className="hero-section">
  <div className="hero-container">
    <h1>Title</h1>
    <p>Description</p>
  </div>
</section>
```

### **After (CORRECT - Do this):**
```tsx
// ✅ CORRECT - Keep reusable components, refactor internally
<GridSection variant="content" columns={1}>
  <InfoCard title="Title" description="Description">
    <ActionButtonGroup buttons={buttons} />
  </InfoCard>
</GridSection>
```

## 🔧 COMPONENT REFACTORING CHECKLIST

### **Step 1: Identify Reusable Components**
- [ ] List all reusable components being used
- [ ] Understand their purpose and reusability
- [ ] Document their props and interfaces

### **Step 2: Refactor Components Internally**
- [ ] Remove Tailwind classes from component files
- [ ] Replace with semantic CSS classes
- [ ] Remove inline styles
- [ ] Keep component structure intact

### **Step 3: Verify Component Usage**
- [ ] Ensure components are still being used in pages
- [ ] Verify props are still being passed correctly
- [ ] Confirm component reusability is maintained

## 🚨 VALIDATION RULES

### **Before Making Changes:**
1. **Identify the component** - What reusable component is this?
2. **Check usage** - Where else is this component used?
3. **Understand purpose** - Why was this component created?
4. **Plan refactoring** - How can I refactor it internally?

### **During Changes:**
1. **Keep structure** - Maintain component JSX structure
2. **Keep props** - Don't change component interfaces
3. **Keep reusability** - Ensure it can still be reused
4. **Test changes** - Verify the component still works

### **After Changes:**
1. **Verify usage** - Check that pages still use the component
2. **Test functionality** - Ensure component works as expected
3. **Check reusability** - Confirm it can be used elsewhere
4. **Document changes** - Update any relevant documentation

## 🎯 EXAMPLES OF CORRECT REFACTORING

### **GridSection Component:**
```tsx
// ✅ CORRECT - Refactor internally, keep structure
export const GridSection: React.FC<GridSectionProps> = ({
  children,
  columns = 4,
  variant = 'content',
  spacing = 'lg',
  className = '',
  theme = 'light'
}) => {
  const sectionClass = [
    'grid-section',                    // ✅ Semantic class
    `grid-section-${variant}`,         // ✅ Semantic class
    `grid-section-${spacing}`,        // ✅ Semantic class
    theme === 'dark' ? 'grid-section-dark' : 'grid-section-light',
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClass}>  {/* ✅ Keep structure */}
      <div className="grid-container">  {/* ✅ Keep structure */}
        {children}
      </div>
    </section>
  );
};
```

### **InfoCard Component:**
```tsx
// ✅ CORRECT - Refactor internally, keep structure
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  children,
  className = '',
  variant = 'default'
}) => {
  const cardClass = [
    'info-card',                       // ✅ Semantic class
    `info-card-${variant}`,            // ✅ Semantic class
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>        {/* ✅ Keep structure */}
      <div className="info-card-header">
        <h3 className="info-card-title">{title}</h3>
        {description && (
          <p className="info-card-description">{description}</p>
        )}
      </div>
      <div className="info-card-body">
        {children}
      </div>
    </div>
  );
};
```

## 🚨 RED FLAGS - STOP IMMEDIATELY IF YOU SEE:

1. **Replacing components with HTML elements:**
   ```tsx
   // ❌ RED FLAG - Don't do this
   <section className="hero-section">
   <div className="hero-container">
   ```

2. **Removing component imports:**
   ```tsx
   // ❌ RED FLAG - Don't remove these
   import { GridSection, InfoCard, ActionButtonGroup } from '@/components/ui';
   ```

3. **Breaking component structure:**
   ```tsx
   // ❌ RED FLAG - Don't change component structure
   <GridSection>  // Keep this
   <InfoCard>     // Keep this
   <ActionButtonGroup>  // Keep this
   ```

## ✅ GREEN FLAGS - GOOD REFACTORING:

1. **Keeping component usage:**
   ```tsx
   // ✅ GOOD - Keep using components
   <GridSection variant="content" columns={1}>
     <InfoCard title="Title" description="Description">
       <ActionButtonGroup buttons={buttons} />
     </InfoCard>
   </GridSection>
   ```

2. **Refactoring component internals:**
   ```tsx
   // ✅ GOOD - Refactor component CSS classes
   className="info-card info-card-primary"
   ```

3. **Maintaining component interfaces:**
   ```tsx
   // ✅ GOOD - Keep props and interfaces
   interface InfoCardProps {
     title: string;
     description?: string;
     children: React.ReactNode;
   }
   ```

## 🎯 REMEMBER:

**The goal is to remove Tailwind/inline styles from reusable components, NOT to remove the reusable components themselves.**

**Always ask: "Am I keeping the component architecture intact while refactoring the styling?"**

**If the answer is no, STOP and reconsider your approach.** 