'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
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
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function DriversPageContent() {
  const { cmsData } = useCMSData();
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
        setError(getCMSField(cmsData, 'admin.drivers.error.noDrivers', 'No drivers found in database.'));
        return;
      }
      
      // Just get the first driver since we only have one
      const firstDriver = drivers[0];
      setDriver(firstDriver);
      
    } catch (err) {
      console.error('❌ Error loading driver:', err);
      setError(getCMSField(cmsData, 'admin.drivers.error.loadDriverFailed', 'Failed to load driver from database. Please try again.'));
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
      setError(getCMSField(cmsData, 'admin.drivers.error.updateStatusFailed', 'Failed to update driver status'));
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
          <Text>{getCMSField(cmsData, 'admin.drivers.error.accessDenied', 'Access denied. Admin privileges required.')}</Text>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
          <LoadingSpinner />
          <Text data-cms-id="admin.drivers.loading.loadingDriver" mode={mode}>
            {getCMSField(cmsData, 'admin.drivers.loading.loadingDriver', 'Loading driver information...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  if (!driver) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{getCMSField(cmsData, 'admin.drivers.error.noDriver', 'No driver found.')}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl">
        {/* Page Header */}
        <Stack spacing="sm">
          <Text size="2xl" weight="bold" data-cms-id="admin.drivers.title" mode={mode}>
            {getCMSField(cmsData, 'admin.drivers.title', 'Driver Management')}
          </Text>
          <Text variant="body" color="secondary" data-cms-id="admin.drivers.subtitle" mode={mode}>
            {getCMSField(cmsData, 'admin.drivers.subtitle', 'Manage your driver status and information')}
          </Text>
        </Stack>

        {/* Driver Info Card */}
        <Box padding="lg" variant="outlined" rounded="lg">
          <Stack spacing="lg">
            {/* Driver Basic Info */}
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.drivers.sections.info.title" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.info.title', 'Driver Information')}
              </Text>
              
              <Stack direction="horizontal" spacing="xl" wrap="wrap">
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.info.name" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.info.name', 'Name')}
                  </Text>
                  <Text weight="medium">{driver.name}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.info.phone" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.info.phone', 'Phone')}
                  </Text>
                  <Text>{driver.phone}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.info.email" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.info.email', 'Email')}
                  </Text>
                  <Text>{driver.email}</Text>
                </Stack>
              </Stack>
            </Stack>

            {/* Vehicle Info */}
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.drivers.sections.vehicle.title" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.vehicle.title', 'Vehicle Information')}
              </Text>
              
              <Stack direction="horizontal" spacing="xl" wrap="wrap">
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.vehicle.makeModel" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.vehicle.makeModel', 'Vehicle')}
                  </Text>
                  <Text weight="medium">{driver.vehicleInfo.make} {driver.vehicleInfo.model}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.vehicle.year" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.vehicle.year', 'Year')}
                  </Text>
                  <Text>{driver.vehicleInfo.year}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.vehicle.color" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.vehicle.color', 'Color')}
                  </Text>
                  <Text>{driver.vehicleInfo.color}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.vehicle.plate" mode={mode}>
                    {getCMSField(cmsData, 'admin.drivers.sections.vehicle.plate', 'License Plate')}
                  </Text>
                  <Text>{driver.vehicleInfo.licensePlate}</Text>
                </Stack>
              </Stack>
            </Stack>

            {/* Current Status */}
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.drivers.sections.status.title" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.status.title', 'Current Status')}
              </Text>
              
              <Stack direction="horizontal" spacing="md" align="center">
                <Badge variant={getStatusVariant(driver.status)} size="lg">
                  {getStatusIcon(driver.status)} {driver.status}
                </Badge>
                
                <Text variant="small" color="secondary">
                  {driver.status === 'available' && getCMSField(cmsData, 'admin.drivers.sections.status.availableDesc', 'Driver is available for new bookings')}
                  {driver.status === 'busy' && getCMSField(cmsData, 'admin.drivers.sections.status.busyDesc', 'Driver is currently on a trip')}
                  {driver.status === 'offline' && getCMSField(cmsData, 'admin.drivers.sections.status.offlineDesc', 'Driver is offline and not taking bookings')}
                </Text>
              </Stack>
            </Stack>

            {/* Status Actions */}
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.drivers.sections.actions.title" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.actions.title', 'Change Status')}
              </Text>
              
              <Stack direction="horizontal" spacing="sm" wrap="wrap">
                <Button 
                  variant="secondary" 
                  onClick={() => handleStatusUpdate('available')}
                  disabled={driver.status === 'available' || updating}
                  data-cms-id="admin.drivers.sections.actions.setAvailable"
                  interactionMode={mode}
                >
                  ✅ {getCMSField(cmsData, 'admin.drivers.sections.actions.setAvailable', 'Set Available')}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={() => handleStatusUpdate('busy')}
                  disabled={driver.status === 'busy' || updating}
                  data-cms-id="admin.drivers.sections.actions.setBusy"
                  interactionMode={mode}
                >
                  🚗 {getCMSField(cmsData, 'admin.drivers.sections.actions.setBusy', 'Set Busy')}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={() => handleStatusUpdate('offline')}
                  disabled={driver.status === 'offline' || updating}
                  data-cms-id="admin.drivers.sections.actions.setOffline"
                  interactionMode={mode}
                >
                  ⏸️ {getCMSField(cmsData, 'admin.drivers.sections.actions.setOffline', 'Set Offline')}
                </Button>
              </Stack>
              
              {updating && (
                <Stack direction="horizontal" spacing="sm" align="center">
                  <LoadingSpinner size="sm" />
                  <Text variant="small" color="secondary">
                    {getCMSField(cmsData, 'admin.drivers.sections.actions.updating', 'Updating status...')}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

const DriversPage: NextPage = () => {
  return <DriversPageContent />;
};

export default DriversPage;
