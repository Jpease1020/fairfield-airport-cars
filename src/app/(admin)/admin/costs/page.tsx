'use client';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Button, Box, Alert, LoadingSpinner } from '@/design/ui';
import { CostTrackingDashboard } from '@/components/business/CostTrackingDashboard';
import { useAdminStatus } from '@/hooks/useAdminStatus';

function CostsPageContent({ cmsData }: { cmsData?: any }) {
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  // Removed unused interactionMode hook
  const [apiConnected, setApiConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAPIConnection();
  }, []);

  const checkAPIConnection = async () => {
    setConnectionStatus('connecting');  
    // Mock implementation
    setTimeout(() => {
      setApiConnected(false);
      setConnectionStatus('error');
      setError('API service not implemented');
    }, 1000);
  };

  const handleConnectAPI = async () => {
    setConnectionStatus('connecting');
    // Mock implementation
    setTimeout(() => {
      setApiConnected(true);
      setConnectionStatus('connected');
      setError(null);
    }, 1000);
  };

  const handleDisconnectAPI = async () => {
    setApiConnected(false);
    setConnectionStatus('idle');
    setError(null);
  };

  if (adminLoading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading admin status...</Text>
        </Stack>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Alert variant="error">
            <Text>Access denied. Admin privileges required.</Text>
          </Alert>
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
            Cost Management Dashboard
          </Text>
          <Text variant="muted" size="lg">
            Monitor and manage business costs with real-time API integrations
          </Text>
        </Stack>

        {/* API Integration Controls */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text variant="h3" weight="semibold">
              API Integration Status
            </Text>
            
            <Stack direction="horizontal" align="center" spacing="md">
              <Text>Status:</Text>
              <div
                style={{
                  padding: '0.5rem',
                  backgroundColor: connectionStatus === 'connected' ? 'var(--success)' : 
                                 connectionStatus === 'error' ? 'var(--error)' : 'var(--warning)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'error' ? 'Error' : 'Disconnected'}
              </div>
            </Stack>

            {error && (
              <Alert variant="error">
                <Text>{error}</Text>
              </Alert>
            )}

            <Stack direction="horizontal" spacing="md">
              {!apiConnected ? (
                <Button
                  onClick={handleConnectAPI}
                  disabled={connectionStatus === 'connecting'}
                  variant="primary"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to API'}
                </Button>
              ) : (
                <Button
                  onClick={handleDisconnectAPI}
                  variant="outline"
                >
                  Disconnect from API
                </Button>
              )}
              
              <Button
                onClick={checkAPIConnection}
                variant="outline"
                disabled={connectionStatus === 'connecting'}
              >
                Refresh Status
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Cost Tracking Dashboard */}
        {apiConnected && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text variant="h3" weight="semibold">
                Real-time Cost Tracking
              </Text>
              <CostTrackingDashboard cmsData={cmsData} />
            </Stack>
          </Box>
        )}

        {/* Interaction Mode Info - Removed unused section */}
      </Stack>
    </Container>
  );
}

export default function CostsPage() {
  return <CostsPageContent cmsData={{}} />;
}