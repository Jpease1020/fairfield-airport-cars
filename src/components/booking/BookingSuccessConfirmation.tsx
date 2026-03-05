'use client';

import React from 'react';
import styled from 'styled-components';
import { Box, Stack, Text, Button } from '@/design/ui';
import { colors } from '@/design/system/tokens/tokens';
import { AddToCalendarButton } from '@/components/business/AddToCalendarButton';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

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
        <Text size="3xl" weight="bold" color="primary">
          {cmsData?.['booking-confirmed-title'] || 'Booking confirmed'}
        </Text>

        <Text
          size="md"
          weight="medium"
          align="center"
          color="warning"

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

        <Text size="lg" align="center">
          {cmsData?.['booking-confirmed-description'] ||
            `We’re holding your ride from ${pickupLocation} to ${dropoffLocation}. Finish confirmation via the email in your inbox.`}
        </Text>

        <Box variant="outlined" padding="lg" data-testid="booking-details-summary">
          <Stack spacing="md">
            {/* Customer Information */}
            {(customerName || customerEmail || customerPhone) && (
              <>
                <Text weight="bold" size="md">
                  {cmsData?.['booking-detail-customer-section'] || 'Your Information'}
                </Text>
                {customerName && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium">{cmsData?.['booking-detail-name'] || 'Name:'}</Text>
                    <Text>{customerName}</Text>
                  </Stack>
                )}
                {customerEmail && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium">{cmsData?.['booking-detail-email'] || 'Email:'}</Text>
                    <Text>{customerEmail}</Text>
                  </Stack>
                )}
                {customerPhone && (
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="medium">{cmsData?.['booking-detail-phone'] || 'Phone:'}</Text>
                    <Text>{customerPhone}</Text>
                  </Stack>
                )}
                <Divider />
              </>
            )}
            
            {/* Trip Details */}
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['booking-detail-pickup'] || 'Pickup Location:'}</Text>
              <Text>{pickupLocation}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['booking-detail-dropoff'] || 'Dropoff Location:'}</Text>
              <Text>{dropoffLocation}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['booking-detail-datetime'] || 'Pickup Time:'}</Text>
              <Text>{formatDateTimeNoSeconds(pickupDateTime)}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['booking-detail-total'] || 'Total Fare:'}</Text>
              <Text weight="bold" color="primary">${(fare || 0) + tipAmount}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['booking-detail-payment'] || 'Payment:'}</Text>
              <Text color="success">{depositAmount && depositAmount > 0 ? `$${depositAmount.toFixed(2)} Paid` : 'Due After Ride'}</Text>
            </Stack>
          </Stack>
        </Box>

        <Stack spacing="md" align="center">
          <Text size="lg" weight="medium" align="center">
            {cmsData?.['whats-next-title'] || "What's Next?"}
          </Text>
          <Stack spacing="sm" align="flex-start">
            <Text size="sm" color="secondary">
              ✉️ You'll receive a confirmation email shortly
            </Text>
            <Text size="sm" color="secondary">
              👤 A driver will be assigned and contact you soon
            </Text>
            <Text size="sm" color="secondary">
              💬 Driver will text to confirm details 15 minutes before pickup
            </Text>
            <Text size="sm" color="secondary">
              🗺️ Track your driver in real-time on the booking page
            </Text>
          </Stack>
        </Stack>

        <Stack spacing="md" align="center">
          {completedBookingId && (
            <AddToCalendarButton
              pickupAddress={pickupLocation}
              dropoffAddress={dropoffLocation}
              pickupDateTime={pickupDateTime}
              bookingId={completedBookingId}
              customerName={customerName}
              variant="primary"
              size="lg"
            />
          )}
          <Stack direction="horizontal" spacing="md">
            <Button
              onClick={() => window.location.href = `/booking/${completedBookingId || 'unknown'}`}
              variant="primary"
              size="lg"
              data-testid="view-booking-button"

              text={cmsData?.['view-booking-button'] || 'View My Booking'}
            />
            <Button
              onClick={() => window.location.href = '/bookings'}
              variant="outline"
              size="lg"
              data-testid="all-bookings-button"

              text={cmsData?.['all-bookings-button'] || 'All My Bookings'}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
