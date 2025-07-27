import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Section, Container, H1, H2, Lead } from '@/components/ui';
import { Card } from '@/components/ui/containers';
import { CardBody } from '@/components/ui/card';

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
            <div className="">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div key={index} className="">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index + 1 <= currentStep 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-bg-secondary text-text-secondary'
                    }
                  `}>
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-2
                      ${index + 1 < currentStep ? 'bg-brand-primary' : 'bg-border-primary'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          {/* Header */}
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

          {/* Conversion Content */}
          <div className="">
            {/* Main Form/Content */}
            <div className="">
              <Card variant="elevated" padding="xl">
                <CardBody>
                  {children}
                </CardBody>
              </Card>
            </div>

            {/* Trust Signals Sidebar */}
            {showTrustSignals && (
              <div className="">
                <Card variant="outlined" padding="lg">
                  <CardBody>
                    <H2 className="">Why Choose Us?</H2>
                    <div className="">
                      <div className="">
                        <div className="">
                          <span className="">✓</span>
                        </div>
                        <div>
                          <p className="">Professional Drivers</p>
                          <p className="">Background checked & licensed</p>
                        </div>
                      </div>
                      <div className="">
                        <div className="">
                          <span className="">✓</span>
                        </div>
                        <div>
                          <p className="">Reliable Service</p>
                          <p className="">On-time pickups guaranteed</p>
                        </div>
                      </div>
                      <div className="">
                        <div className="">
                          <span className="">✓</span>
                        </div>
                        <div>
                          <p className="">Clean Vehicles</p>
                          <p className="">Well-maintained luxury SUVs</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card variant="outlined" padding="lg">
                  <CardBody>
                    <H2 className="">Need Help?</H2>
                    <p className="">
                      Our team is here to assist you with your booking.
                    </p>
                    <div className="space-y-2">
                      <p className="">
                        <span className="">Phone:</span> (203) 555-0123
                      </p>
                      <p className="">
                        <span className="">Email:</span> info@fairfieldairportcar.com
                      </p>
                      <p className="">
                        <span className="">Hours:</span> 24/7 Service
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSConversionPage.displayName = 'CMSConversionPage'; 