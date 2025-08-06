'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
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
import { AdminPageWrapper } from '@/components/app';

function DriversPageContent() {
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
      setError('Failed to load drivers from database. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

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
      setError('Failed to update driver status');
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
    }).format(date);
  };

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    busyDrivers: drivers.filter(d => d.status === 'busy').length,
    offlineDrivers: drivers.filter(d => d.status === 'offline').length
  };

  const filteredDrivers = selectedStatus === 'all' 
    ? drivers 
    : drivers.filter(d => d.status === selectedStatus);

  const tableData = filteredDrivers.map(driver => ({
    id: driver.id,
    driver: (
      <Stack spacing="xs">
        <Text variant="body" weight="medium">{driver.name}</Text>
        <Text variant="small" color="secondary">{driver.email}</Text>
        <Text variant="small" color="secondary">{driver.phone}</Text>
      </Stack>
    ),
    vehicle: (
      <Stack spacing="xs">
        <Text variant="small">
          {driver.vehicleInfo.make} {driver.vehicleInfo.model} ({driver.vehicleInfo.year})
        </Text>
        <Text variant="small" color="secondary">
          {driver.vehicleInfo.color} • {driver.vehicleInfo.licensePlate}
        </Text>
      </Stack>
    ),
    status: (
      <Badge variant={getStatusVariant(driver.status)}>
        {getStatusIcon(driver.status)} {driver.status}
      </Badge>
    ),
    rating: (
      <Stack spacing="xs">
        <Text variant="body" weight="medium">
          {driver.rating ? `${driver.rating}/5.0` : 'N/A'}
        </Text>
        <Text variant="small" color="secondary">
          {driver.totalRides ? `${driver.totalRides} rides` : 'No rides yet'}
        </Text>
      </Stack>
    ),
    joined: formatDate(driver.createdAt),
    actions: (
      <Stack direction="horizontal" spacing="sm">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'available')}
          disabled={driver.status === 'available'}
        >
          Set Available
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'busy')}
          disabled={driver.status === 'busy'}
        >
          Set Busy
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(driver, 'offline')}
          disabled={driver.status === 'offline'}
        >
          Set Offline
        </Button>
      </Stack>
    )
  }));

  if (loading) {
    return (
      <AdminPageWrapper
        title="Driver Management"
        subtitle="Loading drivers from database..."
      >
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>Loading drivers from database...</Text>
          </Stack>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Error Loading Drivers"
        subtitle={error}
      >
        <Container>
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Driver Management"
      subtitle="Manage driver profiles, availability, and assignments"
    >
      <Stack spacing="xl">
        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium">Filter by Status</Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Drivers</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">👨‍💼</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Total Drivers</Text>
                <Text size="xl" weight="bold">{stats.totalDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Available</Text>
                <Text size="xl" weight="bold">{stats.availableDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🚗</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">On Trip</Text>
                <Text size="xl" weight="bold">{stats.busyDrivers}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">⏸️</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Offline</Text>
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
              <Text size="lg" weight="medium">No Drivers Found</Text>
              <Text variant="body" color="secondary">
                No drivers match your current filter criteria.
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'driver', label: 'Driver' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'status', label: 'Status' },
              { key: 'rating', label: 'Rating' },
              { key: 'joined', label: 'Joined' },
              { key: 'actions', label: 'Actions' }
            ]}
          />
        )}
      </Stack>
    </AdminPageWrapper>
  );
}

const DriversPage: NextPage = () => {
  return <DriversPageContent />;
};

export default withAuth(DriversPage);
