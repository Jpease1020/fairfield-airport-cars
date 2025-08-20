'use client';

import React, { useState, useEffect } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';

import { 
  GridSection, 
  Box, 
  ActionGrid,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  Container,
  Text,
  Stack
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

function CMSPageContent() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { cmsData } = useCMSData();
  useEffect(() => {
    loadCMSConfig();
  }, []);

  const loadCMSConfig = async () => {
    try {
      setError(null);
      setLoading(true);      
      const cmsConfig = await cmsService.getCMSConfiguration();
      setConfig(cmsConfig);
      if (cmsConfig && cmsConfig.lastUpdated) {
        setLastUpdated(cmsConfig.lastUpdated);
      }
    } catch (err) {
      console.error('❌ Error loading CMS config:', err);
      setError('Failed to load CMS configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const updateAdminCMSData = async () => {
    try {
      setLoading(true);
      addToast('info', 'Updating admin CMS data...');
      
      const response = await fetch('/api/admin/cms/update-admin-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        addToast('success', `Admin CMS data updated successfully! ${result.updatedSections} sections updated.`);
        // Reload the config to show updated data
        await loadCMSConfig();
      } else {
        addToast('error', `Failed to update admin CMS data: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating admin CMS data:', error);
      addToast('error', 'Failed to update admin CMS data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh',
      onClick: loadCMSConfig,
      variant: 'outline' as const,
      icon: '🔄'
    },
    {
      label: 'Update Admin CMS Data',
      onClick: updateAdminCMSData,
      variant: 'primary' as const,
      icon: '⚡'
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
    <>
      {/* CMS Sections Grid */}
      <GridSection variant="content" columns={3}>
        {cmsSections.map((section) => (
          <Box
            key={section.id}
            variant="elevated"
            padding="lg"
          >
            <Stack spacing="md">
              <Stack direction="horizontal" align="center" justify="space-between">
                              <Text variant="lead" size="md" weight="semibold">
                {section.icon} {section.title}
              </Text>
                <Text variant="muted" size="sm">
                  {section.status}
                </Text>
              </Stack>
              
              <Text variant="body" size="sm">
                {section.description}
              </Text>
              
              <Stack direction="horizontal" align="center" justify="space-between">
                <Text>
                  {getCMSField(cmsData, 'admin.cms.statusLabel', 'Status:')}
                </Text>
                <Text>
                  {section.status}
                </Text>
                
                <ActionButtonGroup
                  buttons={[{
                    id: `manage-${section.title.toLowerCase()}`,
                    label: `Manage ${section.title}`,
                    onClick: () => window.location.href = section.href,
                    variant: 'outline' as const,
                    icon: section.icon
                  }]}
                />
              </Stack>
            </Stack>
          </Box>
        ))}
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text variant="lead" size="md" weight="semibold">
              ⚡ Quick Actions
            </Text>
            <Text variant="muted" size="sm">
              Common CMS management and maintenance tasks
            </Text>
            <ActionGrid actions={quickActions} columns={4} />
          </Stack>
        </Box>
      </GridSection>

      {/* Last Updated Info */}
      {lastUpdated && (
        <GridSection variant="content" columns={1}>
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text variant="lead" size="md" weight="semibold">
                🕒 Configuration Status
              </Text>
              <Text variant="muted" size="sm">
                CMS configuration and update information
              </Text>
              
              <Stack spacing="md">
                <Stack direction="horizontal" align="center" justify="space-between">
                  <Text>
                    {getCMSField(cmsData, 'admin.cms.lastUpdatedLabel', 'Last Updated')}
                  </Text>
                  <Text>
                    {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                  </Text>
                </Stack>
                
                <Stack direction="horizontal" align="center" justify="space-between">
                  <Container>
                    <Text>
                      {getCMSField(cmsData, 'admin.cms.configurationStatusLabel', 'Configuration Status')}
                    </Text>
                    <Text>
                      {config ? 'Fully Configured' : 'Needs Setup'}
                    </Text>
                  </Container>
                </Stack>
                
                <Stack direction="horizontal" align="center" justify="space-between">
                  <Container>
                    <Text>
                      {getCMSField(cmsData, 'admin.cms.autoSaveLabel', 'Auto-Save')}
                    </Text>
                    <Text>
                      Enabled
                    </Text>
                  </Container>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </GridSection>
      )}
    </>
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
