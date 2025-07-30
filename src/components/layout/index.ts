// 🎯 UNIFIED LAYOUT SYSTEM - THE SINGLE SYSTEM FOR ALL PAGES
export { UnifiedLayout } from './core/UnifiedLayout';

// Legacy components removed - use UnifiedLayout instead

// Navigation components
export { default as Navigation } from './navigation/Navigation';
export { StandardNavigation } from './structure/StandardNavigation';

// Structure components
export { PageContainer } from './structure/PageContainer';
export { PageHeader } from './structure/PageHeader';
export { PageContent } from './structure/PageContent';
export { StandardFooter } from './structure/StandardFooter';
export { StandardHeader } from './structure/StandardHeader';

// CMS Layout components
export { CMSContentPage } from './cms/CMSContentPage';
export { CMSConversionPage } from './cms/CMSConversionPage';
export { CMSMarketingPage } from './cms/CMSMarketingPage';
export { CMSStandardPage } from './cms/CMSStandardPage';
export { CMSStatusPage } from './cms/CMSStatusPage';
export { CMSLayout } from './cms/CMSLayout';

/**
 * 🚨 IMPORTANT: Use UnifiedLayout for ALL pages
 * 
 * ✅ CORRECT - The Single System:
 * import { UnifiedLayout } from '@/components/layout';
 * 
 * Layout Types for Different Pages:
 * - "marketing" - Homepage, about page (blue hero sections)
 * - "admin" - Admin dashboard pages
 * - "content" - Help, terms, privacy pages
 * - "status" - Booking status, success pages
 */