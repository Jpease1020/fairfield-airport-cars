# Fairfield Airport Cars - Architecture Documentation

## Overview

This document describes the technical architecture of the Fairfield Airport Cars platform, focusing on the Content Management System (CMS) and content editing patterns.

## Content Management System (CMS)

### Architecture Pattern

The CMS follows a centralized configuration pattern with the following components:

1. **CMS Configuration Store** (`src/types/cms.ts`)
   - Centralized TypeScript interfaces for all content types
   - Type-safe content structure for each page
   - Default content fallbacks for all pages

2. **CMS Service** (`src/lib/cms-service.ts`)
   - Firebase-based configuration storage
   - Caching layer for performance
   - CRUD operations for content management

3. **CMS Hook** (`src/hooks/useCMS.ts`)
   - React hook for accessing CMS content
   - Loading states and error handling
   - Cache invalidation and refresh capabilities

### CMS Schema Pattern

Each page follows a consistent schema pattern:

```typescript
// Page-specific content interface
interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  features: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  // ... other sections
}

// Centralized CMS configuration
interface CMSConfiguration {
  pages: {
    home: HomePageContent;
    help: HelpPageContent;
    booking: BookingPageContent;
    // ... all pages
  };
  business: BusinessSettings;
  pricing: PricingSettings;
  // ... other configurations
}
```

### Edit Mode Pattern

The edit mode follows a consistent pattern across all pages:

#### 1. Admin Detection
```typescript
const [isAdmin, setIsAdmin] = useState(false);
useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user: User | null) => {
    if (user && (user.email === 'justin@fairfieldairportcar.com' || user.email === 'gregg@fairfieldairportcar.com')) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  });
  return () => unsub();
}, []);
```

#### 2. Edit Mode State Management
```typescript
const [editMode, setEditMode] = useState(false);
const [localContent, setLocalContent] = useState<any>(null);
const [saving, setSaving] = useState(false);
const [saveMsg, setSaveMsg] = useState<string | null>(null);
```

#### 3. Floating Edit Controls
```typescript
{isAdmin && (
  <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
    {!editMode ? (
      <button onClick={() => setEditMode(true)}>Edit Mode</button>
    ) : (
      <div className="flex gap-2">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    )}
  </div>
)}
```

#### 4. Inline Editing Fields
```typescript
{editMode ? (
  <div className="bg-white p-6 rounded shadow mb-8">
    <label className="edit-label">Field Label</label>
    <input
      className="editable-input"
      value={localContent?.field || ''}
      onChange={e => handleFieldChange('field', e.target.value)}
    />
  </div>
) : (
  <div>{content?.field || 'Default Text'}</div>
)}
```

### CSS Classes for Edit Mode

The following CSS classes are used consistently across all pages:

```css
.edit-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.editable-input {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.editable-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.editable-textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  min-height: 100px;
  resize: vertical;
}
```

## Page Component Integration

### Standard Page Structure

Each content-editable page follows this structure:

1. **CMS Content Loading**
   ```typescript
   const { config: cmsConfig } = useCMS();
   const pageContent = cmsConfig?.pages?.pageName;
   ```

2. **Admin Detection & Edit Mode**
   ```typescript
   // Admin detection logic
   // Edit mode state management
   // Floating edit controls
   ```

3. **Content Rendering**
   ```typescript
   // Render content with CMS fallbacks
   // Conditional edit mode rendering
   ```

4. **Save/Cancel Logic**
   ```typescript
   const handleSave = async () => {
     // Update CMS configuration
     // Show success/error feedback
   };
   
   const handleCancel = () => {
     // Reset local content
     // Exit edit mode
   };
   ```

## Admin CMS Interface

### Form Structure

The admin CMS interface (`/admin/cms/pages`) provides comprehensive forms for editing all content:

1. **Page Selection**: Dropdown to select which page to edit
2. **Section Organization**: Content organized by page sections
3. **Field Validation**: Type-safe input fields with proper validation
4. **Save Functionality**: Real-time saving with feedback

### Default Content Pattern

Each page has complete default content to ensure the site works even without CMS configuration:

```typescript
const defaultContent = {
  title: 'Default Title',
  subtitle: 'Default subtitle',
  // ... all required fields
};
```

## Type Safety

### TypeScript Integration

- All CMS content is fully typed with TypeScript interfaces
- Edit mode handlers use proper typing for field changes
- Admin CMS forms enforce type safety
- Default content follows the same type structure

### Error Handling

- Graceful fallbacks for missing CMS content
- Loading states for CMS operations
- Error boundaries for CMS failures
- User-friendly error messages

## Performance Considerations

### Caching Strategy

- CMS configuration is cached in memory
- Cache invalidation on content updates
- Lazy loading of CMS content
- Optimistic updates for better UX

### Bundle Optimization

- CMS types are tree-shakeable
- Edit mode CSS is minimal and reusable
- Admin detection is lightweight
- No unnecessary re-renders

## Security

### Admin Authentication

- Firebase-based authentication
- Email-based admin detection
- Secure admin routes
- No client-side admin secrets

### Content Validation

- Server-side content validation
- Type-safe content structure
- XSS prevention in content rendering
- Input sanitization in edit mode

## Future Enhancements

### Planned Features

1. **Rich Text Editor**: WYSIWYG editing for complex content
2. **Content Versioning**: Track changes and rollback capabilities
3. **Multi-language Support**: Internationalization for content
4. **Content Scheduling**: Publish content at specific times
5. **Advanced Permissions**: Role-based access control

### Technical Debt

1. **Type Consolidation**: Reduce any types in edit mode
2. **Component Extraction**: Create reusable edit mode components
3. **Performance Optimization**: Implement virtual scrolling for large forms
4. **Testing Coverage**: Add comprehensive tests for edit mode 