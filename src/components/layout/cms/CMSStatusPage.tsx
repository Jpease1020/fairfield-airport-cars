import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from '../structure/PageHeader';
import { Section, Container, H1, H2, Button } from '@/components/ui';

import { Stack } from '@/components/ui/layout/containers';
import { Text, Link } from '@/components/ui/text';
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
  containerMaxWidth = 'lg'
}) => {
  const pageContent = cmsConfig.pages[pageType];

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
      variant="status"
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
            <PageHeader padding="lg" margin="none">
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

            {/* Action Buttons */}
            {showActionButtons && (primaryAction || secondaryAction) && (
              <Stack direction="horizontal" spacing="md">
                {primaryAction && (
                  <Link href={primaryAction.href}>
                    <Button 
                      size="lg"
                      variant={primaryAction.variant || 'primary'}
                    >
                      {primaryAction.text}
                    </Button>
                  </Link>
                )}
                {secondaryAction && (
                  <Link href={secondaryAction.href}>
                    <Button 
                      size="lg"
                      variant={secondaryAction.variant || 'outline'}
                    >
                      {secondaryAction.text}
                    </Button>
                  </Link>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth} variant="elevated" padding="xl">
          {children}
        </Container>
      </Section>
    </CMSLayout>
  );
};

CMSStatusPage.displayName = 'CMSStatusPage'; 