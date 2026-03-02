'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Container,
  Input,
  LoadingSpinner,
  Stack,
  Text,
} from '@/design/ui';
import { Modal } from '@/design/components/base-components/Modal';
import { Textarea } from '@/design/components/base-components/forms/Textarea';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import {
  deleteDocument,
  getAllBookings,
  getBookingsByStatus,
  type Booking,
  updateDocument,
} from '@/lib/services/database-service';
import { authFetch } from '@/lib/utils/auth-fetch';
import {
  AIRPORTS,
  ActionButtons,
  BookingCard,
  BookingDetails,
  BookingFooter,
  BookingHeader,
  BookingsCount,
  BookingsList,
  CustomerContact,
  CustomerInfo,
  CustomerName,
  DetailLabel,
  DetailSection,
  DetailValue,
  DropoffIcon,
  EmptyState,
  FareAmount,
  FareDisplay,
  FareStatus,
  FilterBar,
  FilterButton,
  LocationRow,
  LocationText,
  PageContainer,
  PageHeader,
  PageTitle,
  PickupIcon,
  RouteDisplay,
  StatCard,
  StatLabel,
  StatsBar,
  StatusBadge,
  StatValue,
} from './bookings-styles';
import {
  formatCurrency,
  formatDate,
  getAirportFromBooking,
  getBalanceDue,
  getBookingFare,
  getConfirmationSent,
  getCustomerEmail,
  getCustomerName,
  getCustomerPhone,
  getDepositPaid,
  getDropoffAddress,
  getPickupAddress,
  getPickupDateTime,
  getStatusIcon,
  getStatusLabel,
  parseDate,
} from './bookings-utils';

function AdminBookingsPageContent() {
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
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' as Booking['status'] } : b))
      );
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

  const handleRejectionConfirm = () => {
    if (!bookingToReject) return;

    let finalReason = rejectionReason;
    if (rejectionReasonType !== 'other') {
      finalReason = rejectionReasonType;
      if (rejectionReason.trim()) {
        finalReason += `: ${rejectionReason}`;
      }
    }

    if (!finalReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    handleRejectException(bookingToReject, finalReason);
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    pendingBookings: bookings.filter((b) => b.status === 'pending' || b.status === 'requires_approval').length,
    totalRevenue: bookings.reduce((sum, b) => sum + getBookingFare(b), 0),
  };

  let filteredBookings = selectedStatus === 'all' ? bookings : bookings.filter((b) => b.status === selectedStatus);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredBookings = filteredBookings.filter((b) => {
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
    filteredBookings = filteredBookings.filter((b) => {
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
    filteredBookings = filteredBookings.filter((b) => getAirportFromBooking(b) === selectedAirport);
  }

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center" style={{ padding: '40px 0' }}>
          <LoadingSpinner />
          <Text>Loading bookings...</Text>
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
      <PageContainer>
        <PageHeader>
          <PageTitle>Bookings</PageTitle>
          <Button variant="primary" onClick={() => (window.location.href = '/admin/bookings/create-exception')} text="+ Create Exception" />
        </PageHeader>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <StatsBar>
          <StatCard>
            <StatValue>{stats.totalBookings}</StatValue>
            <StatLabel>Total Bookings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.confirmedBookings}</StatValue>
            <StatLabel>Confirmed</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pendingBookings}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatCard>
        </StatsBar>

        <FilterBar>
          <FilterButton $active={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')}>
            All ({bookings.length})
          </FilterButton>
          <FilterButton $active={selectedStatus === 'pending'} onClick={() => setSelectedStatus('pending')}>
            Pending ({bookings.filter((b) => b.status === 'pending').length})
          </FilterButton>
          <FilterButton $active={selectedStatus === 'confirmed'} onClick={() => setSelectedStatus('confirmed')}>
            Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
          </FilterButton>
          <FilterButton $active={selectedStatus === 'requires_approval'} onClick={() => setSelectedStatus('requires_approval')}>
            Needs Approval ({bookings.filter((b) => b.status === 'requires_approval').length})
          </FilterButton>
          <FilterButton $active={selectedStatus === 'completed'} onClick={() => setSelectedStatus('completed')}>
            Completed ({bookings.filter((b) => b.status === 'completed').length})
          </FilterButton>
          <div style={{ flexGrow: 1 }} />
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
            aria-label="Filter by airport"
          >
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.label}
              </option>
            ))}
          </select>
          <Input
            type="search"
            placeholder="Search name, email, phone, route, ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Start date" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="End date" />
        </FilterBar>

        <BookingsCount>
          Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
        </BookingsCount>

        {filteredBookings.length === 0 ? (
          <EmptyState>
            <Text size="xl" style={{ marginBottom: '8px' }}>
              📭
            </Text>
            <Text size="lg" weight="medium">
              No bookings found
            </Text>
            <Text color="secondary">No bookings match the selected filter.</Text>
          </EmptyState>
        ) : (
          <BookingsList>
            {filteredBookings.map((booking) => {
              const fare = getBookingFare(booking);
              const depositPaid = getDepositPaid(booking);
              const balance = getBalanceDue(booking);
              const isException = booking.requiresApproval;

              return (
                <BookingCard key={booking.id} $isException={isException}>
                  <BookingHeader>
                    <CustomerInfo>
                      <CustomerName>
                        <Link href={`/booking/${booking.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {getCustomerName(booking)}
                        </Link>
                      </CustomerName>
                      <CustomerContact>
                        {getCustomerPhone(booking) && <a href={`tel:${getCustomerPhone(booking)}`}>{getCustomerPhone(booking)}</a>}
                        {getCustomerPhone(booking) && getCustomerEmail(booking) && ' • '}
                        {getCustomerEmail(booking) && <a href={`mailto:${getCustomerEmail(booking)}`}>{getCustomerEmail(booking)}</a>}
                      </CustomerContact>
                    </CustomerInfo>
                    <StatusBadge $variant={booking.status}>
                      {getStatusIcon(booking.status)} {getStatusLabel(booking.status)}
                    </StatusBadge>
                  </BookingHeader>

                  <BookingDetails>
                    <DetailSection>
                      <DetailLabel>Pickup Date & Time</DetailLabel>
                      <DetailValue>{formatDate(getPickupDateTime(booking))}</DetailValue>
                      {booking.flightNumber && (
                        <Text variant="small" color="secondary" style={{ marginTop: '4px' }}>
                          ✈️ Flight: {booking.flightNumber}
                        </Text>
                      )}
                    </DetailSection>

                    <DetailSection>
                      <DetailLabel>Route</DetailLabel>
                      <RouteDisplay>
                        <LocationRow>
                          <PickupIcon>P</PickupIcon>
                          <LocationText>{getPickupAddress(booking) || 'No pickup address'}</LocationText>
                        </LocationRow>
                        <LocationRow>
                          <DropoffIcon>D</DropoffIcon>
                          <LocationText>{getDropoffAddress(booking) || 'No dropoff address'}</LocationText>
                        </LocationRow>
                      </RouteDisplay>
                    </DetailSection>
                  </BookingDetails>

                  <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: '#6b7280' }}>
                    <span>Payment: {getDepositPaid(booking) ? '✓ Deposit paid' : balance > 0 ? `Balance ${formatCurrency(balance)}` : 'Unpaid'}</span>
                    <span>Confirmation: {getConfirmationSent(booking) ? '✓ Sent' : '—'}</span>
                    {getAirportFromBooking(booking) && <span>Airport: {getAirportFromBooking(booking)}</span>}
                  </div>

                  <BookingFooter>
                    <ActionButtons>
                      {booking.status === 'requires_approval' ? (
                        <>
                          <Button size="sm" variant="success" onClick={() => handleApproveException(booking)} text="✓ Approve" />
                          <Button size="sm" variant="danger" onClick={() => openRejectionModal(booking)} text="✗ Reject" />
                        </>
                      ) : (
                        <>
                          <Link href={`/booking/${booking.id}`}>
                            <Button size="sm" variant="outline" text="View" />
                          </Link>
                          {booking.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendConfirmation(booking)}
                              disabled={resendingId === booking.id}
                              text={resendingId === booking.id ? 'Sending…' : 'Resend confirm'}
                            />
                          )}
                          {booking.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleCancelBooking(booking)}
                              disabled={cancellingId === booking.id}
                              text={cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                            />
                          )}
                          {booking.status === 'pending' && (
                            <Button size="sm" variant="success" onClick={() => handleStatusUpdate(booking, 'confirmed')} text="✓ Confirm" />
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(booking, 'completed')} text="Mark Complete" />
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDeleteBooking(booking)} text="Delete" />
                        </>
                      )}
                    </ActionButtons>

                    <FareDisplay>
                      <FareAmount>{formatCurrency(fare)}</FareAmount>
                      <FareStatus $paid={depositPaid}>
                        {depositPaid ? '✓ Deposit Paid' : balance > 0 ? `Balance: ${formatCurrency(balance)}` : 'Unpaid'}
                      </FareStatus>
                    </FareDisplay>
                  </BookingFooter>
                </BookingCard>
              );
            })}
          </BookingsList>
        )}

        <Modal
          isOpen={rejectionModalOpen}
          onClose={() => {
            setRejectionModalOpen(false);
            setBookingToReject(null);
            setRejectionReason('');
            setRejectionReasonType('other');
          }}
          title="Reject Booking"
          size="md"
          footer={
            <Stack direction="horizontal" spacing="sm" justify="flex-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectionModalOpen(false);
                  setBookingToReject(null);
                  setRejectionReason('');
                  setRejectionReasonType('other');
                }}
                text="Cancel"
              />
              <Button variant="danger" onClick={handleRejectionConfirm} text="Confirm Rejection" />
            </Stack>
          }
        >
          <Stack spacing="md">
            <Text variant="body">Please provide a reason for rejecting this booking:</Text>

            <Stack spacing="sm">
              <Text variant="small" weight="medium">
                Reason Type:
              </Text>
              <select
                value={rejectionReasonType}
                onChange={(e) => setRejectionReasonType(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="outside_service_area">Outside service area</option>
                <option value="no_driver_availability">No driver availability</option>
                <option value="customer_request">Customer request</option>
                <option value="other">Other</option>
              </select>
            </Stack>

            <Stack spacing="sm">
              <Text variant="small" weight="medium">
                Additional Details:
              </Text>
              <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter details..." rows={3} />
            </Stack>

            {bookingToReject && (
              <Box variant="filled" padding="sm">
                <Stack spacing="xs">
                  <Text variant="small" weight="medium">
                    Booking Details:
                  </Text>
                  <Text variant="small">
                    <strong>Customer:</strong> {getCustomerName(bookingToReject)}
                  </Text>
                  <Text variant="small">
                    <strong>Route:</strong> {getPickupAddress(bookingToReject)} → {getDropoffAddress(bookingToReject)}
                  </Text>
                </Stack>
              </Box>
            )}
          </Stack>
        </Modal>
      </PageContainer>
    </Container>
  );
}

const AdminBookingsPage: NextPage = () => {
  return (
    <Suspense
      fallback={
        <Container>
          <Stack direction="horizontal" spacing="md" align="center" style={{ padding: '40px 0' }}>
            <LoadingSpinner />
            <Text>Loading admin bookings...</Text>
          </Stack>
        </Container>
      }
    >
      <AdminBookingsPageContent />
    </Suspense>
  );
};

export default AdminBookingsPage;
