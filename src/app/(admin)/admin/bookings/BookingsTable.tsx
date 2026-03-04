'use client';

import Link from 'next/link';
import { Box, Button, Stack, Text } from '@/design/ui';
import { Modal } from '@/design/components/base-components/Modal';
import { Textarea } from '@/design/components/base-components/forms/Textarea';
import {
  ActionButtons,
  BookingCard,
  BookingDetails,
  BookingFooter,
  BookingHeader,
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
  LocationRow,
  LocationText,
  PickupIcon,
  RouteDisplay,
  StatusBadge,
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
} from './bookings-utils';
import type { Booking } from '@/lib/services/database-service';

interface BookingsTableProps {
  bookings: Booking[];
  resendingId: string | null;
  cancellingId: string | null;
  rejectionModalOpen: boolean;
  bookingToReject: Booking | null;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  rejectionReasonType: string;
  onRejectionReasonTypeChange: (value: string) => void;
  onCloseRejectionModal: () => void;
  onConfirmRejection: () => void;
  onStatusUpdate: (booking: Booking, newStatus: Booking['status']) => Promise<void>;
  onResendConfirmation: (booking: Booking) => Promise<void>;
  onCancelBooking: (booking: Booking) => Promise<void>;
  onDeleteBooking: (booking: Booking) => Promise<void>;
  onApproveException: (booking: Booking) => Promise<void>;
  onOpenRejectionModal: (booking: Booking) => void;
}

export function BookingsTable({
  bookings,
  resendingId,
  cancellingId,
  rejectionModalOpen,
  bookingToReject,
  rejectionReason,
  onRejectionReasonChange,
  rejectionReasonType,
  onRejectionReasonTypeChange,
  onCloseRejectionModal,
  onConfirmRejection,
  onStatusUpdate,
  onResendConfirmation,
  onCancelBooking,
  onDeleteBooking,
  onApproveException,
  onOpenRejectionModal,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState>
        <Text size="xl" style={{ marginBottom: '8px' }}>
          📭
        </Text>
        <Text size="lg" weight="medium">
          No bookings found
        </Text>
        <Text color="secondary">No bookings match the selected filter.</Text>
      </EmptyState>
    );
  }

  return (
    <>
      <BookingsList>
        {bookings.map((booking) => {
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
                <span>Payment: {depositPaid ? '✓ Deposit paid' : balance > 0 ? `Balance ${formatCurrency(balance)}` : 'Unpaid'}</span>
                <span>Confirmation: {getConfirmationSent(booking) ? '✓ Sent' : '—'}</span>
                {getAirportFromBooking(booking) && <span>Airport: {getAirportFromBooking(booking)}</span>}
              </div>

              <BookingFooter>
                <ActionButtons>
                  {booking.status === 'requires_approval' ? (
                    <>
                      <Button size="sm" variant="success" onClick={() => onApproveException(booking)} text="✓ Approve" />
                      <Button size="sm" variant="danger" onClick={() => onOpenRejectionModal(booking)} text="✗ Reject" />
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
                          onClick={() => onResendConfirmation(booking)}
                          disabled={resendingId === booking.id}
                          text={resendingId === booking.id ? 'Sending…' : 'Resend confirm'}
                        />
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          text={cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                        />
                      )}
                      {booking.status === 'pending' && (
                        <Button size="sm" variant="success" onClick={() => onStatusUpdate(booking, 'confirmed')} text="✓ Confirm" />
                      )}
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <Button size="sm" variant="secondary" onClick={() => onStatusUpdate(booking, 'completed')} text="Mark Complete" />
                      )}
                      <Button size="sm" variant="outline" onClick={() => onDeleteBooking(booking)} text="Delete" />
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

      <Modal
        isOpen={rejectionModalOpen}
        onClose={onCloseRejectionModal}
        title="Reject Booking"
        size="md"
        footer={
          <Stack direction="horizontal" spacing="sm" justify="flex-end">
            <Button variant="secondary" onClick={onCloseRejectionModal} text="Cancel" />
            <Button variant="danger" onClick={onConfirmRejection} text="Confirm Rejection" />
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
              onChange={(e) => onRejectionReasonTypeChange(e.target.value)}
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
            <Textarea value={rejectionReason} onChange={(e) => onRejectionReasonChange(e.target.value)} placeholder="Enter details..." rows={3} />
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
    </>
  );
}
