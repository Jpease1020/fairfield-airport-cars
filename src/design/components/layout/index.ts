// Layout Components - High-level structural components
// Importing from old locations to preserve functionality

// Navigation Components
export { Navigation } from './Navigation';
export type { NavigationProps, NavigationLink } from './Navigation';

// Admin Navigation Components
export { AdminNavigation } from './AdminNavigation';

// Customer Navigation Components
export { CustomerNavigation } from './CustomerNavigation';

// Footer Components  
export { Footer } from './Footer';
export type { FooterProps, FooterSection, FooterLink, SocialLink } from './Footer';

// Customer Footer Components
export { CustomerFooter } from './CustomerFooter';

// Page Layout Components
export { PageLayout } from './PageLayout';
export type { PageLayoutProps } from './PageLayout';

// Standard Layout Components
export { StandardLayout } from './StandardLayout';

// Marketing Layout Components
export { HeroSection } from './HeroSection';
export { ContactSection } from './ContactSection';
export { FAQ } from './FAQ';
export { FeatureGrid } from './FeatureGrid';

// Page Header Components
export { PageHeader } from './PageHeader';

// Page Wrapper Components
export { AdminPageWrapper } from './PageWrapper';

// Page Templates
export { 
  createContentPageTemplate,
  createConversionPageTemplate,
  createStatusPageTemplate,
  createSection,
  createStatsSection,
  createContactSection,
  createFAQSection,
  createFeaturesSection,
  createAboutPage,
  createHelpPage
} from '../../patterns/page-templates'; 