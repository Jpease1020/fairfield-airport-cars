import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from '@/components/ui/layout/CMSLayout';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Section, Container, H1, H2, Lead, Button } from '@/components/ui';
import { Card } from '@/components/ui/containers';
import { CardBody } from '@/components/ui/card';
import { Stack } from '@/components/ui/containers';
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
    variant?: 'primary' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    text: string;
    href: string;
    variant?: 'primary' | 'outline' | 'secondary';
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
          <Stack align="center" spacing="lg">
            {/* Status Icon */}
            {showStatusIcon && (
              <Container>
                <StatusIcon />
              </Container>
            )}

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

            {/* Action Buttons */}
            {showActionButtons && (primaryAction || secondaryAction) && (
              <Stack direction="horizontal" spacing="md">
                {primaryAction && (
                  <a href={primaryAction.href}>
                    <Button 
                      size="lg"
                      variant={primaryAction.variant || 'primary'}
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
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <Card variant="elevated" padding="xl">
            <CardBody>
              {children}
            </CardBody>
          </Card>
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSStatusPage.displayName = 'CMSStatusPage'; 