// 🎨 Universal Design System Components
// All pages MUST use these components for consistent design

export { UniversalLayout } from './UniversalLayout';
export { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

// Legacy components - use UniversalLayout instead
export { StandardLayout } from './StandardLayout';
export { StandardNavigation } from './StandardNavigation';
export { StandardHeader } from './StandardHeader';
export { StandardFooter } from './StandardFooter';

// Page structure components
export { PageContainer } from './PageContainer';
export { PageHeader } from './PageHeader';
export { PageContent } from './PageContent';

/**
 * 🚨 IMPORTANT: Use UniversalLayout for ALL new pages
 * 
 * ✅ Correct usage:
 * import { UniversalLayout, LayoutEnforcer } from '@/components/layout';
 * 
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
 * - "standard" - Public pages (default)
 * - "admin" - Admin dashboard pages  
 * - "minimal" - Login, error pages
 */ 