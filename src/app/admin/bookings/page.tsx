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
  useToast
} from '@/components/ui';
import { Button } from '@/components/ui/button';


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
            pickupLocation: 'Westport Center',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: new Date('2024-12-27T16:45:00Z'),
            passengers: 2,
            fare: 165,
            status: 'cancelled',
            depositPaid: true,
            balanceDue: 0,
            tipAmount: 0,
            cancellationFee: 50,
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
      setError(`Failed to load bookings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Still show mock data even on error so we can test the interface
      console.log('📝 Using mock data due to error');
      const mockBookings: Booking[] = [
        {
          id: 'demo-1',
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '203-555-DEMO',
          pickupLocation: 'Demo Location',
          dropoffLocation: 'Demo Destination', 
          pickupDateTime: new Date(),
          passengers: 1,
          fare: 100,
          status: 'pending',
          depositPaid: false,
          balanceDue: 100,
          tipAmount: 0,
          cancellationFee: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    if (!booking.id) {
      addToast('error', 'Cannot update booking: missing ID');
      return;
    }
    
    try {
      await updateBooking(booking.id, { status: newStatus });
      addToast('success', `Booking status updated to ${newStatus}`);
      await fetchBookings(); // Refresh data
    } catch (err) {
      console.error('Error updating booking:', err);
      addToast('error', 'Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!booking.id) {
      addToast('error', 'Cannot delete booking: missing ID');
      return;
    }
    
    // Use window.confirm for now - can be enhanced with a proper modal later
    if (!window.confirm(`Are you sure you want to delete booking for ${booking.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteBooking(booking.id);
      addToast('success', `Booking for ${booking.name} has been deleted`);
      await fetchBookings(); // Refresh data
    } catch (err) {
      console.error('Error deleting booking:', err);
      addToast('error', 'Failed to delete booking');
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
      onClick: () => addToast('info', 'Export functionality coming soon'),
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
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'pending':
          return {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fcd34d'
          };
        case 'confirmed':
          return {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #60a5fa'
          };
        case 'completed':
          return {
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #4ade80'
          };
        case 'cancelled':
          return {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #f87171'
          };
        default:
          return {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db'
          };
      }
    };

    return (
      <span
        style={{
          ...getStatusStyle(status),
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '500',
          display: 'inline-block'
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
}

const AdminBookingsPage: NextPage = () => {
  return (
    <ToastProvider>
      <AdminBookingsPageContent />
    </ToastProvider>
  );
