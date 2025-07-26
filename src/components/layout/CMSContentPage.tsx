import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { PageContent } from '@/components/ui/layout/PageContent';
import { Container, Section, H1, H2, H3, Lead, Card, CardContent, Grid } from '@/components/ui/design-system';

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
  className?: string;
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

  // Get page-specific content
  const pageTitle = title || (pageContent && 'title' in pageContent ? pageContent.title : '');
  const pageSubtitle = subtitle || (pageContent && 'subtitle' in pageContent ? pageContent.subtitle : '');
  const pageDescription = description || (pageContent && 'description' in pageContent ? pageContent.description : '');
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant="content"
      className={className}
    >
      {/* Hero Section */}
      <Section variant="muted" padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <PageHeader align="center" padding="lg" margin="none">
            {pageTitle && (
              <H1 className="mb-4">
                {pageTitle}
              </H1>
            )}
            {pageSubtitle && (
              <H2 className="mb-4">
                {pageSubtitle}
              </H2>
            )}
            {pageDescription && (
              <Lead className="mb-8">
                {pageDescription}
              </Lead>
            )}
          </PageHeader>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            {showTableOfContents && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card variant="outlined" padding="lg">
                    <CardContent>
                      <H3 className="mb-4">On This Page</H3>
                      <nav className="space-y-2">
                        <a href="#overview" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                          Overview
                        </a>
                        <a href="#details" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                          Details
                        </a>
                        <a href="#contact" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                          Contact
                        </a>
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={showTableOfContents ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div className="prose prose-lg max-w-none">
                {children}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Related Links Section */}
      {showRelatedLinks && (
        <Section variant="muted" padding="xl">
          <Container maxWidth={containerMaxWidth}>
            <div className="text-center mb-8">
              <H2>Related Information</H2>
              <Lead>Find more helpful resources and information</Lead>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="outlined" padding="lg">
                <CardContent>
                  <H3 className="mb-3">Booking Information</H3>
                  <p className="text-sm text-text-secondary mb-4">
                    Learn about our booking process, policies, and what to expect.
                  </p>
                  <a href="/book" className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium">
                    Book Your Ride →
                  </a>
                </CardContent>
              </Card>
              
              <Card variant="outlined" padding="lg">
                <CardContent>
                  <H3 className="mb-3">Service Areas</H3>
                  <p className="text-sm text-text-secondary mb-4">
                    See all the airports and areas we serve in the region.
                  </p>
                  <a href="/about" className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium">
                    View Service Areas →
                  </a>
                </CardContent>
              </Card>
              
              <Card variant="outlined" padding="lg">
                <CardContent>
                  <H3 className="mb-3">Contact Support</H3>
                  <p className="text-sm text-text-secondary mb-4">
                    Need help? Our support team is available 24/7.
                  </p>
                  <a href="/help" className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium">
                    Get Help →
                  </a>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      )}
    </CMSLayout>
  );
};

CMSContentPage.displayName = 'CMSContentPage'; 