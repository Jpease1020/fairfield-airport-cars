'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { getAllDrivers, getAvailableDrivers, updateDocument, type Driver } from '@/lib/services/database-service';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Box, 
  Badge,
  DataTable,
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
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchDrivers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('👨‍💼 Loading drivers from database...');

      let fetchedDrivers: Driver[];
      
      if (selectedStatus === 'available') {
        fetchedDrivers = await getAvailableDrivers();
      } else {
        fetchedDrivers = await getAllDrivers();
      }
      
      console.log('✅ Drivers loaded from database:', fetchedDrivers.length, 'drivers');
      setDrivers(fetchedDrivers);
      
      if (fetchedDrivers.length === 0) {
        console.log('📝 No drivers found in database');
      }
    } catch (err) {
      console.error('❌ Error loading drivers from database:', err);
      setError(getCMSField(cmsData, 'admin.drivers.error.loadDriversFailed', 'Failed to load drivers from database. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, cmsData]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleStatusUpdate = async (driver: Driver, newStatus: Driver['status']) => {
    try {
      console.log(`🔄 Updating driver ${driver.id} status to ${newStatus}`);
      
      await updateDocument('drivers', driver.id, { status: newStatus });
      
      // Update local state
      setDrivers(prev => prev.map(d => 
        d.id === driver.id ? { ...d, status: newStatus } : d
      ));
      
      console.log('✅ Driver status updated successfully');
    } catch (err) {
      console.error('❌ Error updating driver status:', err);
      setError(getCMSField(cmsData, 'admin.drivers.error.updateStatusFailed', 'Failed to update driver status'));
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const filteredDrivers = selectedStatus === 'all' 
    ? drivers 
    : drivers.filter(d => d.status === selectedStatus);

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    busyDrivers: drivers.filter(d => d.status === 'busy').length,
    offlineDrivers: drivers.filter(d => d.status === 'offline').length,
  };

  const tableData = filteredDrivers.map(driver => ({
    id: driver.id,
    driver: (
      <Stack spacing="xs">
        <Text weight="medium">{driver.name}</Text>
        <Text variant="small" color="secondary">{driver.email}</Text>
        <Text variant="small" color="secondary">{driver.phone}</Text>
      </Stack>
    ),
          vehicle: (
        <Stack spacing="xs">
          <Text weight="medium">{driver.vehicleInfo.make} {driver.vehicleInfo.model}</Text>
          <Text variant="small" color="secondary">{driver.vehicleInfo.year} • {driver.vehicleInfo.color}</Text>
          <Text variant="small" color="secondary">{driver.vehicleInfo.licensePlate}</Text>
        </Stack>
      ),
    status: (
      <Badge variant={getStatusVariant(driver.status)}>
        {getStatusIcon(driver.status)} {driver.status}
      </Badge>
    ),
    rating: (
      <Stack spacing="xs">
        <Text variant="small" weight="medium">
          {driver.rating ? `${driver.rating.toFixed(1)} ⭐` : 'No rating yet'}
        </Text>
        <Text variant="small" color="secondary">
          {driver.totalRides ? `${driver.totalRides} rides` : getCMSField(cmsData, 'admin.drivers.sections.table.noRides', 'No rides yet')}
        </Text>
      </Stack>
    ),
    joined: formatDate(driver.createdAt || new Date()),
    actions: (
      <Stack direction="horizontal" spacing="sm">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'available')}
          disabled={driver.status === 'available'}
          data-cms-id="admin.drivers.sections.table.actions.setAvailable"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin.drivers.sections.table.actions.setAvailable', 'Set Available')}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'busy')}
          disabled={driver.status === 'busy'}
          data-cms-id="admin.drivers.sections.table.actions.setBusy"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin.drivers.sections.table.actions.setBusy', 'Set Busy')}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'offline')}
          disabled={driver.status === 'offline'}
          data-cms-id="admin.drivers.sections.table.actions.setOffline"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin.drivers.sections.table.actions.setOffline', 'Set Offline')}
        </Button>
      </Stack>
    )
  }));

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
          <LoadingSpinner />
          <Text data-cms-id="admin.drivers.loading.loadingDrivers" mode={mode}>
            {getCMSField(cmsData, 'admin.drivers.loading.loadingDrivers', 'Loading drivers from database...')}
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

  return (
    <>
      <Stack spacing="xl">
        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium" data-cms-id="admin.drivers.sections.filter.title" mode={mode}>
            {getCMSField(cmsData, 'admin.drivers.sections.filter.title', 'Filter by Status')}
          </Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">{getCMSField(cmsData, 'admin.drivers.sections.filter.allDrivers', 'All Drivers')}</option>
            <option value="available">{getCMSField(cmsData, 'admin.drivers.sections.filter.available', 'Available')}</option>
            <option value="busy">{getCMSField(cmsData, 'admin.drivers.sections.filter.busy', 'Busy')}</option>
            <option value="offline">{getCMSField(cmsData, 'admin.drivers.sections.filter.offline', 'Offline')}</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">👨‍💼</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.stats.totalDrivers" mode={mode}>
                  {getCMSField(cmsData, 'admin.drivers.sections.stats.totalDrivers', 'Total Drivers')}
                </Text>
                <Text size="xl" weight="bold">{stats.totalDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.stats.available" mode={mode}>
                  {getCMSField(cmsData, 'admin.drivers.sections.stats.available', 'Available')}
                </Text>
                <Text size="xl" weight="bold">{stats.availableDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🚗</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.stats.onTrip" mode={mode}>
                  {getCMSField(cmsData, 'admin.drivers.sections.stats.onTrip', 'On Trip')}
                </Text>
                <Text size="xl" weight="bold">{stats.busyDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">⏸️</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.drivers.sections.stats.offline" mode={mode}>
                  {getCMSField(cmsData, 'admin.drivers.sections.stats.offline', 'Offline')}
                </Text>
                <Text size="xl" weight="bold">{stats.offlineDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {/* Drivers Table */}
        {filteredDrivers.length === 0 ? (
          <Box>
            <Stack spacing="md" align="center">
              <Text size="xl">👨‍💼</Text>
              <Text size="lg" weight="medium" data-cms-id="admin.drivers.sections.table.noDrivers.title" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.table.noDrivers.title', 'No Drivers Found')}
              </Text>
              <Text variant="body" color="secondary" data-cms-id="admin.drivers.sections.table.noDrivers.description" mode={mode}>
                {getCMSField(cmsData, 'admin.drivers.sections.table.noDrivers.description', 'No drivers match your current filter criteria.')}
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'driver', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.driver', 'Driver') },
              { key: 'vehicle', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.vehicle', 'Vehicle') },
              { key: 'status', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.status', 'Status') },
              { key: 'rating', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.rating', 'Rating') },
              { key: 'joined', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.joined', 'Joined') },
              { key: 'actions', label: getCMSField(cmsData, 'admin.drivers.sections.table.columns.actions', 'Actions') }
            ]}
          />
        )}
      </Stack>
    </>
  );
}

const DriversPage: NextPage = () => {
  return <DriversPageContent />;
};

export default DriversPage;
