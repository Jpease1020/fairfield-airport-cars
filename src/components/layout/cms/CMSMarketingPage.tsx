import React from 'react';
import { CMSConfiguration, HomePageContent } from '@/types/cms';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from '../structure/PageHeader';
import { Container, Section, H1, H2 } from '@/components/ui';
import { Text } from '@/components/ui/text';

interface CMSMarketingPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  showHero?: boolean;
  heroVariant?: 'default' | 'brand' | 'alternate' | 'muted';
  headerAlign?: 'left' | 'center' | 'right';
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const CMSMarketingPage: React.FC<CMSMarketingPageProps> = ({
  cmsConfig,
  pageType,
  children,
  showHero = true,
  heroVariant = 'brand',
  headerAlign = 'center',
  containerMaxWidth = 'xl'
}) => {
  const pageContent = cmsConfig.pages[pageType];
  
  // Check if this is a HomePageContent with hero section
  const hasHero = pageType === 'home' && pageContent && 'hero' in pageContent;
  const homeContent = hasHero ? pageContent as HomePageContent : null;
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant="marketing"
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
                <Text>
                  {homeContent.hero.ctaText}
                </Text>
              )}
            </PageHeader>
          </Container>
        </Section>
      )}
      
      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          {children}
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSMarketingPage.displayName = 'CMSMarketingPage'; 