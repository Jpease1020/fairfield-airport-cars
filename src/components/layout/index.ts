// 🎯 UNIFIED LAYOUT SYSTEM - THE SINGLE SYSTEM FOR ALL PAGES
export { UnifiedLayout } from './core/UnifiedLayout';

// Legacy components - use UnifiedLayout instead
export { UniversalLayout } from './core/UniversalLayout';
export { StandardLayout } from './core/StandardLayout';

// Navigation components
export { default as Navigation } from './navigation/Navigation';
export { StandardNavigation } from './navigation/StandardNavigation';

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
 * - "standard" - Public customer pages
 * - "admin" - Admin dashboard pages
 * - "minimal" - Login, error pages
 * - "marketing" - Homepage, about page
 * - "content" - Help, terms, privacy
 * - "status" - Booking status, success pages
 */