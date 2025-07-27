'use client';

import { useState, useEffect } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';

import { 
  AdminPageWrapper,
  GridSection, 
  InfoCard, 
  ActionGrid,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  Container,
  Text,
  Span
} from '@/components/ui';
import { Stack } from '@/components/ui/containers';

function CMSPageContent() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadCMSConfig();
  }, []);

  const loadCMSConfig = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('⚙️ Loading CMS configuration...');
      
      const cmsConfig = await cmsService.getCMSConfiguration();
      setConfig(cmsConfig);
      if (cmsConfig) {
        setLastUpdated(cmsConfig.lastUpdated);
      }
      
      console.log('✅ CMS configuration loaded');
    } catch (err) {
      console.error('❌ Error loading CMS config:', err);
      setError('Failed to load CMS configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCMS = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing CMS...');
      
      const response = await fetch('/api/admin/init-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadCMSConfig();
        addToast('success', 'CMS initialized successfully!');
        console.log('✅ CMS initialized successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Error initializing CMS:', err);
      addToast('error', 'Failed to initialize CMS: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadCMSConfig, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Config', 
      onClick: () => addToast('info', 'Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Initialize CMS', 
      onClick: handleInitializeCMS, 
      variant: 'primary' as const,
      disabled: loading
    }
  ];

  const cmsSections = [
    {
      id: 'pages',
      title: 'Pages',
      description: 'Manage website pages and content',
      icon: '📄',
      href: '/admin/cms/pages',
      status: config?.pages ? 'Configured' : 'Not Set Up'
    },
    {
      id: 'business',
      title: 'Business Info',
      description: 'Company details and contact information',
      icon: '🏢',
      href: '/admin/cms/business',
      status: config?.business ? 'Configured' : 'Not Set Up'
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Service rates and pricing structure',
      icon: '💰',
      href: '/admin/cms/pricing',
      status: config?.pricing ? 'Configured' : 'Not Set Up'
    },
    {
      id: 'colors',
      title: 'Colors',
      description: 'Brand colors and design system',
      icon: '🎨',
      href: '/admin/cms/colors',
      status: config?.themeColors ? 'Configured' : 'Not Set Up'
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Email and SMS templates',
      icon: '📧',
      href: '/admin/cms/communication',
      status: config?.communication ? 'Configured' : 'Not Set Up'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Tracking and reporting settings',
      icon: '📊',
      href: '/admin/cms/analytics',
      status: config?.analytics ? 'Configured' : 'Not Set Up'
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: "🔄",
      label: "Sync Content",
      onClick: () => addToast('info', 'Content sync functionality coming soon')
    },
    {
      id: 2,
      icon: "📊",
      label: "Analytics",
      href: "/admin/cms/analytics"
    },
    {
      id: 3,
      icon: "🔧",
      label: "Backup",
      onClick: () => addToast('info', 'Backup functionality coming soon')
    },
    {
      id: 4,
      icon: "📤",
      label: "Export",
      onClick: () => addToast('info', 'Export functionality coming soon')
    }
  ];

  return (
    <AdminPageWrapper
      title="Content Management System"
      subtitle="Manage website content, branding, and configuration"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading CMS configuration..."
      errorTitle="CMS Load Error"
    >
      {/* CMS Sections Grid */}
      <GridSection variant="content" columns={3}>
        {cmsSections.map((section) => (
          <InfoCard
            key={section.id}
            title={`${section.icon} ${section.title}`}
            description={section.description}
          >
            <Container>
              <Stack direction="horizontal" align="center" justify="between">
                <Container>
                  <Text>
                    Status:
                  </Text>
                  <Text>
                    {section.status}
                  </Text>
                </Container>
                
                <ActionButtonGroup
                  buttons={[{
                    label: `Manage ${section.title}`,
                    onClick: () => window.location.href = section.href,
                    variant: 'outline' as const,
                    icon: section.icon
                  }]}
                />
              </Stack>
            </Container>
          </InfoCard>
        ))}
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="⚡ Quick Actions"
          description="Common CMS management and maintenance tasks"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>

      {/* Last Updated Info */}
      {lastUpdated && (
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🕒 Configuration Status"
            description="CMS configuration and update information"
          >
            <Stack spacing="md">
              <Stack direction="horizontal" align="center" justify="between">
                <Container>
                  <Text>
                    Last Updated
                  </Text>
                  <Text>
                    {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                  </Text>
                </Container>
              </Stack>
              
              <Stack direction="horizontal" align="center" justify="between">
                <Container>
                  <Text>
                    Configuration Status
                  </Text>
                  <Text>
                    {config ? 'Fully Configured' : 'Needs Setup'}
                  </Text>
                </Container>
              </Stack>
              
              <Stack direction="horizontal" align="center" justify="between">
                <Container>
                  <Text>
                    Auto-Save
                  </Text>
                  <Text>
                    Enabled
                  </Text>
                </Container>
              </Stack>
            </Stack>
          </InfoCard>
        </GridSection>
      )}
    </AdminPageWrapper>
  );
}

const CMSPage = () => {
  return (
    <ToastProvider>
      <CMSPageContent />
    </ToastProvider>
  );
};

export default CMSPage;
