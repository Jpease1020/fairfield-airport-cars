'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { getAllBookings, getBookingsByStatus, updateDocument, deleteDocument, type Booking } from '@/lib/services/database-service';
import { getAvailableDrivers } from '@/lib/services/booking-service';
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
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function AdminBookingsPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      let fetchedBookings: Booking[];
      
      if (selectedStatus === 'all') {
        fetchedBookings = await getAllBookings();
      } else {
        fetchedBookings = await getBookingsByStatus(selectedStatus as Booking['status']);
      }
      
      setBookings(fetchedBookings);
      
      if (fetchedBookings.length === 0) {
        console.error('📝 No bookings found in database');
      }
    } catch (err) {
      console.error('❌ Error fetching bookings from database:', err);
      setError(getCMSField(cmsData, 'admin-bookings-error-loadBookingsFailed', 'Failed to load bookings from database'));
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, cmsData]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      
      await updateDocument('bookings', booking.id!, { status: newStatus });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
      
    } catch (err) {
      console.error('❌ Error updating booking status:', err);
      setError(getCMSField(cmsData, 'admin-bookings-error-updateStatusFailed', 'Failed to update booking status'));
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      
      await deleteDocument('bookings', booking.id!);
      
      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      
    } catch (err) {
      console.error('❌ Error deleting booking:', err);
      setError(getCMSField(cmsData, 'admin-bookings-error-deleteBookingFailed', 'Failed to delete booking'));
    }
  };

  const handleDriverAssignment = async (booking: Booking) => {
    try {
      
      // Get available drivers from database
      const availableDrivers = await getAvailableDrivers();
      if (availableDrivers.length === 0) {
        throw new Error('No available drivers');
      }
      
      const driver = availableDrivers[0];
      const driverId = driver.id;
      const driverName = driver.name;
      
      await updateDocument('bookings', booking.id!, { 
        driverId,
        driverName,
        status: 'confirmed' as Booking['status']
      });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { 
          ...b, 
          driverId, 
          driverName, 
          status: 'confirmed' as Booking['status'] 
        } : b
      ));
      
    } catch (err) {
      console.error('❌ Error assigning driver:', err);
      setError(getCMSField(cmsData, 'admin-bookings-error-assignDriverFailed', 'Failed to assign driver'));
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date set';
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date error';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    inProgressBookings: bookings.filter(b => b.status === 'in-progress').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.fare, 0)
  };

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === selectedStatus);

  const tableData = filteredBookings.map(booking => ({
    id: booking.id,
    customer: (
      <Stack spacing="xs">
        <Text variant="body" weight="medium">{booking.name}</Text>
        <Text variant="small" color="secondary">{booking.email}</Text>
        <Text variant="small" color="secondary">{booking.phone}</Text>
      </Stack>
    ),
    route: (
      <Stack spacing="xs">
        <Text variant="small">
          <Text variant="small" weight="medium">From:</Text> {booking.pickupLocation}
        </Text>
        <Text variant="small">
          <Text variant="small" weight="medium">To:</Text> {booking.dropoffLocation}
        </Text>

      </Stack>
    ),
    dateTime: formatDate(booking.pickupDateTime),
    status: (
      <Badge variant={getStatusVariant(booking.status)}>
        {getStatusIcon(booking.status)} {booking.status}
      </Badge>
    ),
    fare: (
      <Stack spacing="xs">
        <Text variant="body" weight="medium">
          {formatCurrency(booking.fare)}
        </Text>
        {booking.balanceDue > 0 && (
          <Text variant="small" color="error">
            Balance: {formatCurrency(booking.balanceDue)}
          </Text>
        )}
      </Stack>
    ),
    actions: (
      <Stack direction="horizontal" spacing="sm">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleStatusUpdate(booking, 'confirmed')}
          disabled={booking.status === 'confirmed'}
          data-cms-id="admin.bookings.sections.table.actions.confirm"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin-bookings-sections-table-actions-confirm', 'Confirm')}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleDriverAssignment(booking)}
          disabled={!!booking.driverId}
          data-cms-id="admin.bookings.sections.table.actions.assignDriver"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin-bookings-sections-table-actions-assignDriver', 'Assign Driver')}
        </Button>
        <Button 
          size="sm" 
          variant="danger" 
          onClick={() => handleDeleteBooking(booking)}
          data-cms-id="admin.bookings.sections.table.actions.delete"
          interactionMode={mode}
        >
          {getCMSField(cmsData, 'admin-bookings-sections-table-actions-delete', 'Delete')}
        </Button>
      </Stack>
    )
  }));

  if (loading) {
    return (
     
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>{getCMSField(cmsData, 'admin-bookings-loading-loadingBookings', 'Loading bookings from database...')}</Text>
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
    <Container>
      <Stack spacing="xl">
        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium" data-cms-id="admin.bookings.sections.filter.title" mode={mode}>
            {getCMSField(cmsData, 'admin-bookings-sections-filter-title', 'Filter by Status')}
          </Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">{getCMSField(cmsData, 'admin-bookings-sections-filter-allBookings', 'All Bookings')}</option>
            <option value="pending">{getCMSField(cmsData, 'admin-bookings-sections-filter-pending', 'Pending')}</option>
            <option value="confirmed">{getCMSField(cmsData, 'admin-bookings-sections-filter-confirmed', 'Confirmed')}</option>
            <option value="completed">{getCMSField(cmsData, 'admin-bookings-sections-filter-completed', 'Completed')}</option>
            <option value="cancelled">{getCMSField(cmsData, 'admin-bookings-sections-filter-cancelled', 'Cancelled')}</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📋</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.bookings.sections.stats.totalBookings" mode={mode}>
                  {getCMSField(cmsData, 'admin-bookings-sections-stats-totalBookings', 'Total Bookings')}
                </Text>
                <Text size="xl" weight="bold">{stats.totalBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.bookings.sections.stats.confirmed" mode={mode}>
                  {getCMSField(cmsData, 'admin-bookings-sections-stats-confirmed', 'Confirmed')}
                </Text>
                <Text size="xl" weight="bold">{stats.confirmedBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🚗</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.bookings.sections.stats.inProgress" mode={mode}>
                  {getCMSField(cmsData, 'admin-bookings-sections-stats-inProgress', 'In Progress')}
                </Text>
                <Text size="xl" weight="bold">{stats.inProgressBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="admin.bookings.sections.stats.totalRevenue" mode={mode}>
                  {getCMSField(cmsData, 'admin-bookings-sections-stats-totalRevenue', 'Total Revenue')}
                </Text>
                <Text size="xl" weight="bold">{formatCurrency(stats.totalRevenue)}</Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <Box>
            <Stack spacing="md" align="center">
              <Text size="xl">📭</Text>
              <Text size="lg" weight="medium" data-cms-id="admin.bookings.sections.table.noBookings.title" mode={mode}>
                {getCMSField(cmsData, 'admin-bookings-sections-table-noBookings-title', 'No Bookings Found')}
              </Text>
              <Text variant="body" color="secondary" data-cms-id="admin.bookings.sections.table.noBookings.description" mode={mode}>
                {getCMSField(cmsData, 'admin-bookings-sections-table-noBookings-description', 'No bookings match your current filter criteria.')}
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-customer', 'Customer') },
              { key: 'route', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-route', 'Route') },
              { key: 'dateTime', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-dateTime', 'Date & Time') },
              { key: 'status', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-status', 'Status') },
              { key: 'fare', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-fare', 'Fare') },
              { key: 'actions', label: getCMSField(cmsData, 'admin-bookings-sections-table-columns-actions', 'Actions') }
            ]}
          />
        )}
      </Stack>
    </Container>
  );
}

const AdminBookingsPage: NextPage = () => {
  return <AdminBookingsPageContent />;
};

export default AdminBookingsPage;
