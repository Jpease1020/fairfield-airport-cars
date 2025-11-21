'use client';

import React from 'react';
import styled from 'styled-components';
import { Box, Stack, Text, Button } from '@/design/ui';
import { colors } from '@/design/system/tokens/tokens';

const Divider = styled.div`
  height: 1px;
  background-color: ${colors.border.default};
  margin: 0.5rem 0;
`;

interface BookingSuccessConfirmationProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number | null;
  tipAmount: number;
  depositAmount: number | null;
  completedBookingId: string | null;
  cmsData: any;
  warning?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const BookingSuccessConfirmation: React.FC<BookingSuccessConfirmationProps> = ({
  pickupLocation,
  dropoffLocation,
  pickupDateTime,
  fare,
  tipAmount,
  depositAmount,
  completedBookingId,
  cmsData,
  warning,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  return (
    <Box variant="elevated" padding="xl" data-testid="booking-success-confirmation">
      <Stack spacing="xl" align="center">
        <Text size="3xl" weight="bold" color="primary" cmsId="booking-confirmed-title">
          {cmsData?.['booking-confirmed-title'] || 'Confirm Your Booking'}
        </Text>

        <Text
          size="md"
          weight="medium"
          align="center"
          color="warning"
          cmsId="booking-confirmed-warning"
          data-testid="booking-confirmation-warning"
        >
          {cmsData?.['booking-confirmed-warning'] ||
            'Check your email and click the confirmation link to finalize your booking.'}
        </Text>

        {warning && (
          <Text size="md" align="center" color="warning" data-testid="booking-success-warning">
            {warning}
          </Text>
        )}

        <Text size="lg" align="center" cmsId="booking-confirmed-description">
          {cmsData?.['booking-confirmed-description'] ||
            `We’re holding your ride from ${pickupLocation} to ${dropoffLocation}. Finish confirmation via the email in your inbox.`}
        </Text>

        <Box variant="outlined" padding="lg" data-testid="booking-details-summary">
          <Stack spacing="md">
            {/* Customer Information */}
            {(customerName || customerEmail || customerPhone) && (
              <>
                <Text weight="bold" size="md" cmsId="booking-detail-customer-section">
                  {cmsData?.['booking-detail-customer-section'] || 'Your Information'}
                </Text>
                {customerName && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium" cmsId="booking-detail-name">{cmsData?.['booking-detail-name'] || 'Name:'}</Text>
                    <Text cmsId="customer-name-value">{customerName}</Text>
                  </Stack>
                )}
                {customerEmail && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium" cmsId="booking-detail-email">{cmsData?.['booking-detail-email'] || 'Email:'}</Text>
                    <Text cmsId="customer-email-value">{customerEmail}</Text>
                  </Stack>
                )}
                {customerPhone && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium" cmsId="booking-detail-phone">{cmsData?.['booking-detail-phone'] || 'Phone:'}</Text>
                    <Text cmsId="customer-phone-value">{customerPhone}</Text>
                  </Stack>
                )}
                <Divider />
              </>
            )}
            
            {/* Trip Details */}
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium" cmsId="booking-detail-pickup">{cmsData?.['booking-detail-pickup'] || 'Pickup Location:'}</Text>
              <Text cmsId="pickup-location-value">{pickupLocation}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium" cmsId="booking-detail-dropoff">{cmsData?.['booking-detail-dropoff'] || 'Dropoff Location:'}</Text>
              <Text cmsId="dropoff-location-value">{dropoffLocation}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium" cmsId="booking-detail-datetime">{cmsData?.['booking-detail-datetime'] || 'Date & Time:'}</Text>
              <Text cmsId="datetime-value">{new Date(pickupDateTime).toLocaleString()}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium" cmsId="booking-detail-total">{cmsData?.['booking-detail-total'] || 'Total Fare:'}</Text>
              <Text weight="bold" color="primary" cmsId="total-fare-value">${(fare || 0) + tipAmount}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium" cmsId="booking-detail-payment">{cmsData?.['booking-detail-payment'] || 'Payment:'}</Text>
              <Text color="success" cmsId="payment-status-value">{depositAmount && depositAmount > 0 ? `$${depositAmount.toFixed(2)} Paid` : 'Due After Ride'}</Text>
            </Stack>
          </Stack>
        </Box>

        <Stack spacing="md" align="center">
          <Text size="lg" weight="medium" align="center" cmsId="whats-next-title">
            {cmsData?.['whats-next-title'] || "What's Next?"}
          </Text>
          <Stack spacing="sm" align="flex-start">
            <Text size="sm" color="secondary" cmsId="whats-next-email">
              ✉️ You'll receive a confirmation email shortly
            </Text>
            <Text size="sm" color="secondary" cmsId="whats-next-driver">
              👤 A driver will be assigned and contact you soon
            </Text>
            <Text size="sm" color="secondary" cmsId="whats-next-pickup">
              💬 Driver will text to confirm details 15 minutes before pickup
            </Text>
            <Text size="sm" color="secondary" cmsId="whats-next-track">
              🗺️ Track your driver in real-time on the booking page
            </Text>
          </Stack>
        </Stack>

        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={() => window.location.href = `/booking/${completedBookingId || 'unknown'}`}
            variant="primary"
            size="lg"
            data-testid="view-booking-button"
            cmsId="view-booking-button"
            text={cmsData?.['view-booking-button'] || 'View My Booking'}
          />
          <Button
            onClick={() => window.location.href = '/bookings'}
            variant="outline"
            size="lg"
            data-testid="all-bookings-button"
            cmsId="all-bookings-button"
            text={cmsData?.['all-bookings-button'] || 'All My Bookings'}
          />
        </Stack>
      </Stack>
    </Box>
  );
};
