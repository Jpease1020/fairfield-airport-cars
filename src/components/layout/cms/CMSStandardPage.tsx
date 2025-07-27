import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from '../structure/PageHeader';
import { Container, H1, H2 } from '@/components/ui';
import { Text } from '@/components/ui/text';

interface CMSStandardPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  variant?: 'standard' | 'marketing' | 'portal' | 'admin';
  showHeader?: boolean;
  headerAlign?: 'left' | 'center' | 'right';
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const CMSStandardPage: React.FC<CMSStandardPageProps> = ({
  cmsConfig,
  pageType,
  children,
  variant = 'standard',
  showHeader = true,
  headerAlign = 'left',
  containerMaxWidth = 'xl',
  className
}) => {
  const pageContent = cmsConfig.pages[pageType];
  
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
              <Text >
                {pageContent.description}
              </Text>
            )}
          </PageHeader>
        )}
        
        {children}
      </Container>
    </CMSLayout>
  );
};

CMSStandardPage.displayName = 'CMSStandardPage'; 