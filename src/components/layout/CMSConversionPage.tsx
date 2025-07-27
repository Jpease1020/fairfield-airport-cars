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
  className?: string;
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
      variant="conversion"
      className={className}
    >
      {/* Progress Indicator */}
      {showProgressIndicator && (
        <Section variant="muted" padding="md">
          <Container maxWidth={containerMaxWidth}>
            <Stack direction="horizontal" align="center" spacing="sm">
              {Array.from({ length: totalSteps }, (_, index) => (
                <Container key={index}>
                  <Container>
                    {index + 1}
                  </Container>
                  {index < totalSteps - 1 && (
                    <Container>
                      <span>-</span>
                    </Container>
                  )}
                </Container>
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
            <Container>
              <Card variant="elevated" padding="xl">
                <CardBody>
                  {children}
                </CardBody>
              </Card>
            </Container>

            {/* Trust Signals Sidebar */}
            {showTrustSignals && (
              <Stack spacing="lg">
                <Card variant="outlined" padding="lg">
                  <CardBody>
                    <H2>Why Choose Us?</H2>
                    <Stack spacing="md">
                      <Stack direction="horizontal" align="center" spacing="sm">
                        <Container>
                          <Span>✓</Span>
                        </Container>
                        <Container>
                          <Text>Professional Drivers</Text>
                          <Text size="sm">Background checked & licensed</Text>
                        </Container>
                      </Stack>
                      <Stack direction="horizontal" align="center" spacing="sm">
                        <Container>
                          <Span>✓</Span>
                        </Container>
                        <Container>
                          <Text>Reliable Service</Text>
                          <Text size="sm">On-time pickups guaranteed</Text>
                        </Container>
                      </Stack>
                      <Stack direction="horizontal" align="center" spacing="sm">
                        <Container>
                          <Span>✓</Span>
                        </Container>
                        <Container>
                          <Text>Clean Vehicles</Text>
                          <Text size="sm">Well-maintained luxury SUVs</Text>
                        </Container>
                      </Stack>
                    </Stack>
                  </CardBody>
                </Card>

                <Card variant="outlined" padding="lg">
                  <CardBody>
                    <H2>Need Help?</H2>
                    <Text>
                      Our team is here to assist you with your booking.
                    </Text>
                    <Stack spacing="sm">
                      <Text>
                        <Span>Phone:</Span> (203) 555-0123
                      </Text>
                      <Text>
                        <Span>Email:</Span> info@fairfieldairportcar.com
                      </Text>
                      <Text>
                        <Span>Hours:</Span> 24/7 Service
                      </Text>
                    </Stack>
                  </CardBody>
                </Card>
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSConversionPage.displayName = 'CMSConversionPage'; 