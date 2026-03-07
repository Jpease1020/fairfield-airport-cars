'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Stack, Button, Text, H2, Box } from '@/design/ui';
import { FlightInfoSection } from './trip-details/FlightInfoSection';
import { useBooking } from '@/providers/BookingProvider';
import { colors } from '@/design/system/tokens/tokens';

// Styled container that removes padding on mobile
const FlightInfoContainer = styled(Container)`
  @media (max-width: 768px) {
    padding: 0 !important;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${colors.border.default};
  margin: 0.5rem 0;
`;

const WarningBox = styled(Box)`
  background-color: ${colors.warning[50]};
  border: 2px solid ${colors.warning[500]};
`;

const WarningSubtext = styled(Text)`
  margin-top: 0.5rem;
`;

interface FlightInfoPhaseProps {
  cmsData: any;
}

export function FlightInfoPhase({
  cmsData
}: FlightInfoPhaseProps) {
  const {
    formData,
    updateTripDetails,
    completeFlightInfo,
    warning
  } = useBooking();
  
  const tripData = formData.trip;
  const customer = formData.customer;

  // Debug: Log customer data to help diagnose missing email
  React.useEffect(() => {
    console.log('🔍 [FLIGHT INFO PHASE] Customer data:', {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      fullCustomer: customer,
      fullFormData: formData
    });
  }, [customer, formData]);

  return (
    <FlightInfoContainer maxWidth="7xl" padding="xl" data-testid="flight-info-phase-container">
      <Stack spacing="2xl" data-testid="flight-info-phase-stack">
        {/* Header */}
        <Stack spacing="md" align="center">
          <H2>
            {cmsData?.['flight-info-phase-title'] || 'Almost There—Complete Your Booking'}
          </H2>
          <Text size="lg" align="center" color="secondary">
            {cmsData?.['flight-info-phase-description'] || 'Your ride has been successfully booked. Help us provide better service by sharing your flight details (optional).'}
          </Text>
          <Text
            size="md"
            align="center"
            color="warning"
            weight="medium"

            data-testid="flight-info-phase-warning"
          >
            {cmsData?.['flight-info-phase-warning'] ||
              'Check your email and click the confirmation link to finalize your booking.'}
          </Text>
        </Stack>

        {/* Customer Information Section - Always show if we're on this page */}
        <Box variant="outlined" padding="lg" data-testid="customer-info-section">
          <Stack spacing="md">
            <Text weight="bold" size="md">
              {cmsData?.['flight-info-customer-section'] || 'Your Information'}
            </Text>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['flight-info-customer-name'] || 'Name:'}</Text>
              <Text>{customer.name || 'Not provided'}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['flight-info-customer-email'] || 'Email:'}</Text>
              <Text>{customer.email || 'Not provided'}</Text>
            </Stack>
            <Stack direction="horizontal" justify="space-between">
              <Text weight="medium">{cmsData?.['flight-info-customer-phone'] || 'Phone:'}</Text>
              <Text>{customer.phone || 'Not provided'}</Text>
            </Stack>
          </Stack>
        </Box>

        {/* Flight Information Section */}
        <FlightInfoSection
          flightInfo={tripData.flightInfo}
          onFlightInfoChange={(info) => updateTripDetails({ flightInfo: info })}
          cmsData={cmsData}
        />

        {warning && (
          <WarningBox variant="filled" padding="lg" data-testid="flight-info-phase-warning-message">
            <Stack spacing="sm" align="center">
              <Text size="lg" weight="bold" color="warning" align="center">
                {cmsData?.['flight-info-email-warning-title'] || '⚠️ Email Not Sent'}
              </Text>
              <Text size="md" align="center" color="warning">
                {warning}
              </Text>
              <WarningSubtext size="sm" align="center" color="secondary">
                Also check your spam/junk folder. If you still don't see the email, please text us at (203) 990-1815.
              </WarningSubtext>
            </Stack>
          </WarningBox>
        )}

        {/* Navigation */}
        <Stack direction="horizontal" spacing="md" justify="center">
          <Button
            variant="primary"
            size="lg"
            onClick={completeFlightInfo}
            data-testid="flight-info-complete-button"

            text={cmsData?.['flight-info-complete-button'] || 'Save Flight Info'}
            fullWidth
          />
        </Stack>
      </Stack>
    </FlightInfoContainer>
  );
}
