'use client';

export const dynamic = 'force-dynamic';

import { Alert, Button, Container, LoadingSpinner, Stack, Text } from '@/design/ui';
import { BookingFilters } from './BookingFilters';
import { BookingsTable } from './BookingsTable';
import { PageContainer, PageHeader, PageTitle, StatCard, StatLabel, StatsBar, StatValue, BookingsCount } from './bookings-styles';
import { formatCurrency } from './bookings-utils';
import { useBookings } from './useBookings';

export default function AdminBookingsPage() {
  const b = useBookings();
  if (b.loading) return <Container><Stack direction="horizontal" spacing="md" align="center" style={{ padding: '40px 0' }}><LoadingSpinner /><Text>Loading bookings...</Text></Stack></Container>;
  if (b.error) return <Container><Alert variant="error"><Text>{b.error}</Text></Alert></Container>;

  return (
    <Container>
      <PageContainer>
        <PageHeader><PageTitle>Bookings</PageTitle><Button variant="primary" onClick={() => (window.location.href = '/admin/bookings/create-exception')} text="+ Create Exception" /></PageHeader>
        {b.successMessage && <Alert variant="success">{b.successMessage}</Alert>}
        <StatsBar>
          <StatCard><StatValue>{b.stats.totalBookings}</StatValue><StatLabel>Total Bookings</StatLabel></StatCard>
          <StatCard><StatValue>{b.stats.confirmedBookings}</StatValue><StatLabel>Confirmed</StatLabel></StatCard>
          <StatCard><StatValue>{b.stats.pendingBookings}</StatValue><StatLabel>Pending</StatLabel></StatCard>
          <StatCard><StatValue>{formatCurrency(b.stats.totalRevenue)}</StatValue><StatLabel>Total Revenue</StatLabel></StatCard>
        </StatsBar>
        <BookingFilters
          bookings={b.bookings}
          selectedStatus={b.selectedStatus} onStatusChange={b.setSelectedStatus}
          selectedAirport={b.selectedAirport} onAirportChange={b.setSelectedAirport}
          searchQuery={b.searchQuery} onSearchChange={b.setSearchQuery}
          startDate={b.startDate} onStartDateChange={b.setStartDate}
          endDate={b.endDate} onEndDateChange={b.setEndDate}
        />
        <BookingsCount>Showing {b.filteredBookings.length} booking{b.filteredBookings.length !== 1 ? 's' : ''}</BookingsCount>
        <BookingsTable
          bookings={b.filteredBookings}
          resendingId={b.resendingId} cancellingId={b.cancellingId}
          rejectionModalOpen={b.rejectionModalOpen} bookingToReject={b.bookingToReject}
          rejectionReason={b.rejectionReason} onRejectionReasonChange={b.setRejectionReason}
          rejectionReasonType={b.rejectionReasonType} onRejectionReasonTypeChange={b.setRejectionReasonType}
          onCloseRejectionModal={b.closeRejectionModal} onConfirmRejection={b.handleRejectionConfirm}
          onStatusUpdate={b.actions.handleStatusUpdate} onResendConfirmation={b.actions.handleResendConfirmation}
          onCancelBooking={b.actions.handleCancelBooking} onDeleteBooking={b.actions.handleDeleteBooking}
          onApproveException={b.actions.handleApproveException} onOpenRejectionModal={b.actions.openRejectionModal}
        />
      </PageContainer>
    </Container>
  );
}
