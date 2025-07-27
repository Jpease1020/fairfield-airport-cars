import React from 'react';
import { CMSConfiguration, PageContent } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/layout/structure/PageHeader';
import { PageContent as LayoutPageContent } from '@/components/ui/layout/PageContent';
import { Container, H1, H2, Lead } from '@/components/ui/design-system';

interface CMSStandardPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  variant?: 'standard' | 'marketing' | 'portal' | 'admin';
  showHeader?: boolean;
  headerAlign?: 'left' | 'center' | 'right';
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  isEditable?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const CMSStandardPage: React.FC<CMSStandardPageProps> = ({
  cmsConfig,
  pageType,
  children,
  variant = 'standard',
  showHeader = true,
  headerAlign = 'left',
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
  
  // Check if this page has standard title/subtitle/description properties
  const hasStandardProps = pageContent && (
    'title' in pageContent || 
    'subtitle' in pageContent || 
    'description' in pageContent
  );
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant={variant}
      className={className}
    >
      <Container maxWidth={containerMaxWidth} padding="lg">
        {showHeader && hasStandardProps && (
          <PageHeader align={headerAlign} padding="lg" margin="none">
            {'title' in pageContent && pageContent.title && (
              <H1 >
                {pageContent.title}
              </H1>
            )}
            {'subtitle' in pageContent && pageContent.subtitle && (
              <H2 >
                {pageContent.subtitle}
              </H2>
            )}
            {'description' in pageContent && pageContent.description && (
              <Lead >
                {pageContent.description}
              </Lead>
            )}
          </PageHeader>
        )}
        
        <LayoutPageContent padding="lg" margin="none">
          {children}
        </LayoutPageContent>
      </Container>
    </CMSLayout>
  );
};

CMSStandardPage.displayName = 'CMSStandardPage'; 