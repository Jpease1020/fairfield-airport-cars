// 🎯 UNIFIED LAYOUT SYSTEM - THE SINGLE SYSTEM FOR ALL PAGES
export { UnifiedLayout } from './UnifiedLayout';

// CMS-Aware Layout Components (Legacy - use UnifiedLayout instead)
// Temporarily disabled due to import errors
// export { CMSStandardPage } from './CMSStandardPage';
// export { CMSMarketingPage } from './CMSMarketingPage';
// export { CMSConversionPage } from './CMSConversionPage';
// export { CMSContentPage } from './CMSContentPage';
// export { CMSStatusPage } from './CMSStatusPage';

// Legacy components - use UnifiedLayout instead
export { UniversalLayout } from './UniversalLayout';
export { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
export { StandardLayout } from './StandardLayout';
export { StandardNavigation } from './StandardNavigation';
export { StandardHeader } from './StandardHeader';
export { StandardFooter } from './StandardFooter';

// Page structure components
export { PageContainer } from './PageContainer';
export { PageHeader } from './PageHeader';
export { default as Navigation } from './Navigation';

/**
 * 🚨 IMPORTANT: Use UnifiedLayout for ALL pages
 * 
 * ✅ CORRECT - The Single System:
 * import { UnifiedLayout } from '@/components/layout';
 * 
 * export default function MyPage() {
 *   return (
 *     <UnifiedLayout
 *       layoutType="standard"
 *       title="My Page"
 *       subtitle="Page description"
 *     >
 *       // Your content here
 *     </UnifiedLayout>
 *   );
 * }
 * 
 * Layout Types for Different Pages:
 * - "standard" - Public customer pages
 * - "admin" - Admin dashboard pages
 * - "minimal" - Login, error pages
 * - "marketing" - Homepage, about page
 * - "content" - Help, terms, privacy
 * - "status" - Booking status, success pages
 * 
 * Features:
 * ✅ CMS color control from /admin/cms/colors
 * ✅ Consistent spacing and typography
 * ✅ Responsive design
 * ✅ Accessibility built-in
 * ✅ Navigation/footer control
 * ✅ Multiple visual variants
 */ 