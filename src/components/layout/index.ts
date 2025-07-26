// 🎨 Universal Design System Components
// All pages MUST use these components for consistent design

// CMS-Aware Layout Components (NEW - from other computer)
export { CMSStandardPage } from './CMSStandardPage';
export { CMSMarketingPage } from './CMSMarketingPage';
export { CMSConversionPage } from './CMSConversionPage';
export { CMSContentPage } from './CMSContentPage';
export { CMSStatusPage } from './CMSStatusPage';

// Universal Layout System (Primary approach)
export { UniversalLayout } from './UniversalLayout';
export { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

// Legacy components - use UniversalLayout or CMS components instead
export { StandardLayout } from './StandardLayout';
export { StandardNavigation } from './StandardNavigation';
export { StandardHeader } from './StandardHeader';
export { StandardFooter } from './StandardFooter';

// Page structure components
export { PageContainer } from './PageContainer';
export { PageHeader } from './PageHeader';
export { Navigation } from './Navigation';

/**
 * 🚨 IMPORTANT: Choose the right layout approach
 * 
 * FOR CMS-INTEGRATED PAGES:
 * import { CMSStandardPage, CMSMarketingPage } from '@/components/layout';
 * 
 * FOR UNIVERSAL DESIGN SYSTEM:
 * import { UniversalLayout, LayoutEnforcer } from '@/components/layout';
 * 
 * ✅ CMS Layout usage:
 * export default function MyPage() {
 *   return (
 *     <CMSStandardPage title="My Page" pageType="content">
 *       // Your content - CMS will handle layout
 *     </CMSStandardPage>
 *   );
 * }
 * 
 * ✅ Universal Layout usage:
 * export default function MyPage() {
 *   return (
 *     <LayoutEnforcer>
 *       <UniversalLayout layoutType="standard" title="My Page">
 *         <section className="content-section">
 *           // Your content using standard CSS classes
 *         </section>
 *       </UniversalLayout>
 *     </LayoutEnforcer>
 *   );
 * }
 * 
 * Layout Types:
 * - CMS: "content", "marketing", "conversion", "status"
 * - Universal: "standard", "admin", "minimal"
 */ 