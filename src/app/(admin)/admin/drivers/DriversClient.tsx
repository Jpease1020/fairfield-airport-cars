'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllDrivers, updateDocument, type Driver } from '@/lib/services/database-service';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Box, 
  Badge,
  Alert,
  LoadingSpinner,
  GridSection
} from '@/ui';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

interface DriversClientProps {
  cmsData: any;
}

export default function DriversClient({ cmsData }: DriversClientProps) {
  const { isAdmin } = useAdmin();
  const { mode } = useInteractionMode();
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchDriver = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const drivers = await getAllDrivers();
      
      if (drivers.length === 0) {
        setError(getCMSField(cmsData, 'errors.noDrivers', 'No drivers found in database.'));
        return;
      }
      
      // Just get the first driver since we only have one
      const firstDriver = drivers[0];
      setDriver(firstDriver);
      
    } catch (err) {
      console.error('❌ Error loading driver:', err);
      setError(getCMSField(cmsData, 'errors.loadDriverFailed', 'Failed to load driver from database. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [cmsData]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  const handleStatusUpdate = async (newStatus: Driver['status']) => {
    if (!driver) return;
    
    try {
      setUpdating(true);
      
      await updateDocument('drivers', driver.id, { status: newStatus });
      
      // Update local state
      setDriver(prev => prev ? { ...prev, status: newStatus } : null);
      
    } catch (err) {
      console.error('❌ Error updating driver status:', err);
      setError(getCMSField(cmsData, 'errors.updateStatusFailed', 'Failed to update driver status'));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'info';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'busy': return '🚗';
      case 'offline': return '⏸️';
      default: return '❓';
    }
  };

  if (!isAdmin) {
    return (
      <Container>
        <Alert variant="error">
          <Text data-cms-id="errors-access-denied">{getCMSField(cmsData, 'errors-access-denied', 'Access denied. Admin privileges required.')}</Text>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text data-cms-id="loading-loading-driver">{getCMSField(cmsData, 'loading-loading-driver', 'Loading driver information...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (error && !driver) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Alert variant="error">
            <Text data-cms-id="errors-no-driver-dynamic">{error}</Text>
          </Alert>
          <Button onClick={fetchDriver}>
            Retry
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!driver) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text data-cms-id="errors-no-driver">{getCMSField(cmsData, 'errors-no-driver', 'No driver found.')}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl" align="center">
        {/* Header */}
        <Stack spacing="md" align="center">
          <Text 
            variant="h1" 
            align="center" 
            data-cms-id="title"
            mode={mode}
          >
            {getCMSField(cmsData, 'title', 'Driver Management')}
          </Text>
          <Text 
            variant="lead" 
            align="center" 
            data-cms-id="subtitle"
            mode={mode}
          >
            {getCMSField(cmsData, 'subtitle', 'Manage your driver status and information')}
          </Text>
        </Stack>

        {/* Driver Information */}
        <Box variant="elevated" padding="xl">
          <Stack spacing="xl">
            {/* Basic Info */}
            <GridSection
              title={getCMSField(cmsData, 'info-title', 'Driver Information')}
            >
              <Stack spacing="md">
                <div data-cms-id="info-name">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'info-name', 'Name')}:
                  </Text>
                  <Text>{driver.name}</Text>
                </div>
                
                <div data-cms-id="info-phone">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'info-phone', 'Phone')}:
                  </Text>
                  <Text>{driver.phone}</Text>
                </div>
                
                <div data-cms-id="vehicle-title">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'info-email', 'Email')}:
                  </Text>
                  <Text>{driver.email}</Text>
                </div>
              </Stack>
            </GridSection>

            {/* Vehicle Information */}
            <GridSection
              title={getCMSField(cmsData, 'vehicle-title', 'Vehicle Information')}
            >
              <Stack spacing="md">
                <div data-cms-id="vehicle-make-model">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'vehicle-make-model', 'Vehicle')}:
                  </Text>
                  <Text>{driver.vehicleInfo?.make} {driver.vehicleInfo?.model}</Text>
                </div>
                
                <div data-cms-id="vehicle-year">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'vehicle-year', 'Year')}:
                  </Text>
                  <Text>{driver.vehicleInfo?.year}</Text>
                </div>
                
                <div data-cms-id="vehicle-color">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'vehicle-color', 'Color')}:
                  </Text>
                  <Text>{driver.vehicleInfo?.color}</Text>
                </div>
                
                <div data-cms-id="vehicle-plate">
                  <Text weight="bold">
                    {getCMSField(cmsData, 'vehicle-plate', 'License Plate')}:
                  </Text>
                  <Text>{driver.vehicleInfo?.licensePlate}</Text>
                </div>
              </Stack>
            </GridSection>

            {/* Current Status */}
            <GridSection
              title={getCMSField(cmsData, 'status-title', 'Current Status')}
            >
              <Stack spacing="md" align="center">
                <Badge variant={getStatusVariant(driver.status)} size="lg">
                  {getStatusIcon(driver.status)} {driver.status.toUpperCase()}
                </Badge>
                
                <Text align="center" color="muted">
                  {driver.status === 'available' && getCMSField(cmsData, 'status-available-desc', 'Driver is available for new bookings')}
                  {driver.status === 'busy' && getCMSField(cmsData, 'status-busy-desc', 'Driver is currently on a trip')}
                  {driver.status === 'offline' && getCMSField(cmsData, 'status-offline-desc', 'Driver is offline and not taking bookings')}
                </Text>
              </Stack>
            </GridSection>

            {/* Status Actions */}
            <GridSection
              title={getCMSField(cmsData, 'status-title', 'Change Status')}
            >
              <Stack direction={{ xs: 'vertical', md: 'horizontal' }} spacing="md" justify="center">
                <Button
                  onClick={() => handleStatusUpdate('available')}
                  variant="success"
                  disabled={driver.status === 'available' || updating}
                  data-cms-id="actions-set-available"
                >
                  ✅ {getCMSField(cmsData, 'actions-set-available', 'Set Available')}
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate('busy')}
                  variant="warning"
                  disabled={driver.status === 'busy' || updating}
                  data-cms-id="actions-set-busy"
                >
                  🚗 {getCMSField(cmsData, 'actions-set-busy', 'Set Busy')}
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate('offline')}
                  variant="secondary"
                  disabled={driver.status === 'offline' || updating}
                  data-cms-id="actions-set-offline"
                >
                  ⏸️ {getCMSField(cmsData, 'actions-set-offline', 'Set Offline')}
                </Button>
              </Stack>
              
              {updating && (
                <Text align="center" color="muted">
                  {getCMSField(cmsData, 'actions-updating', 'Updating status...')}
                </Text>
              )}
            </GridSection>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

