# Fairfield Airport Cars - Architecture Documentation

## CMS/Edit Mode Integration Summary

The Fairfield Airport Cars platform uses a robust, type-safe CMS architecture that enables real-time, inline content editing for all customer-facing pages. The CMS is deeply integrated with page components and the admin interface, ensuring a seamless editing experience for authorized admins.

### CMS Schema & Configuration
- **Centralized TypeScript interfaces** define the structure for all page content in `src/types/cms.ts`.
- **Default content** is provided for every page, ensuring the site is always functional even if the CMS is empty.
- **Firebase** is used as the backend for storing and syncing CMS content.

### Edit Mode Pattern
- **Admin Detection**: Only authorized users (by email) see the floating "Edit Mode" toggle on customer-facing pages.
- **Floating Edit Controls**: The edit mode toggle appears fixed at the top-right. When enabled, all editable content becomes input fields or textareas.
- **Inline Editing**: Content is edited directly on the page, with visual feedback and styled fields.
- **Save/Cancel**: Admins can save changes (which update Firebase and the local cache) or cancel to revert.
- **Type Safety**: All editing is type-checked, and the admin CMS interface enforces validation.

### Page Component Integration
- Each page loads its content from the CMS using the `useCMS` hook.
- Pages check for admin status and conditionally render edit mode controls and input fields.
- All content sections (titles, subtitles, form fields, FAQ items, etc.) are mapped to CMS fields and editable inline.
- Save/cancel logic is handled locally and via the CMS service, with real-time updates.

### Admin CMS Interface
- The admin CMS at `/admin/cms/pages` provides organized forms for editing all content, grouped by page and section.
- TypeScript types ensure only valid content is saved.
- Real-time preview and feedback are provided for all edits.

### Example Flow
1. Admin logs in and visits a customer-facing page.
2. The floating "Edit Mode" button appears (top-right).
3. Admin enables edit mode; all editable content becomes input fields.
4. Admin makes changes and clicks "Save" (or "Cancel").
5. Changes are saved to Firebase and reflected instantly for all users.

### Security & Performance
- Only authorized admins can edit content.
- All sensitive operations are server-side and require authentication.
- CMS content is cached for performance and updated in real-time on changes.

---

(See code comments in `src/types/cms.ts`, `src/lib/cms-service.ts`, and `src/hooks/useCMS.ts` for further technical details.) 