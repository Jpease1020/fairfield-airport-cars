'use client';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { NextPage } from 'next';
import { getAllBookings, getBookingsByStatus, updateDocument, deleteDocument, type Booking } from '@/lib/services/database-service';
import {
  Stack,
  Text,
  Button,
  Box,
  Alert,
  LoadingSpinner,
  Container,
} from '@/design/ui';
import { Modal } from '@/design/components/base-components/Modal';
import { Textarea } from '@/design/components/base-components/forms/Textarea';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import styled from 'styled-components';

// Styled components for the booking cards
const BookingCard = styled.div<{ $isException?: boolean }>`
  background: white;
  border: 1px solid ${props => props.$isException ? '#f59e0b' : '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  ${props => props.$isException && `
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
  `}
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const CustomerInfo = styled.div`
  flex: 1;
`;

const CustomerName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const CustomerContact = styled.div`
  font-size: 14px;
  color: #6b7280;

  a {
    color: #2563eb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatusBadge = styled.span<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  ${props => {
    switch (props.$variant) {
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'confirmed':
        return 'background: #d1fae5; color: #065f46;';
      case 'completed':
        return 'background: #dbeafe; color: #1e40af;';
      case 'cancelled':
        return 'background: #fee2e2; color: #991b1b;';
      case 'in-progress':
        return 'background: #e0e7ff; color: #3730a3;';
      case 'requires_approval':
        return 'background: #fef3c7; color: #92400e; border: 1px dashed #f59e0b;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailSection = styled.div``;

const DetailLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 15px;
  color: #111827;
`;

const RouteDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const LocationIcon = styled.span`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  flex-shrink: 0;
`;

const PickupIcon = styled(LocationIcon)`
  background: #d1fae5;
  color: #065f46;
`;

const DropoffIcon = styled(LocationIcon)`
  background: #fee2e2;
  color: #991b1b;
`;

const LocationText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
`;

const BookingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const FareDisplay = styled.div`
  text-align: right;
`;

const FareAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const FareStatus = styled.div<{ $paid?: boolean }>`
  font-size: 12px;
  color: ${props => props.$paid ? '#065f46' : '#dc2626'};
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageContainer = styled.div`
  padding: 24px 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$active ? '#2563eb' : '#e5e7eb'};
  background: ${props => props.$active ? '#2563eb' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};

  &:hover {
    border-color: #2563eb;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const BookingsCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
`;

function AdminBookingsPageContent() {
  const { cmsData } = useCMSData();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Check for status filter in URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, []);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionReasonType, setRejectionReasonType] = useState<string>('other');

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

      // Sort by pickup date (upcoming first)
      fetchedBookings.sort((a, b) => {
        const dateA = getPickupDateTime(a);
        const dateB = getPickupDateTime(b);
        const parsedA = parseDate(dateA);
        const parsedB = parseDate(dateB);
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
      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to delete the booking for ${getCustomerName(booking)}?`)) {
      return;
    }
    try {
      await deleteDocument('bookings', booking.id!);
      setBookings(prev => prev.filter(b => b.id !== booking.id));
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    }
  };

  const handleApproveException = async (booking: Booking) => {
    try {
      const updateData: Record<string, any> = {
        status: 'confirmed' as Booking['status'],
        requiresApproval: false,
        approvedAt: new Date().toISOString(),
      };

      await updateDocument('bookings', booking.id!, updateData);

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? {
          ...b,
          status: 'confirmed' as Booking['status'],
          requiresApproval: false,
          approvedAt: updateData.approvedAt,
        } : b
      ));
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

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? {
          ...b,
          status: 'cancelled' as Booking['status'],
          rejectionReason: reason,
          rejectedAt: updateData.rejectedAt,
          requiresApproval: false,
        } : b
      ));

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

  // Helper functions
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') return dateValue.toDate();
    if (typeof dateValue === 'object' && '_seconds' in dateValue) return new Date(dateValue._seconds * 1000);
    if (typeof dateValue === 'object' && 'seconds' in dateValue) return new Date(dateValue.seconds * 1000);
    if (typeof dateValue === 'number') return new Date(dateValue);
    return null;
  };

  const formatDate = (dateValue: any) => {
    const date = parseDate(dateValue);
    if (!date) return 'No date set';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBookingFare = (booking: Booking): number => {
    return (booking as any).trip?.fare ?? booking.fare ?? 0;
  };

  const getCustomerName = (booking: Booking): string => {
    return (booking as any).customer?.name ?? booking.name ?? 'Unknown';
  };

  const getCustomerEmail = (booking: Booking): string => {
    return (booking as any).customer?.email ?? booking.email ?? '';
  };

  const getCustomerPhone = (booking: Booking): string => {
    return (booking as any).customer?.phone ?? booking.phone ?? '';
  };

  const getPickupAddress = (booking: Booking): string => {
    return (booking as any).trip?.pickup?.address ?? booking.pickupLocation ?? '';
  };

  const getDropoffAddress = (booking: Booking): string => {
    return (booking as any).trip?.dropoff?.address ?? booking.dropoffLocation ?? '';
  };

  const getPickupDateTime = (booking: Booking): any => {
    return (booking as any).trip?.pickupDateTime ?? booking.pickupDateTime;
  };

  const getBalanceDue = (booking: Booking): number => {
    return (booking as any).payment?.balanceDue ?? booking.balanceDue ?? 0;
  };

  const getDepositPaid = (booking: Booking): boolean => {
    return (booking as any).payment?.depositPaid ?? booking.depositPaid ?? false;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      case 'requires_approval': return '⚠️';
      case 'in-progress': return '🚗';
      default: return '📋';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'requires_approval': return 'Needs Approval';
      case 'in-progress': return 'In Progress';
      default: return status;
    }
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending' || b.status === 'requires_approval').length,
    totalRevenue: bookings.reduce((sum, b) => sum + getBookingFare(b), 0)
  };

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === selectedStatus);

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
        {/* Header */}
        <PageHeader>
          <PageTitle>Bookings</PageTitle>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/admin/bookings/create-exception'}
            text="+ Create Exception"
          />
        </PageHeader>

        {/* Stats */}
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

        {/* Filter Buttons */}
        <FilterBar>
          <FilterButton
            $active={selectedStatus === 'all'}
            onClick={() => setSelectedStatus('all')}
          >
            All ({bookings.length})
          </FilterButton>
          <FilterButton
            $active={selectedStatus === 'pending'}
            onClick={() => setSelectedStatus('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </FilterButton>
          <FilterButton
            $active={selectedStatus === 'confirmed'}
            onClick={() => setSelectedStatus('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </FilterButton>
          <FilterButton
            $active={selectedStatus === 'requires_approval'}
            onClick={() => setSelectedStatus('requires_approval')}
          >
            Needs Approval ({bookings.filter(b => b.status === 'requires_approval').length})
          </FilterButton>
          <FilterButton
            $active={selectedStatus === 'completed'}
            onClick={() => setSelectedStatus('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </FilterButton>
        </FilterBar>

        {/* Bookings Count */}
        <BookingsCount>
          Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
        </BookingsCount>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState>
            <Text size="xl" style={{ marginBottom: '8px' }}>📭</Text>
            <Text size="lg" weight="medium">No bookings found</Text>
            <Text color="secondary">No bookings match the selected filter.</Text>
          </EmptyState>
        ) : (
          <BookingsList>
            {filteredBookings.map(booking => {
              const fare = getBookingFare(booking);
              const depositPaid = getDepositPaid(booking);
              const balance = getBalanceDue(booking);
              const isException = booking.requiresApproval;

              return (
                <BookingCard key={booking.id} $isException={isException}>
                  {/* Header */}
                  <BookingHeader>
                    <CustomerInfo>
                      <CustomerName>{getCustomerName(booking)}</CustomerName>
                      <CustomerContact>
                        {getCustomerPhone(booking) && (
                          <a href={`tel:${getCustomerPhone(booking)}`}>{getCustomerPhone(booking)}</a>
                        )}
                        {getCustomerPhone(booking) && getCustomerEmail(booking) && ' • '}
                        {getCustomerEmail(booking) && (
                          <a href={`mailto:${getCustomerEmail(booking)}`}>{getCustomerEmail(booking)}</a>
                        )}
                      </CustomerContact>
                    </CustomerInfo>
                    <StatusBadge $variant={booking.status}>
                      {getStatusIcon(booking.status)} {getStatusLabel(booking.status)}
                    </StatusBadge>
                  </BookingHeader>

                  {/* Details */}
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

                  {/* Footer */}
                  <BookingFooter>
                    <ActionButtons>
                      {booking.status === 'requires_approval' ? (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApproveException(booking)}
                            text="✓ Approve"
                          />
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openRejectionModal(booking)}
                            text="✗ Reject"
                          />
                        </>
                      ) : (
                        <>
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusUpdate(booking, 'confirmed')}
                              text="✓ Confirm"
                            />
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStatusUpdate(booking, 'completed')}
                              text="Mark Complete"
                            />
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBooking(booking)}
                            text="Delete"
                          />
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

        {/* Rejection Reason Modal */}
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
              <Button
                variant="danger"
                onClick={handleRejectionConfirm}
                text="Confirm Rejection"
              />
            </Stack>
          }
        >
          <Stack spacing="md">
            <Text variant="body">
              Please provide a reason for rejecting this booking:
            </Text>

            <Stack spacing="sm">
              <Text variant="small" weight="medium">Reason Type:</Text>
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
              <Text variant="small" weight="medium">Additional Details:</Text>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter details..."
                rows={3}
              />
            </Stack>

            {bookingToReject && (
              <Box variant="filled" padding="sm">
                <Stack spacing="xs">
                  <Text variant="small" weight="medium">Booking Details:</Text>
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
    <Suspense fallback={
      <Container>
        <Stack direction="horizontal" spacing="md" align="center" style={{ padding: '40px 0' }}>
          <LoadingSpinner />
          <Text>Loading admin bookings...</Text>
        </Stack>
      </Container>
    }>
      <AdminBookingsPageContent />
    </Suspense>
  );
};

export default AdminBookingsPage;
