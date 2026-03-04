'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteDocument,
  getAllBookings,
  getBookingsByStatus,
  type Booking,
  updateDocument,
} from '@/lib/services/database-service';
import { authFetch } from '@/lib/utils/auth-fetch';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import {
  getAirportFromBooking,
  getBookingFare,
  getCustomerEmail,
  getCustomerName,
  getCustomerPhone,
  getDropoffAddress,
  getPickupAddress,
  getPickupDateTime,
  parseDate,
} from './bookings-utils';

export function useBookings() {
  const { cmsData } = useCMSData();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAirport, setSelectedAirport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionReasonType, setRejectionReasonType] = useState<string>('other');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam) setSelectedStatus(statusParam);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const fetchedBookings =
        selectedStatus === 'all'
          ? await getAllBookings()
          : await getBookingsByStatus(selectedStatus as Booking['status']);

      fetchedBookings.sort((a, b) => {
        const parsedA = parseDate(getPickupDateTime(a));
        const parsedB = parseDate(getPickupDateTime(b));
        if (!parsedA || !parsedB) return 0;
        return parsedA.getTime() - parsedB.getTime();
      });

      setBookings(fetchedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(cmsData?.['error-load-bookings-failed'] || 'Failed to load bookings');
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
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b)));
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const handleResendConfirmation = async (booking: Booking) => {
    try {
      setResendingId(booking.id!);
      setError(null);
      const res = await authFetch('/api/notifications/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Resend failed');
      }
      setSuccessMessage('Confirmation resent.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation');
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    const name = getCustomerName(booking);
    if (!confirm(`Cancel this booking for ${name}? Refund will follow business rules.`)) return;
    try {
      setCancellingId(booking.id!);
      setError(null);
      const res = await authFetch('/api/booking/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, reason: 'Cancelled by admin' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Cancel failed');
      }
      const data = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' as Booking['status'] } : b)));
      if (data.refundAmount != null) {
        setSuccessMessage(`Cancelled. Refund: $${Number(data.refundAmount).toFixed(2)}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!confirm(`Permanently delete the booking for ${getCustomerName(booking)}? This cannot be undone.`)) return;
    try {
      await deleteDocument('bookings', booking.id!);
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    }
  };

  const handleApproveException = async (booking: Booking) => {
    try {
      const updateData = {
        status: 'confirmed' as Booking['status'],
        requiresApproval: false,
        approvedAt: new Date().toISOString(),
      };
      await updateDocument('bookings', booking.id!, updateData);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: 'confirmed' as Booking['status'],
                requiresApproval: false,
                approvedAt: updateData.approvedAt,
              }
            : b
        )
      );
    } catch (err) {
      console.error('Error approving exception booking:', err);
      setError('Failed to approve booking');
    }
  };

  const handleRejectException = async (booking: Booking, reason: string) => {
    try {
      const updateData = {
        status: 'cancelled' as Booking['status'],
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        requiresApproval: false,
      };
      await updateDocument('bookings', booking.id!, updateData);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: 'cancelled' as Booking['status'],
                rejectionReason: reason,
                rejectedAt: updateData.rejectedAt,
                requiresApproval: false,
              }
            : b
        )
      );
      setRejectionModalOpen(false);
      setBookingToReject(null);
      setRejectionReason('');
      setRejectionReasonType('other');
    } catch (err) {
      console.error('Error rejecting exception booking:', err);
      setError('Failed to reject booking');
    }
  };

  const openRejectionModal = (booking: Booking) => {
    setBookingToReject(booking);
    setRejectionModalOpen(true);
  };

  const closeRejectionModal = () => {
    setRejectionModalOpen(false);
    setBookingToReject(null);
    setRejectionReason('');
    setRejectionReasonType('other');
  };

  const handleRejectionConfirm = () => {
    if (!bookingToReject) return;

    let finalReason = rejectionReason;
    if (rejectionReasonType !== 'other') {
      finalReason = rejectionReasonType;
      if (rejectionReason.trim()) finalReason += `: ${rejectionReason}`;
    }

    if (!finalReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    handleRejectException(bookingToReject, finalReason);
  };

  const stats = useMemo(
    () => ({
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
      pendingBookings: bookings.filter((b) => b.status === 'pending' || b.status === 'requires_approval').length,
      totalRevenue: bookings.reduce((sum, b) => sum + getBookingFare(b), 0),
    }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    let filtered = selectedStatus === 'all' ? bookings : bookings.filter((b) => b.status === selectedStatus);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((b) => {
        const name = getCustomerName(b).toLowerCase();
        const email = getCustomerEmail(b).toLowerCase();
        const phone = getCustomerPhone(b).toLowerCase();
        const pickup = getPickupAddress(b).toLowerCase();
        const dropoff = getDropoffAddress(b).toLowerCase();
        const id = (b.id ?? '').toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || pickup.includes(q) || dropoff.includes(q) || id.includes(q);
      });
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      filtered = filtered.filter((b) => {
        const pickup = parseDate(getPickupDateTime(b));
        if (!pickup) return false;
        if (start && pickup < start) return false;
        if (end) {
          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);
          if (pickup > endOfDay) return false;
        }
        return true;
      });
    }

    if (selectedAirport && selectedAirport !== 'all') {
      filtered = filtered.filter((b) => getAirportFromBooking(b) === selectedAirport);
    }

    return filtered;
  }, [bookings, selectedStatus, searchQuery, startDate, endDate, selectedAirport]);

  return {
    bookings,
    filteredBookings,
    loading,
    error,
    successMessage,
    stats,
    selectedStatus,
    setSelectedStatus,
    selectedAirport,
    setSelectedAirport,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resendingId,
    cancellingId,
    rejectionModalOpen,
    bookingToReject,
    rejectionReason,
    setRejectionReason,
    rejectionReasonType,
    setRejectionReasonType,
    closeRejectionModal,
    handleRejectionConfirm,
    actions: {
      handleStatusUpdate,
      handleResendConfirmation,
      handleCancelBooking,
      handleDeleteBooking,
      handleApproveException,
      openRejectionModal,
    },
  };
}
