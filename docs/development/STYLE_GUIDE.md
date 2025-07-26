# 🎨 Fairfield Airport Cars - Style Guide & Development Standards

## 📋 **Overview**
This style guide documents the design system and development patterns established during our comprehensive admin page refactoring. **ALL pages must follow these standards** to maintain the professional, enterprise-grade quality we've achieved.

---

## 🏗️ **Page Structure Hierarchy**

### **1. Page Layout Foundation**
Every page MUST use this exact structure:

```tsx
// 🔥 REQUIRED: Every page must follow this pattern
export default function PageName() {
  return (
    <ToastProvider>
      <PageContent />
    </ToastProvider>
  );
}

function PageContent() {
  const { addToast } = useToast();
  
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Page Title"
        subtitle="Page description"
      >
        {/* Page content using GridSection and InfoCard */}
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
```

### **2. Admin Pages Structure**
Admin pages use `AdminPageWrapper` instead:

```tsx
<AdminPageWrapper
  title="Admin Page Title"
  subtitle="Description of what this admin page does"
  actions={headerActions}
  loading={loading}
  error={error}
  errorTitle="Error Context"
>
  {/* Content using SettingSection */}
</AdminPageWrapper>
```

---

## 📦 **Component Usage Rules**

### **Content Organization**

#### **✅ DO: Use SettingSection for Admin Forms**
```tsx
<SettingSection
  title="Section Title"
  description="What this section is for"
  icon="🎯"
>
  <SettingInput
    id="field-id"
    label="Field Label"
    description="Help text for the user"
    value={value}
    onChange={setValue}
    placeholder="Helpful placeholder"
    icon="📝"
  />
</SettingSection>
```

#### **✅ DO: Use GridSection + InfoCard for Public Pages**
```tsx
<GridSection variant="content" columns={1}>
  <InfoCard
    title="Card Title"
    description="What this card contains"
  >
    {/* Card content */}
  </InfoCard>
</GridSection>
```

### **Form Input Standards**

#### **✅ DO: Use SettingInput for Admin Forms**
```tsx
<SettingInput
  id="unique-id"
  label="Human Readable Label"
  description="Help text explaining the field"
  type="text" // text, email, number, password
  value={value}
  onChange={setValue}
  placeholder="Example input"
  icon="📝"
  disabled={false}
/>
```

#### **✅ DO: Use FormField for Customer Forms**
```tsx
<FormField
  label="Field Label"
  id="field-id"
  name="field-name" // REQUIRED for testing
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Helpful placeholder"
  required
/>
```

#### **❌ DON'T: Use Raw HTML Inputs**
```tsx
// ❌ NEVER DO THIS
<input type="text" /> 
<label>Raw label</label>

// ✅ ALWAYS DO THIS
<SettingInput {...props} />
// OR
<FormField {...props} />
```

---

## 🎨 **Styling Standards**

### **CSS Class Patterns**

#### **Spacing (Use Consistent Variables)**
```tsx
// ✅ GOOD: Use design system variables
<div style={{
  padding: 'var(--spacing-lg)',
  gap: 'var(--spacing-md)',
  margin: 'var(--spacing-sm)'
}}>

// ❌ BAD: Hardcoded values
<div style={{ padding: '16px', gap: '8px' }}>
```

#### **Colors (Use Design System)**
```tsx
// ✅ GOOD: Design system colors
<div style={{
  backgroundColor: 'var(--background-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)'
}}>

// ❌ BAD: Hardcoded colors
<div style={{ backgroundColor: '#fff', color: '#000' }}>
```

#### **Typography**
```tsx
// ✅ GOOD: Consistent font sizes
<h1 style={{ fontSize: 'var(--font-size-xl)' }}>
<p style={{ fontSize: 'var(--font-size-base)' }}>
<small style={{ fontSize: 'var(--font-size-sm)' }}>

// ❌ BAD: Random font sizes
<h1 style={{ fontSize: '24px' }}>
```

### **Button Standards**

#### **✅ DO: Use ActionButtonGroup for Multiple Actions**
```tsx
const actions = [
  {
    label: 'Primary Action',
    onClick: handlePrimary,
    variant: 'primary' as const,
    icon: '🚀'
  },
  {
    label: 'Secondary Action', 
    onClick: handleSecondary,
    variant: 'outline' as const,
    icon: '📝'
  }
];

<ActionButtonGroup buttons={actions} />
```

#### **✅ DO: Use Professional Button Styling**
```tsx
<button className="w-full h-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
  🚗 Professional Button
</button>
```

---

## 🔔 **User Feedback Standards**

### **✅ DO: Use Toast Notifications**
```tsx
// ✅ GOOD: Professional toast notifications
const { addToast } = useToast();
addToast('success', 'Action completed successfully!');
addToast('error', 'Something went wrong. Please try again.');
addToast('info', 'Helpful information for the user.');

// ❌ BAD: Native browser alerts
alert('This looks unprofessional');
```

### **✅ DO: Use StatusMessage for Persistent Messages**
```tsx
{error && (
  <StatusMessage 
    type="error" 
    message={error} 
    onDismiss={() => setError(null)}
  />
)}
```

---

## 📱 **Responsive Design Rules**

### **Grid Layouts**
```tsx
// ✅ GOOD: Responsive grid
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--spacing-lg)'
}}>

// ✅ GOOD: Tailwind responsive
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

### **Mobile-First Approach**
```tsx
// ✅ GOOD: Mobile-first breakpoints
<div className="flex flex-col md:flex-row gap-4">

// ✅ GOOD: Touch-friendly sizing
<button className="h-12 px-6"> // Minimum 44px touch target
```

---

## 🎯 **Component Patterns**

### **Loading States**
```tsx
// ✅ DO: Use LoadingSpinner component
{loading && <LoadingSpinner size="lg" />}

// ✅ DO: Use skeleton states
{loading ? <BookingFormSkeleton /> : <BookingForm />}
```

### **Error Boundaries**
```tsx
// ✅ DO: Wrap components in ErrorBoundary
<ErrorBoundary fallback={ErrorFallback}>
  <ComponentThatMightFail />
</ErrorBoundary>
```

### **Data Display**
```tsx
// ✅ DO: Use structured data components
<DataTable
  columns={columns}
  data={data}
  actions={tableActions}
/>

// ✅ DO: Use cards for grouped information
<InfoCard title="Data Group" description="Description">
  {/* Structured data */}
</InfoCard>
```

---

## 🔗 **Navigation Standards**

### **✅ DO: Use Consistent Navigation**
```tsx
// ✅ GOOD: Professional navigation
<ActionButtonGroup buttons={[
  { label: 'Back to Dashboard', onClick: () => router.push('/admin'), variant: 'outline', icon: '🔙' },
  { label: 'Save Changes', onClick: handleSave, variant: 'primary', icon: '💾' }
]} />
```

### **✅ DO: Use Breadcrumbs for Deep Navigation**
```tsx
<nav>Admin > Settings > Business Settings</nav>
```

---

## 🎨 **Visual Hierarchy Rules**

### **Section Organization**
1. **Page Title** (H1) - `UniversalLayout` title prop
2. **Section Titles** (H2) - `SettingSection` or `InfoCard` title
3. **Field Labels** (H3/Label) - `SettingInput` or `FormField` label
4. **Help Text** (Small) - Description props
5. **Error Messages** - `StatusMessage` component

### **Color Hierarchy**
- **Primary Actions**: Brand primary color with gradients
- **Secondary Actions**: Outline style
- **Destructive Actions**: Error color (but we use 'primary' for consistency)
- **Success States**: Green gradients
- **Warning States**: Yellow/amber colors

---

## 📋 **Form Validation Standards**

### **✅ DO: Client-Side Validation**
```tsx
const validateForm = (): boolean => {
  const newErrors: FormErrors = {};
  
  if (!name.trim()) newErrors.name = 'Name is required';
  if (!email.trim()) newErrors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### **✅ DO: Accessible Error Messages**
```tsx
// Form fields automatically handle error display
<FormField
  label="Email"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

---

## 🚀 **Performance Standards**

### **✅ DO: Optimize Images**
```tsx
// ✅ GOOD: Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={200} height={100} />

// ❌ BAD: Regular img tags for large images
<img src="/large-image.jpg" />
```

### **✅ DO: Code Splitting**
```tsx
// ✅ GOOD: Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

---

## 🧪 **Testing Standards**

### **✅ DO: Include Test Attributes**
```tsx
// ✅ GOOD: Proper name attributes for testing
<input name="email" data-testid="email-input" />
<button data-testid="submit-button">Submit</button>
```

### **✅ DO: Accessible Form Labels**
```tsx
// ✅ GOOD: Proper label association
<label htmlFor="email">Email Address</label>
<input id="email" name="email" />
```

---

## 🔍 **Code Quality Rules**

### **TypeScript Standards**
```tsx
// ✅ GOOD: Proper interfaces
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
}

// ✅ GOOD: Type-safe event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### **Import Organization**
```tsx
// ✅ GOOD: Organized imports
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  SettingSection,
  SettingInput,
  StatusMessage,
  ToastProvider,
  useToast
} from '@/components/ui';
import { validateEmail } from '@/lib/utils';
```

---

## 📚 **Documentation Standards**

### **✅ DO: Component Documentation**
```tsx
/**
 * BookingForm - Handles customer ride booking
 * 
 * @example
 * ```tsx
 * <BookingForm onSubmit={handleBooking} />
 * ```
 */
export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit }) => {
  // Component implementation
};
```

---

## 🛡️ **Security Standards**

### **✅ DO: Input Sanitization**
```tsx
// ✅ GOOD: Validate and sanitize inputs
const sanitizedInput = input.trim().slice(0, 100);
```

### **✅ DO: Secure API Calls**
```tsx
// ✅ GOOD: Error handling for API calls
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData)
  });
  
  if (!response.ok) throw new Error('Request failed');
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  addToast('error', 'Operation failed. Please try again.');
}
```

---

## 🎯 **Quality Checklist**

Before committing any page, verify:

### **✅ Structure**
- [ ] Uses ToastProvider wrapper
- [ ] Uses UniversalLayout or AdminPageWrapper
- [ ] Uses SettingSection or InfoCard for content organization
- [ ] Uses proper component hierarchy

### **✅ Forms**
- [ ] Uses SettingInput or FormField (no raw HTML inputs)
- [ ] Has proper name attributes for testing
- [ ] Includes validation and error handling
- [ ] Uses toast notifications for feedback

### **✅ Styling**
- [ ] Uses design system variables
- [ ] Responsive on mobile and desktop
- [ ] Consistent with admin page quality
- [ ] Professional gradients and hover effects

### **✅ Accessibility**
- [ ] Proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast compliant

### **✅ Performance**
- [ ] No console errors
- [ ] Fast loading times
- [ ] Optimized images
- [ ] Minimal bundle impact

---

## 🎨 **Visual Examples**

### **Professional Button Styling**
```tsx
// ✅ Primary action button
<button className="w-full h-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
  🚗 Book Now - $150
</button>

// ✅ Secondary action button  
<button className="flex-1 h-16 bg-gradient-to-r from-brand-secondary to-brand-primary text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
  Calculate Fare
</button>
```

### **Professional Form Sections**
```tsx
<SettingSection
  title="Personal Information"
  description="Please provide your contact details for the booking"
  icon="👤"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <SettingInput
      id="name"
      label="Full Name"
      description="Your complete name as it appears on ID"
      value={name}
      onChange={setName}
      placeholder="Enter your full name"
      icon="👤"
    />
  </div>
</SettingSection>
```

---

## 🚀 **Final Standards**

**REMEMBER**: Every page we create should look and feel like it cost $50,000+ to develop. No shortcuts, no compromises on quality. Follow these standards religiously and our application will continue to look and function like an enterprise-grade platform.

**When in doubt**: Look at our admin pages for reference - they represent the gold standard we've achieved. 