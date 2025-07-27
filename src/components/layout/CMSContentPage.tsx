import React from 'react';
import { Container, Span, H2, H3, Lead, Link } from '@/components/ui';
import { Section, Stack } from '@/components/ui/containers';
import { Card, CardBody } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from './PageHeader';
import { CMSConfiguration } from '@/types/cms';

interface CMSContentPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showTableOfContents?: boolean;
  showRelatedLinks?: boolean;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'compact' | 'wide';
  isEditable?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const CMSContentPage: React.FC<CMSContentPageProps> = ({
  cmsConfig,
  pageType,
  children,
  title,
  subtitle,
  description,
  showTableOfContents = false,
  showRelatedLinks = false,
  containerMaxWidth = 'xl',
  variant = 'default',
  isEditable = false,
  onFieldChange
}) => {
  const pageContent = cmsConfig.pages[pageType];
  
  const handleFieldChange = (field: string, value: string) => {
    if (onFieldChange) {
      onFieldChange(field, value);
    }
  };

  // Get page-specific content
  const pageTitle = title || (pageContent && 'title' in pageContent ? pageContent.title : '');
  const pageSubtitle = subtitle || (pageContent && 'subtitle' in pageContent ? pageContent.subtitle : '');
  const pageDescription = description || (pageContent && 'description' in pageContent ? pageContent.description : '');
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant={variant === 'wide' ? 'wide' : 'content'}
    >
      {/* Header Section */}
      <Section variant="default" padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <PageHeader title={pageTitle || "Page Header"}>
            {pageSubtitle && (
              <Lead>
                {pageSubtitle}
              </Lead>
            )}
            {pageDescription && (
              <Lead>
                {pageDescription}
              </Lead>
            )}
          </PageHeader>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <Stack direction="horizontal" spacing="xl">
            {/* Table of Contents */}
            {showTableOfContents && (
              <Container>
                <H3>On This Page</H3>
                <Stack spacing="sm" direction="vertical">
                  <Link href="#overview">Overview</Link>
                  <Link href="#details">Details</Link>
                  <Link href="#contact">Contact</Link>
                </Stack>
              </Container>
            )}

            {/* Main Content */}
            <Container>
              {children}
            </Container>
          </Stack>
        </Container>
      </Section>

      {/* Related Links Section */}
      {showRelatedLinks && (
        <Section variant="muted" padding="xl">
          <Container maxWidth={containerMaxWidth} spacing="lg">
              <H2>Related Information</H2>
              <Lead>Find more helpful resources and information</Lead>
              
              <Stack direction="horizontal" spacing="lg">
                <Container>
                  <H3>Booking Information</H3>
                  <Text>
                    Learn about our booking process, policies, and what to expect.
                  </Text>
                  <Link href="/book">
                    Book Your Ride →
                  </Link>
                </Container>
                
                <Container>
                  <H3>Service Areas</H3>
                  <Text>
                    See all the airports and areas we serve in the region.
                  </Text>
                  <Link href="/about">
                    View Service Areas →
                  </Link>
                </Container>
                
                <Container>
                  <H3>Contact Support</H3>
                  <Text>
                    Need help? Our support team is available 24/7.
                  </Text>
                  <Link href="/help">
                    Get Help →
                  </Link>
                </Container>
              </Stack>
            </Container>
        </Section>
      )}
    </CMSLayout>
  );
};

CMSContentPage.displayName = 'CMSContentPage'; 