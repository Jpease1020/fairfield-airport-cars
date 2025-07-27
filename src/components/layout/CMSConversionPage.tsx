import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Section, Container, H1, H2, Lead } from '@/components/ui';
import { Card } from '@/components/ui/containers';
import { CardBody } from '@/components/ui/card';
import { Stack } from '@/components/ui/containers';
import { Text, Span } from '@/components/ui';

interface CMSConversionPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showTrustSignals?: boolean;
  showProgressIndicator?: boolean;
  currentStep?: number;
  totalSteps?: number;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'compact' | 'focused';
  isEditable?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const CMSConversionPage: React.FC<CMSConversionPageProps> = ({
  cmsConfig,
  pageType,
  children,
  title,
  subtitle,
  description,
  showTrustSignals = true,
  showProgressIndicator = false,
  currentStep = 1,
  totalSteps = 3,
  containerMaxWidth = 'lg',
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
      variant={variant === 'focused' ? 'focused' : 'conversion'}
    >
      {/* Progress Indicator */}
      {showProgressIndicator && (
        <Section variant="muted" padding="md">
          <Container maxWidth={containerMaxWidth}>
            <Stack direction="horizontal" align="center" spacing="sm">
              {Array.from({ length: totalSteps }, (_, index) => (
                <React.Fragment key={index}>
                  <Span>
                    {index + 1}
                  </Span>
                  {index < totalSteps - 1 && (
                    <Span>→</Span>
                  )}
                </React.Fragment>
              ))}
            </Stack>
          </Container>
        </Section>
      )}

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          {/* Header */}
          <PageHeader align="center" padding="lg" margin="none">
            {pageTitle && (
              <H1>
                {pageTitle}
              </H1>
            )}
            {pageSubtitle && (
              <H2>
                {pageSubtitle}
              </H2>
            )}
            {pageDescription && (
              <Lead>
                {pageDescription}
              </Lead>
            )}
          </PageHeader>

          {/* Conversion Content */}
          <Stack direction="horizontal" spacing="lg">
            {/* Main Form/Content */}
            <Container padding="xl" variant="elevated">
              {children}
            </Container>

            {/* Trust Signals Sidebar */}
            {showTrustSignals && (
              <Container spacing="lg">
                <H2>Why Choose Us?</H2>
                <Stack spacing="md">
                  <Stack direction="horizontal" align="center" spacing="sm">
                    <Span>✓</Span>
                    <Stack>
                      <Text>Professional Drivers</Text>
                      <Text size="sm">Background checked & licensed</Text>
                    </Stack>
                  </Stack>
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <Span>✓</Span>
                      <Stack>
                        <Text>Reliable Service</Text>
                        <Text size="sm">On-time pickups guaranteed</Text>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <Span>✓</Span>
                      <Stack>
                        <Text>Clean Vehicles</Text>
                        <Text size="sm">Well-maintained luxury SUVs</Text>
                      </Stack>
                    </Stack>
                </Stack>
              </Container>

                <Container>
                  <H2>Need Help?</H2>
                  <Text>
                    Our team is here to assist you with your booking.
                  </Text>
                  <Container spacing="sm">
                    <Text>
                      <Span>Phone:</Span> (203) 555-0123
                    </Text>
                    <Text>
                      <Span>Email:</Span> info@fairfieldairportcar.com
                    </Text>
                    <Text>
                      <Span>Hours:</Span> 24/7 Service
                    </Text>
                  </Container>
                </Container>
              </Container>
            )}
          </Stack>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSConversionPage.displayName = 'CMSConversionPage'; 