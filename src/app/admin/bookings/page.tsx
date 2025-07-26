'use client';

import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { listBookings, updateBooking, deleteBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import {
  AdminPageWrapper,
  GridSection,
  StatCard,
  InfoCard,
  DataTable,
  DataTableColumn,
  DataTableAction
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdminBookingsPage: NextPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setError(null);
      setLoading(true);
      const fetchedBookings = await listBookings();
      setBookings(fetchedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    if (!booking.id) {
      alert('Cannot update booking: missing ID');
      return;
    }
    
    try {
      await updateBooking(booking.id, { status: newStatus });
      await fetchBookings(); // Refresh data
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!booking.id) {
      alert('Cannot delete booking: missing ID');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete booking for ${booking.name}?`)) {
      return;
    }
    
    try {
      await deleteBooking(booking.id);
      await fetchBookings(); // Refresh data
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to delete booking');
    }
  };

  // Header actions
  const headerActions = [
    {
      label: 'Refresh',
      onClick: fetchBookings,
      variant: 'outline' as const,
      disabled: loading
    },
    {
      label: 'Export CSV',
      onClick: () => alert('Export functionality coming soon'),
      variant: 'primary' as const
    }
  ];

  // Calculate stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.fare || 0), 0);
  const totalTips = bookings.reduce((sum, booking) => sum + (booking.tipAmount || 0), 0);
  const totalCancFees = bookings.reduce((sum, booking) => sum + (booking.cancellationFee || 0), 0);

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Status badge renderer
  const renderStatus = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default', 
      completed: 'default',
      cancelled: 'destructive'
    } as const;
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Table columns configuration
  const columns: DataTableColumn<Booking>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (_, booking) => (
        <div>
          <div className="font-medium">{booking.name}</div>
          <div className="text-sm text-gray-500">{booking.email}</div>
        </div>
      )
    },
    {
      key: 'pickupLocation',
      label: 'Route',
      sortable: true,
      render: (_, booking) => (
        <div>
          <div className="text-sm font-medium">{booking.pickupLocation}</div>
          <div className="text-xs text-gray-500">→ {booking.dropoffLocation}</div>
        </div>
      )
    },
    {
      key: 'pickupDateTime',
      label: 'Pickup Time',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div>
            <div className="text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    {
      key: 'fare',
      label: 'Fare',
      sortable: true,
      render: (value) => (
        <span className="font-medium">${(value || 0).toFixed(2)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => renderStatus(value)
    }
  ];

  // Table actions
  const actions: DataTableAction<Booking>[] = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (booking) => window.open(`/booking/${booking.id}`, '_blank'),
      variant: 'outline'
    },
    {
      label: 'Confirm',
      icon: '✅',
      onClick: (booking) => handleStatusUpdate(booking, 'confirmed'),
      variant: 'primary',
      condition: (booking) => booking.status === 'pending'
    },
    {
      label: 'Complete',
      icon: '🏁',
      onClick: (booking) => handleStatusUpdate(booking, 'completed'),
      variant: 'primary', 
      condition: (booking) => booking.status === 'confirmed'
    },
    {
      label: 'Cancel',
      icon: '❌',
      onClick: (booking) => handleStatusUpdate(booking, 'cancelled'),
      variant: 'destructive',
      condition: (booking) => booking.status !== 'completed' && booking.status !== 'cancelled'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: handleDeleteBooking,
      variant: 'destructive'
    }
  ];

  return (
    <AdminPageWrapper
      title="Booking Dashboard"
      subtitle="Manage customer bookings and reservations"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading bookings..."
      errorTitle="Booking Load Error"
    >
      {/* Stats Overview */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Bookings"
          icon="📊"
          statNumber={totalBookings.toString()}
          statChange={`${pendingBookings} pending, ${confirmedBookings} confirmed`}
          changeType="neutral"
        />
        <StatCard
          title="Total Revenue"
          icon="💰"
          statNumber={`$${totalRevenue.toFixed(2)}`}
          statChange={`${completedBookings} completed bookings`}
          changeType="positive"
        />
        <StatCard
          title="Tips Collected"
          icon="💵"
          statNumber={`$${totalTips.toFixed(2)}`}
          statChange="From completed rides"
          changeType="positive"
        />
        <StatCard
          title="Cancellation Fees"
          icon="⚠️"
          statNumber={`$${totalCancFees.toFixed(2)}`}
          statChange="From cancelled bookings"
          changeType="neutral"
        />
      </GridSection>

      {/* Bookings Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📅 All Bookings"
          description="Search, sort, and manage customer bookings"
        >
          <DataTable
            data={bookings}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by customer, location, or status..."
            emptyMessage="No bookings found. Create your first booking to get started."
            emptyIcon="📅"
            pageSize={10}
            rowClassName={(booking) => booking.status === 'cancelled' ? 'opacity-60' : ''}
            onRowClick={(booking) => console.log('Clicked booking:', booking.id)}
          />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AdminBookingsPage;