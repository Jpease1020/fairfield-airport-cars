'use client';

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { Booking } from '@/types/booking';
import { listBookings, updateBooking, deleteBooking } from '@/lib/booking-service';
import withAuth from '../withAuth';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { DataTable } from '@/components/data';
import { StatusBadge } from '@/components/data';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms';
import { Card, CardContent } from '@/components/ui/card';

const AdminBookingsPage: NextPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'all'>('all');
  const [sortConfig] = useState<{ key: keyof Booking; direction: 'ascending' | 'descending' } | null>({ key: 'pickupDateTime', direction: 'ascending' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await listBookings();
      setBookings(bookingsData);
    } catch {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sortedAndFilteredBookings = useMemo(() => {
    let sortableItems = [...bookings];
    if (filterStatus !== 'all') {
      sortableItems = sortableItems.filter(booking => booking.status === filterStatus);
    }
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue && bValue && aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue && bValue && aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [bookings, filterStatus, sortConfig]);

  // Sorting is handled by the DataTable component

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      fetchBookings();
    } catch {
      setError('Failed to update booking status.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(bookingId);
        fetchBookings();
      } catch {
        setError('Failed to cancel booking.');
      }
    }
  };

  const handleSendFeedbackRequest = async (bookingId: string) => {
    try {
      const response = await fetch('/api/send-feedback-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (response.ok) {
        alert('Feedback request sent successfully!');
      } else {
        throw new Error('Failed to send feedback request.');
      }
    } catch {
      setError('Failed to send feedback request.');
    }
  };

  const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + (b.fare || 0) + (b.tipAmount || 0) - (b.cancellationFee || 0), 0), [bookings]);
  const totalTips = useMemo(()=> bookings.reduce((s,b)=> s + (b.tipAmount||0),0),[bookings]);
  const totalCancFees = useMemo(()=> bookings.reduce((s,b)=> s + (b.cancellationFee||0),0),[bookings]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading bookings..." />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </PageContainer>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (booking: Booking) => (
        <div>
          <div className="font-medium">{booking.name}</div>
          <div className="text-sm text-gray-600">{booking.email}</div>
          <div className="text-sm text-gray-600">{booking.phone}</div>
        </div>
      ),
    },
    {
      key: 'locations',
      label: 'Pickup / Drop-off',
      render: (booking: Booking) => (
        <div>
          <div className="text-sm">{booking.pickupLocation}</div>
          <div className="text-sm text-gray-600">{booking.dropoffLocation}</div>
        </div>
      ),
    },
    {
      key: 'pickupDateTime',
      label: 'Date & Time',
      render: (booking: Booking) => formatDateTime(booking.pickupDateTime),
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking: Booking) => <StatusBadge status={booking.status} />,
      sortable: true,
    },
    {
      key: 'fare',
      label: 'Fare',
      render: (booking: Booking) => formatPrice(booking.fare),
      sortable: true,
    },
    {
      key: 'tipAmount',
      label: 'Tip',
      render: (booking: Booking) => formatPrice(booking.tipAmount || 0),
    },
    {
      key: 'cancellationFee',
      label: 'Cancel Fee',
      render: (booking: Booking) => formatPrice(booking.cancellationFee || 0),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (booking: Booking) => (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <SelectField
            label=""
            value={booking.status}
            onChange={(e) => {
              if (booking.id) {
                handleStatusChange(booking.id, e.target.value as Booking['status']);
              }
            }}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                if (booking.id) {
                  handleCancelBooking(booking.id);
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (booking.id) {
                  handleSendFeedbackRequest(booking.id);
                }
              }}
            >
              Feedback
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer className="bg-[#f2efef]">
      <PageHeader 
        title="Booking Dashboard" 
        subtitle={`Month-to-date revenue: ${formatPrice(totalRevenue)} | Tips: ${formatPrice(totalTips)} | Cancellation fees: ${formatPrice(totalCancFees)}`}
      />
      <PageContent>
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <SelectField
                label="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Booking['status'] | 'all')}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
            
            <DataTable
              data={sortedAndFilteredBookings}
              columns={columns}
              loading={loading}
              emptyMessage={<span className="text-gray-100">No bookings found</span>}
            />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default withAuth(AdminBookingsPage);