'use client';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Button, Box, Alert, LoadingSpinner } from '@/ui';
import { CostTrackingDashboard } from '@/components/business/CostTrackingDashboard';
import { costAPIIntegrationService } from '@/lib/services/cost-api-integration';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdminStatus } from '@/hooks/useAdminStatus';

export default function AdminCostsPage() {
  const { cmsData } = useCMSData();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [apiStatus, setApiStatus] = useState<any[]>([]);
  const [lastApiUpdate, setLastApiUpdate] = useState<Date | null>(null);
  const [updatingCosts, setUpdatingCosts] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load API provider status on mount
  useEffect(() => {
    if (isAdmin) {
      loadAPIProviderStatus();
    }
  }, [isAdmin]);

  const loadAPIProviderStatus = () => {
    const status = costAPIIntegrationService.getServiceProviderStatus();
    setApiStatus(status);
  };

  const handleRefreshCosts = async () => {
    try {
      setUpdatingCosts(true);
      setApiError(null);
      
      console.log('🔄 Refreshing costs from API providers...');
      await costAPIIntegrationService.updateCostsWithAPIData();
      
      setLastApiUpdate(new Date());
      loadAPIProviderStatus(); // Refresh provider status
      
      console.log('✅ Costs refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing costs:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to refresh costs');
    } finally {
      setUpdatingCosts(false);
    }
  };

  const handleClearCache = () => {
    costAPIIntegrationService.clearCache();
    loadAPIProviderStatus();
  };

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    costAPIIntegrationService.updateServiceProvider(providerId, enabled);
    loadAPIProviderStatus();
  };

  if (adminLoading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Checking admin status...</Text>
        </Stack>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Text variant="h3" color="secondary">Access Denied</Text>
          <Text color="secondary">You must be an admin to view this page.</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <Text variant="h2" weight="bold">
            {getCMSField(cmsData, 'admin-costs-title', 'Cost Management Dashboard')}
          </Text>
          <Text variant="muted" size="lg">
            {getCMSField(cmsData, 'admin-costs-description', 'Monitor and manage business costs with real-time API integrations')}
          </Text>
        </Stack>

        {/* API Integration Controls */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold" size="lg">
                🔌 API Integration Controls
              </Text>
              <Stack direction="horizontal" spacing="md">
                <Button
                  onClick={handleRefreshCosts}
                  disabled={updatingCosts}
                  variant="primary"
                  size="sm"
                >
                  {updatingCosts ? '🔄 Updating...' : '🔄 Refresh from APIs'}
                </Button>
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                >
                  🧹 Clear Cache
                </Button>
              </Stack>
            </Stack>

            {lastApiUpdate && (
              <Text variant="muted" size="sm">
                Last API update: {lastApiUpdate.toLocaleString()}
              </Text>
            )}

            {apiError && (
              <Alert variant="error">
                <Text>{apiError}</Text>
              </Alert>
            )}

            {/* Service Provider Status */}
            <Stack spacing="md">
              <Text weight="semibold">Service Provider Status</Text>
              <Stack spacing="sm">
                {apiStatus.map((provider) => (
                  <Box key={provider.id} variant="outlined" padding="md">
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="xs">
                        <Text weight="semibold">{provider.name}</Text>
                        <Text variant="muted" size="sm">
                          Status: {provider.enabled ? '✅ Enabled' : '❌ Disabled'}
                        </Text>
                        {provider.lastUpdate && (
                          <Text variant="muted" size="sm">
                            Last update: {provider.lastUpdate.toLocaleString()}
                          </Text>
                        )}
                      </Stack>
                      <Button
                        onClick={() => handleToggleProvider(provider.id, !provider.enabled)}
                        variant={provider.enabled ? 'outline' : 'primary'}
                        size="sm"
                      >
                        {provider.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Cost Tracking Dashboard */}
        <CostTrackingDashboard 
          onRefresh={handleRefreshCosts}
        />
      </Stack>
    </Container>
  );
}
