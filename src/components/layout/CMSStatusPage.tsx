import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { PageContent } from '@/components/ui/layout/PageContent';
import { Card, CardContent, Button } from '@/components/ui';
import { CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';

interface CMSStatusPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  status?: 'success' | 'pending' | 'error' | 'info';
  title?: string;
  subtitle?: string;
  description?: string;
  showStatusIcon?: boolean;
  showActionButtons?: boolean;
  primaryAction?: {
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    text: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  isEditable?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

export const CMSStatusPage: React.FC<CMSStatusPageProps> = ({
  cmsConfig,
  pageType,
  children,
  status = 'info',
  title,
  subtitle,
  description,
  showStatusIcon = true,
  showActionButtons = true,
  primaryAction,
  secondaryAction,
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
  
  // Status configuration
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-success-base',
      bgColor: 'bg-success-light',
      borderColor: 'border-success-base'
    },
    pending: {
      icon: Clock,
      color: 'text-warning-base',
      bgColor: 'bg-warning-light',
      borderColor: 'border-warning-base'
    },
    error: {
      icon: AlertCircle,
      color: 'text-error-base',
      bgColor: 'bg-error-light',
      borderColor: 'border-error-base'
    },
    info: {
      icon: Info,
      color: 'text-info-base',
      bgColor: 'bg-info-light',
      borderColor: 'border-info-base'
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;
  
  return (
    <CMSLayout 
      cmsConfig={cmsConfig} 
      pageType={pageType} 
      variant="status"
      className={className}
    >
      {/* Status Section */}
      <Section variant="muted" padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <div className="">
            {/* Status Icon */}
            {showStatusIcon && (
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border-2 mb-6`}>
                <StatusIcon className={`w-8 h-8 ${currentStatus.color}`} />
              </div>
            )}

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

            {/* Action Buttons */}
            {showActionButtons && (primaryAction || secondaryAction) && (
              <div className="">
                {primaryAction && (
                  <a href={primaryAction.href}>
                    <Button 
                      size="lg"
                      variant={primaryAction.variant || 'default'}
                    >
                      {primaryAction.text}
                    </Button>
                  </a>
                )}
                {secondaryAction && (
                  <a href={secondaryAction.href}>
                    <Button 
                      size="lg"
                      variant={secondaryAction.variant || 'outline'}
                    >
                      {secondaryAction.text}
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <Card variant="elevated" padding="xl">
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSStatusPage.displayName = 'CMSStatusPage'; 