import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Section, Container, H1, H2, H3, Lead } from '@/components/ui';
import { Card } from '@/components/ui/containers';
import { CardBody } from '@/components/ui/card';

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
              <H1 className="">
                {pageTitle}
              </H1>
            )}
            {pageSubtitle && (
              <H2 className="mb-4">
                {pageSubtitle}
              </H2>
            )}
            {pageDescription && (
              <Lead className="">
                {pageDescription}
              </Lead>
            )}
          </PageHeader>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <div className="">
            {/* Table of Contents */}
            {showTableOfContents && (
              <div className="">
                <div className="">
                  <Card variant="outlined" padding="lg">
                    <CardBody>
                      <H3 className="">On This Page</H3>
                      <nav className="">
                        <a href="#overview" className="">
                          Overview
                        </a>
                        <a href="#details" className="">
                          Details
                        </a>
                        <a href="#contact" className="">
                          Contact
                        </a>
                      </nav>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={showTableOfContents ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div className="">
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
            <div className="">
              <H2>Related Information</H2>
              <Lead>Find more helpful resources and information</Lead>
            </div>
            
            <div className="">
              <Card variant="outlined" padding="lg">
                <CardBody>
                  <H3 className="mb-3">Booking Information</H3>
                  <p className="">
                    Learn about our booking process, policies, and what to expect.
                  </p>
                  <a href="/book" className="">
                    Book Your Ride →
                  </a>
                </CardBody>
              </Card>
              
              <Card variant="outlined" padding="lg">
                <CardBody>
                  <H3 className="">Service Areas</H3>
                  <p className="">
                    See all the airports and areas we serve in the region.
                  </p>
                  <a href="/about" className="">
                    View Service Areas →
                  </a>
                </CardBody>
              </Card>
              
              <Card variant="outlined" padding="lg">
                <CardBody>
                  <H3 className="">Contact Support</H3>
                  <p className="">
                    Need help? Our support team is available 24/7.
                  </p>
                  <a href="/help" className="">
                    Get Help →
                  </a>
                </CardBody>
              </Card>
            </div>
          </Container>
        </Section>
      )}
    </CMSLayout>
  );
};

CMSContentPage.displayName = 'CMSContentPage'; 