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
  Badge,
  DataTable,
  Alert,
  LoadingSpinner,
  Container,
} from '@/design/ui';
import { Modal } from '@/design/components/base-components/Modal';
import { Textarea } from '@/design/components/base-components/forms/Textarea';
import { useCMSData } from '@/design/providers/CMSDataProvider';

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
      
      setBookings(fetchedBookings);
      
      if (fetchedBookings.length === 0) {
        console.error('📝 No bookings found in database');
      }
    } catch (err) {
      console.error('❌ Error fetching bookings from database:', err);
      setError(cmsData?.['error-load-bookings-failed'] || 'Failed to load bookings from database');
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
      setError(cmsData?.['error-update-status-failed'] || 'Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      
      await deleteDocument('bookings', booking.id!);
      
      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      
    } catch (err) {
      console.error('❌ Error deleting booking:', err);
      setError(cmsData?.['error-delete-booking-failed'] || 'Failed to delete booking');
    }
  };

  const handleDriverAssignment = async (booking: Booking) => {
    try {
      
      // Get available drivers from API (server-side)
      const response = await fetch('/api/admin/drivers/available');
      if (!response.ok) {
        throw new Error('Failed to fetch available drivers');
      }
      const { drivers: availableDrivers } = await response.json();
      
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
      setError(cmsData?.['error-assign-driver-failed'] || 'Failed to assign driver');
    }
  };

  const handleApproveException = async (booking: Booking) => {
    try {
      const updateData: any = {
        status: 'confirmed' as Booking['status'],
        requiresApproval: false,
        approvedAt: new Date().toISOString(),
      };

      // Try to assign driver if available
      try {
        const response = await fetch('/api/admin/drivers/available');
        if (response.ok) {
          const { drivers: availableDrivers } = await response.json();
          if (availableDrivers.length > 0) {
            const driver = availableDrivers[0];
            updateData.driverId = driver.id;
            updateData.driverName = driver.name;
          }
        }
      } catch (driverError) {
        // If driver assignment fails, continue with approval
        console.warn('Could not assign driver automatically:', driverError);
      }

      await updateDocument('bookings', booking.id!, updateData);
      
      // Log approval action
      console.log('[EXCEPTION_APPROVAL] Booking approved:', {
        bookingId: booking.id,
        customerEmail: booking.email,
        customerName: booking.name,
        timestamp: new Date().toISOString(),
      });

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { 
          ...b, 
          status: 'confirmed' as Booking['status'],
          requiresApproval: false,
          approvedAt: updateData.approvedAt,
          driverId: updateData.driverId,
          driverName: updateData.driverName,
        } : b
      ));
      
    } catch (err) {
      console.error('❌ Error approving exception booking:', err);
      setError(cmsData?.['error-approve-booking-failed'] || 'Failed to approve booking');
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
      
      // Log rejection action
      console.log('[EXCEPTION_REJECTION] Booking rejected:', {
        bookingId: booking.id,
        customerEmail: booking.email,
        customerName: booking.name,
        reason,
        timestamp: new Date().toISOString(),
      });

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { 
          ...b, 
          status: 'cancelled' as Booking['status'],
          rejectionReason: reason,
          rejectedAt: updateData.rejectedAt,
          requiresApproval: false,
        } : b
      ));

      // Close modal and reset state
      setRejectionModalOpen(false);
      setBookingToReject(null);
      setRejectionReason('');
      setRejectionReasonType('other');
      
    } catch (err) {
      console.error('❌ Error rejecting exception booking:', err);
      setError(cmsData?.['error-reject-booking-failed'] || 'Failed to reject booking');
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'requires_approval': return 'warning';
      case 'in-progress': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      case 'requires_approval': return '🔍';
      case 'in-progress': return '🚗';
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

  // Helper to format relative time
  const formatRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Helper to get confirmation status display
  const getConfirmationStatus = (booking: Booking) => {
    const confirmation = (booking as any).confirmation;
    if (!confirmation) {
      return { icon: '❓', text: 'No email', variant: 'default' as const };
    }
    if (confirmation.status === 'confirmed' && confirmation.confirmedAt) {
      return { icon: '✅', text: 'Confirmed', variant: 'success' as const, time: formatRelativeTime(confirmation.confirmedAt) };
    }
    if (confirmation.sentAt) {
      return { icon: '⏳', text: 'Pending', variant: 'warning' as const, time: formatRelativeTime(confirmation.sentAt) };
    }
    return { icon: '❓', text: 'Unknown', variant: 'default' as const };
  };

  const tableData = filteredBookings.map(booking => {
    const confirmStatus = getConfirmationStatus(booking);

    return {
    id: booking.id,
    customer: (
      <Stack spacing="xs">
        <Text variant="body" weight="medium">{booking.name}</Text>
        <Text variant="small" color="secondary">{booking.email}</Text>
        <Text variant="small" color="secondary">{booking.phone}</Text>
      </Stack>
    ),
    emailStatus: (
      <Stack spacing="xs" align="center">
        <Badge variant={confirmStatus.variant}>
          {confirmStatus.icon} {confirmStatus.text}
        </Badge>
        {confirmStatus.time && (
          <Text variant="small" color="secondary">{confirmStatus.time}</Text>
        )}
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
        {booking.exceptionReason && (
          <Text variant="small" color="warning">
            <Text variant="small" weight="medium">Exception:</Text> {booking.exceptionReason}
          </Text>
        )}
        {booking.requiresApproval && (
          <Text variant="small" color="warning" weight="medium">
            ⚠️ Requires Approval
          </Text>
        )}
        {booking.approvedAt && (
          <Text variant="small" color="success">
            ✅ Approved {new Date(booking.approvedAt).toLocaleDateString()}
          </Text>
        )}
        {booking.rejectedAt && (
          <Text variant="small" color="error">
            ❌ Rejected {new Date(booking.rejectedAt).toLocaleDateString()}
            {booking.rejectionReason && `: ${booking.rejectionReason}`}
          </Text>
        )}
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
        {booking.status === 'requires_approval' ? (
          <>
            <Button 
              size="sm" 
              variant="success" 
              onClick={() => handleApproveException(booking)}
              cmsId="table-actions-approve"
              text={cmsData?.['table-actions-approve'] || 'Approve'}
            />
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => openRejectionModal(booking)}
              cmsId="table-actions-reject"
              text={cmsData?.['table-actions-reject'] || 'Reject'}
            />
          </>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => handleStatusUpdate(booking, 'confirmed')}
              disabled={booking.status === 'confirmed'}
              cmsId="table-actions-confirm"
              text={cmsData?.['table-actions-confirm'] || 'Confirm'}
            />
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => handleDriverAssignment(booking)}
              disabled={!!booking.driverId}
              cmsId="table-actions-assign-driver"
              text={cmsData?.['table-actions-assign-driver'] || 'Assign Driver'}
            />
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => handleDeleteBooking(booking)}
              cmsId="table-actions-delete"
              text={cmsData?.['table-actions-delete'] || 'Delete'}
            />
          </>
        )}
      </Stack>
    )
  };
  });

  if (loading) {
    return (
     
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text cmsId="loading-loading-bookings">{cmsData?.['loading-loading-bookings'] || 'Loading bookings from database...'}</Text>
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
        {/* Header with Create Exception Button */}
        <Stack direction="horizontal" spacing="md" justify="space-between" align="center">
          <Text size="2xl" weight="bold" cmsId="admin-bookings-title">
            {cmsData?.['admin-bookings-title'] || 'Bookings'}
          </Text>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/admin/bookings/create-exception'}
            text={cmsData?.['button-create-exception'] || 'Create Exception Booking'}
          />
        </Stack>

        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium" cmsId="filter-title" >
            {cmsData?.['filter-title'] || 'Filter by Status'}
          </Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">{cmsData?.['filter-all-bookings'] || 'All Bookings'}</option>
            <option value="requires_approval">{cmsData?.['filter-requires-approval'] || 'Requires Approval'}</option>
            <option value="pending">{cmsData?.['filter-pending'] || 'Pending'}</option>
            <option value="confirmed">{cmsData?.['filter-confirmed'] || 'Confirmed'}</option>
            <option value="in-progress">{cmsData?.['filter-in-progress'] || 'In Progress'}</option>
            <option value="completed">{cmsData?.['filter-completed'] || 'Completed'}</option>
            <option value="cancelled">{cmsData?.['filter-cancelled'] || 'Cancelled'}</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📋</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-total-bookings" >
                  {cmsData?.['stats-total-bookings'] || 'Total Bookings'}
                </Text>
                <Text size="xl" weight="bold">{stats.totalBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-confirmed" >
                  {cmsData?.['stats-confirmed'] || 'Confirmed'}
                </Text>
                <Text size="xl" weight="bold">{stats.confirmedBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🚗</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-in-progress" >
                  {cmsData?.['stats-in-progress'] || 'In Progress'}
                </Text>
                <Text size="xl" weight="bold">{stats.inProgressBookings}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-total-revenue" >
                  {cmsData?.['stats-total-revenue'] || 'Total Revenue'}
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
              <Text size="lg" weight="medium" cmsId="table-no-bookings-title" >
                {cmsData?.['table-no-bookings-title'] || 'No Bookings Found'}
              </Text>
              <Text variant="body" color="secondary" cmsId="table-no-bookings-description" >
                {cmsData?.['table-no-bookings-description'] || 'No bookings match your current filter criteria.'}
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: cmsData?.['table-columns-customer'] || 'Customer'},
              { key: 'emailStatus', label: cmsData?.['table-columns-email-status'] || 'Email'},
              { key: 'route', label: cmsData?.['table-columns-route'] || 'Route'},
              { key: 'dateTime', label: cmsData?.['table-columns-date-time'] || 'Date & Time'},
              { key: 'status', label: cmsData?.['table-columns-status'] || 'Status'},
              { key: 'fare', label: cmsData?.['table-columns-fare'] || 'Fare'},
              { key: 'actions', label: cmsData?.['table-columns-actions'] || 'Actions'}
            ]}
          />
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
          title={cmsData?.['modal-reject-booking-title'] || 'Reject Exception Booking'}
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
                text={cmsData?.['modal-cancel'] || 'Cancel'}
              />
              <Button
                variant="danger"
                onClick={handleRejectionConfirm}
                text={cmsData?.['modal-confirm-reject'] || 'Confirm Rejection'}
              />
            </Stack>
          }
        >
          <Stack spacing="md">
            <Text variant="body">
              {cmsData?.['modal-reject-booking-description'] || 'Please provide a reason for rejecting this exception booking:'}
            </Text>
            
            <Stack spacing="sm">
              <Text variant="small" weight="medium">
                {cmsData?.['modal-rejection-reason-type'] || 'Reason Type:'}
              </Text>
              <select
                value={rejectionReasonType}
                onChange={(e) => setRejectionReasonType(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="outside_service_area">
                  {cmsData?.['rejection-outside-service-area'] || 'Outside service area'}
                </option>
                <option value="no_driver_availability">
                  {cmsData?.['rejection-no-driver-availability'] || 'No driver availability'}
                </option>
                <option value="customer_request">
                  {cmsData?.['rejection-customer-request'] || 'Customer request'}
                </option>
                <option value="other">
                  {cmsData?.['rejection-other'] || 'Other'}
                </option>
              </select>
            </Stack>

            <Stack spacing="sm">
              <Text variant="small" weight="medium">
                {cmsData?.['modal-rejection-reason-details'] || 'Additional Details:'}
              </Text>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={cmsData?.['modal-rejection-reason-placeholder'] || 'Enter rejection reason details...'}
                rows={4}
                required
              />
            </Stack>

            {bookingToReject && (
              <Box variant="filled" padding="sm">
                <Stack spacing="xs">
                  <Text variant="small" weight="medium">
                    {cmsData?.['modal-booking-details'] || 'Booking Details:'}
                  </Text>
                  <Text variant="small">
                    <Text variant="small" weight="medium">Customer:</Text> {bookingToReject.name} ({bookingToReject.email})
                  </Text>
                  <Text variant="small">
                    <Text variant="small" weight="medium">Route:</Text> {bookingToReject.pickupLocation} → {bookingToReject.dropoffLocation}
                  </Text>
                </Stack>
              </Box>
            )}
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}

const AdminBookingsPage: NextPage = () => {
  return (
    <Suspense fallback={
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
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
