import React from 'react';
import { CMSConfiguration, HomePageContent } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/layout/structure/PageHeader';
import { PageContent } from '@/components/ui/layout/PageContent';
import { Container, Section, H1, H2, Lead } from '@/lib/design-system/components';

interface CMSMarketingPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  showHero?: boolean;
  heroVariant?: 'default' | 'brand' | 'alternate' | 'muted';
  headerAlign?: 'left' | 'center' | 'right';
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  isEditable?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const CMSMarketingPage: React.FC<CMSMarketingPageProps> = ({
  cmsConfig,
  pageType,
  children,
  showHero = true,
  heroVariant = 'brand',
  headerAlign = 'center',
  containerMaxWidth = 'xl',
  className,
  isEditable = false,
  onFieldChange
}) => {
  const pageContent = cmsConfig.pages[pageType];
  
  const handleFieldChange = (field: string, value: string) => {
    if (onFieldChange) {
      onFieldChange(field, value);
    }
  };
  
  // Check if this is a HomePageContent with hero section
  const hasHero = pageType === 'home' && pageContent && 'hero' in pageContent;
  const homeContent = hasHero ? pageContent as HomePageContent : null;
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant="marketing"
      className={className}
    >
      {/* Hero Section */}
      {showHero && hasHero && homeContent && (
        <Section variant={heroVariant} padding="xl">
          <Container maxWidth={containerMaxWidth}>
            <PageHeader align={headerAlign} padding="none" margin="none">
              {homeContent.hero?.title && (
                <H1>
                  {homeContent.hero.title}
                </H1>
              )}
              {homeContent.hero?.subtitle && (
                <H2 >
                  {homeContent.hero.subtitle}
                </H2>
              )}
              {homeContent.hero?.ctaText && (
                <Lead>
                  {homeContent.hero.ctaText}
                </Lead>
              )}
            </PageHeader>
          </Container>
        </Section>
      )}
      
      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <PageContent padding="none" margin="none">
            {children}
          </PageContent>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSMarketingPage.displayName = 'CMSMarketingPage'; 