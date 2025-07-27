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
  DataTableAction,
  ToastProvider,
  useToast,
  Span
} from '@/components/ui';

function AdminBookingsPageContent() {
  const { addToast } = useToast();
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
      console.log('🔄 Fetching bookings...');
      
      const fetchedBookings = await listBookings();
      console.log('✅ Bookings fetched:', fetchedBookings.length, fetchedBookings);
      
      // If no real bookings exist, use mock data for demonstration
      if (fetchedBookings.length === 0) {
        console.log('📝 No bookings found, using mock data for demonstration');
        const mockBookings: Booking[] = [
          {
            id: 'mock-1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '203-555-0123',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: new Date('2024-12-25T10:00:00Z'),
            passengers: 2,
            fare: 150,
            status: 'confirmed',
            depositPaid: true,
            balanceDue: 50,
            tipAmount: 25,
            cancellationFee: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'mock-2', 
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '203-555-0124',
            pickupLocation: 'Stamford Downtown',
            dropoffLocation: 'LaGuardia Airport',
            pickupDateTime: new Date('2024-12-26T14:30:00Z'),
            passengers: 1,
            fare: 120,
            status: 'pending',
            depositPaid: false,
            balanceDue: 120,
            tipAmount: 0,
            cancellationFee: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'mock-3',
            name: 'Mike Davis',
            email: 'mike@example.com', 
            phone: '203-555-0125',
            pickupLocation: 'Greenwich Harbor',
            dropoffLocation: 'Newark Airport',
            pickupDateTime: new Date('2024-12-24T08:15:00Z'),
            passengers: 3,
            fare: 180,
            status: 'completed',
            depositPaid: true,
            balanceDue: 0,
            tipAmount: 30,
            cancellationFee: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'mock-4',
            name: 'Emily Chen',
            email: 'emily@example.com',
            phone: '203-555-0126',
            pickupLocation: 'Westport Downtown',
            dropoffLocation: 'Bradley Airport',
            pickupDateTime: new Date('2024-12-27T12:00:00Z'),
            passengers: 1,
            fare: 95,
            status: 'cancelled',
            depositPaid: false,
            balanceDue: 0,
            tipAmount: 0,
            cancellationFee: 25,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        setBookings(mockBookings);
      } else {
        setBookings(fetchedBookings);
      }
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      addToast('error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      if (!booking.id) {
        addToast('error', 'Cannot update booking: missing ID');
        return;
      }
      
      await updateBooking(booking.id, { status: newStatus });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
      
      addToast('success', `Booking ${newStatus}`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      addToast('error', 'Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!booking.id) {
      addToast('error', 'Cannot delete booking: missing ID');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the booking for ${booking.name}?`)) {
      return;
    }

    try {
      await deleteBooking(booking.id);
      
      // Update local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      
      addToast('success', 'Booking deleted');
    } catch (err) {
      console.error('Error deleting booking:', err);
      addToast('error', 'Failed to delete booking');
    }
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.fare, 0);
  const totalTips = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.tipAmount || 0), 0);
  const totalCancFees = bookings
    .filter(b => b.status === 'cancelled')
    .reduce((sum, b) => sum + (b.cancellationFee || 0), 0);

  // Header actions
  const headerActions = [
    {
      label: 'Refresh',
      icon: '🔄',
      onClick: fetchBookings,
      variant: 'outline' as const
    },
    {
      label: 'Export',
      icon: '📊',
      onClick: () => addToast('info', 'Export feature coming soon'),
      variant: 'outline' as const
    }
  ];

  // Status renderer
  const renderStatus = (status: string) => {
    const getStatusClass = (status: string) => {
      switch (status.toLowerCase()) {
        case 'confirmed':
          return 'status-badge-confirmed';
        case 'pending':
          return 'status-badge-pending';
        case 'completed':
          return 'status-badge-completed';
        case 'cancelled':
          return 'status-badge-cancelled';
        default:
          return 'status-badge-default';
      }
    };

    return (
      <Span className={`status-badge ${getStatusClass(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Span>
    );
  };

  // Table columns configuration
  const columns: DataTableColumn<Booking>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (_, booking) => (
        <div className="table-cell-content">
          <div className="table-cell-primary">{booking.name}</div>
          <div className="table-cell-secondary">{booking.email}</div>
        </div>
      )
    },
    {
      key: 'pickupLocation',
      label: 'Route',
      sortable: true,
      render: (_, booking) => (
        <div className="table-cell-route">
          <div className="table-cell-primary">{booking.pickupLocation}</div>
          <div className="table-cell-route-arrow">→ {booking.dropoffLocation}</div>
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
          <div className="table-cell-datetime">
            <div className="table-cell-primary">{date.toLocaleDateString()}</div>
            <div className="table-cell-secondary">{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    {
      key: 'fare',
      label: 'Fare',
      sortable: true,
      render: (value) => (
        <Span className="table-cell-amount">${(value || 0).toFixed(2)}</Span>
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
      variant: 'outline',
      condition: (booking) => booking.status !== 'completed' && booking.status !== 'cancelled'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: handleDeleteBooking,
      variant: 'outline'
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
}

const AdminBookingsPage: NextPage = () => {
  return (
    <ToastProvider>
      <AdminBookingsPageContent />
    </ToastProvider>
  );
};

export default AdminBookingsPage;
