import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { PageContent } from '@/components/ui/layout/PageContent';
import { Card, CardContent } from '@/components/ui';

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
            <div className="flex items-center justify-center space-x-4">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div key={index} className="flex items-center">
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

          {/* Conversion Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form/Content */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="xl">
                <CardContent>
                  {children}
                </CardContent>
              </Card>
            </div>

            {/* Trust Signals Sidebar */}
            {showTrustSignals && (
              <div className="space-y-6">
                <Card variant="outlined" padding="lg">
                  <CardContent>
                    <H2 className="text-lg mb-4">Why Choose Us?</H2>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-success-base rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Professional Drivers</p>
                          <p className="text-xs text-text-secondary">Background checked & licensed</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-success-base rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Reliable Service</p>
                          <p className="text-xs text-text-secondary">On-time pickups guaranteed</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-success-base rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Clean Vehicles</p>
                          <p className="text-xs text-text-secondary">Well-maintained luxury SUVs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="outlined" padding="lg">
                  <CardContent>
                    <H2 className="text-lg mb-4">Need Help?</H2>
                    <p className="text-sm text-text-secondary mb-4">
                      Our team is here to assist you with your booking.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> (203) 555-0123
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> info@fairfieldairportcar.com
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Hours:</span> 24/7 Service
                      </p>
                    </div>
                  </CardContent>
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