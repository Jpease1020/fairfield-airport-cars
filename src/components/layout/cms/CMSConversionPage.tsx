import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from '@/components/layout/structure/PageHeader';
import { Section, Container, H1, H2, EditableText } from '@/components/ui';
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
  totalSteps?: number;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'compact' | 'focused';
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
  totalSteps = 3,
  containerMaxWidth = 'lg',
  variant = 'default'
}) => {
  const pageContent = cmsConfig.pages[pageType];

  // Get page-specific content
  const pageTitle = title || (pageContent && 'title' in pageContent ? pageContent.title : '');
  const pageSubtitle = subtitle || (pageContent && 'subtitle' in pageContent ? pageContent.subtitle : '');
  const pageDescription = description || (pageContent && 'description' in pageContent ? pageContent.description : '');
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant={variant === 'focused' ? 'conversion' : 'conversion'}
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
              <Text>
                {pageDescription}
              </Text>
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
                <H2>
                  <EditableText field="cmsConversionPage.whyChooseUs" defaultValue="Why Choose Us?">
                    Why Choose Us?
                  </EditableText>
                </H2>
                <Container spacing="md">
                  <Stack direction="horizontal" align="center" spacing="sm">
                    <Span>✓</Span>
                    <Text>
                      <EditableText field="cmsConversionPage.professionalDrivers" defaultValue="Professional Drivers">
                        Professional Drivers
                      </EditableText>
                    </Text>
                    <Text size="sm">
                      <EditableText field="cmsConversionPage.professionalDriversDescription" defaultValue="Background checked & licensed">
                        Background checked & licensed
                      </EditableText>
                    </Text>
                  </Stack>
                  <Stack direction="horizontal" align="center" spacing="sm">
                    <Span>✓</Span>
                    <Text>
                      <EditableText field="cmsConversionPage.reliableService" defaultValue="Reliable Service">
                        Reliable Service
                      </EditableText>
                    </Text>
                    <Text size="sm">
                      <EditableText field="cmsConversionPage.reliableServiceDescription" defaultValue="On-time pickups guaranteed">
                        On-time pickups guaranteed
                      </EditableText>
                    </Text>
                  </Stack>
                  <Stack direction="horizontal" align="center" spacing="sm">
                    <Span>✓</Span>
                    <Text>
                      <EditableText field="cmsConversionPage.cleanVehicles" defaultValue="Clean Vehicles">
                        Clean Vehicles
                      </EditableText>
                    </Text>
                    <Text size="sm">
                      <EditableText field="cmsConversionPage.cleanVehiclesDescription" defaultValue="Well-maintained luxury SUVs">
                        Well-maintained luxury SUVs
                      </EditableText>
                    </Text>
                  </Stack>
                </Container>
              </Container>
            )}

            {/* Help Section */}
            {showTrustSignals && (
              <Container>
                <H2>
                  <EditableText field="cmsConversionPage.needHelp" defaultValue="Need Help?">
                    Need Help?
                  </EditableText>
                </H2>
                <Text>
                  <EditableText field="cmsConversionPage.needHelpDescription" defaultValue="Our team is here to assist you with your booking.">
                    Our team is here to assist you with your booking.
                  </EditableText>
                </Text>
                <Container spacing="sm">
                  <Text>
                    <Span>
                      <EditableText field="cmsConversionPage.phoneLabel" defaultValue="Phone:">
                        Phone:
                      </EditableText>
                    </Span> (203) 555-0123
                  </Text>
                  <Text>
                    <Span>
                      <EditableText field="cmsConversionPage.emailLabel" defaultValue="Email:">
                        Email:
                      </EditableText>
                    </Span> info@fairfieldairportcar.com
                  </Text>
                  <Text>
                    <Span>
                      <EditableText field="cmsConversionPage.hoursLabel" defaultValue="Hours:">
                        Hours:
                      </EditableText>
                    </Span> 
                    <EditableText field="cmsConversionPage.hoursValue" defaultValue="24/7 Service">
                      24/7 Service
                    </EditableText>
                  </Text>
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