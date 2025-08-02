'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
import { getAllBookings, getBookingsByStatus, updateDocument, deleteDocument, type Booking } from '@/lib/services/database-service';
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
  H1,
  AdminPageWrapper
} from '@/ui';

function AdminBookingsPageContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Fetching bookings from database...');
      
      let fetchedBookings: Booking[];
      
      if (selectedStatus === 'all') {
        fetchedBookings = await getAllBookings();
      } else {
        fetchedBookings = await getBookingsByStatus(selectedStatus as Booking['status']);
      }
      
      console.log('✅ Bookings fetched from database:', fetchedBookings.length, 'bookings');
      setBookings(fetchedBookings);
      
      if (fetchedBookings.length === 0) {
        console.log('📝 No bookings found in database');
      }
    } catch (err) {
      console.error('❌ Error fetching bookings from database:', err);
      setError('Failed to load bookings from database');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      console.log(`🔄 Updating booking ${booking.id} status to ${newStatus}`);
      
      await updateDocument('bookings', booking.id!, { status: newStatus });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
      
      console.log('✅ Booking status updated successfully');
    } catch (err) {
      console.error('❌ Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      console.log(`🗑️ Deleting booking ${booking.id}`);
      
      await deleteDocument('bookings', booking.id!);
      
      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      
      console.log('✅ Booking deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting booking:', err);
      setError('Failed to delete booking');
    }
  };

  const handleDriverAssignment = async (booking: Booking) => {
    try {
      console.log(`👨‍💼 Assigning driver to booking ${booking.id}`);
      
      // For now, assign Gregg as the default driver
      const driverId = 'gregg-main-driver';
      const driverName = 'Gregg';
      
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
      
      console.log('✅ Driver assigned successfully');
    } catch (err) {
      console.error('❌ Error assigning driver:', err);
      setError('Failed to assign driver');
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
        <Text variant="small" color="secondary">
          {booking.passengers} passenger{booking.passengers !== 1 ? 's' : ''}
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
        >
          Confirm
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleDriverAssignment(booking)}
          disabled={!!booking.driverId}
        >
          Assign Driver
        </Button>
        <Button 
          size="sm" 
          variant="danger" 
          onClick={() => handleDeleteBooking(booking)}
        >
          Delete
        </Button>
      </Stack>
    )
  }));

  if (loading) {
    return (
      <AdminPageWrapper
        title="Booking Management"
        subtitle="Loading bookings from database..."
      >
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>Loading bookings from database...</Text>
          </Stack>
        </Container>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Error Loading Bookings"
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
      title="Booking Management"
      subtitle="Manage all customer bookings and track their status"
    >
      <Stack spacing="xl">
        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium">Filter by Status</Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📋</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Total Bookings</Text>
                <Text size="xl" weight="bold">{stats.totalBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Confirmed</Text>
                <Text size="xl" weight="bold">{stats.confirmedBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🚗</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">In Progress</Text>
                <Text size="xl" weight="bold">{stats.inProgressBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Total Revenue</Text>
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
              <Text size="lg" weight="medium">No Bookings Found</Text>
              <Text variant="body" color="secondary">
                No bookings match your current filter criteria.
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'route', label: 'Route' },
              { key: 'dateTime', label: 'Date & Time' },
              { key: 'status', label: 'Status' },
              { key: 'fare', label: 'Fare' },
              { key: 'actions', label: 'Actions' }
            ]}
          />
        )}
      </Stack>
    </AdminPageWrapper>
  );
}

const AdminBookingsPage: NextPage = () => {
  return <AdminBookingsPageContent />;
};

export default withAuth(AdminBookingsPage);
