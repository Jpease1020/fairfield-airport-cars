'use client';

import React from 'react';
import { Container, Stack, Text, Button, Box, Input, Label, Textarea, RadioButton, H2 } from '@/design/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { FlightInfo } from '@/hooks/useBookingForm';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

interface ContactInfoPhaseProps {
  // State
  name: string;
  email: string;
  phone: string;
  notes: string;
  saveInfoForFuture: boolean;
  flightInfo: FlightInfo;
  
  // Setters
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
  setSaveInfoForFuture: (save: boolean) => void;
  setFlightInfo: (info: FlightInfo) => void;
  
  // Actions
  onBack: () => void;
  onContinue: () => void;
  
  // Validation
  canContinue: boolean;
  
  // CMS Data
  cmsData?: any;
}

export function ContactInfoPhase({
  name,
  email,
  phone,
  notes,
  saveInfoForFuture,
  flightInfo,
  setName,
  setEmail,
  setPhone,
  setNotes,
  setSaveInfoForFuture,
  setFlightInfo,
  onBack,
  onContinue,
  canContinue,
  cmsData
}: ContactInfoPhaseProps) {
  const { mode } = useInteractionMode();

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <H2 align="center" data-cms-id="personal-info-title" mode={mode}>
          {getCMSField(cmsData, 'contactInfoPhase-title', 'Contact Information')}
        </H2>
        
        <Text align="center" color="secondary">
          {getCMSField(cmsData, 'contactInfoPhase-description', 'Please provide your contact information to proceed with your booking.')}
        </Text>
        
        {/* Contact Information Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Name */}
            <Stack spacing="sm">
              <Label htmlFor="name" data-cms-id="form-name-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Full Name')} *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={getCMSField(cmsData, 'contactInfoPhase-placeholder', 'Enter your full name')}
                data-cms-id="form-name-input"
                fullWidth
                required
                data-testid="name-input"
              />
            </Stack>

            {/* Email */}
            <Stack spacing="sm">
              <Label htmlFor="email" data-cms-id="form-email-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Email Address')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder={getCMSField(cmsData, 'contactInfoPhase-placeholder', 'Enter your email')}
                data-cms-id="form-email-input"
                fullWidth
                required
                data-testid="email-input"
              />
            </Stack>

            {/* Phone */}
            <Stack spacing="sm">
              <Label htmlFor="phone" data-cms-id="form-phone-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Phone Number')} *
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder={getCMSField(cmsData, 'contactInfoPhase-placeholder', 'Enter your phone number')}
                data-cms-id="form-phone-input"
                fullWidth
                required
                data-testid="phone-input"
              />
            </Stack>

            {/* Notes */}
            <Stack spacing="sm">
              <Label htmlFor="notes" data-cms-id="form-notes-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Special Requests')}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder={getCMSField(cmsData, 'contactInfoPhase-placeholder', 'Any special requests or notes for your driver')}
                data-cms-id="form-notes-input"
                rows={3}
                fullWidth
                data-testid="notes-input"
              />
            </Stack>

            {/* Flight Information */}
            <Stack spacing="sm">
              <Label htmlFor="flightInfo" data-cms-id="form-flight-info-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Flight Information (Optional)')}
              </Label>
              <Stack spacing="sm">
                <Stack direction="horizontal" spacing="sm">
                  <Input
                    placeholder="Airline"
                    value={flightInfo.airline}
                    onChange={(e) => setFlightInfo({ ...flightInfo, airline: e.target.value })}
                    data-cms-id="form-flight-info-airline"
                    fullWidth
                    data-testid="airline-input"
                  />
                  <Input
                    placeholder="Flight Number"
                    value={flightInfo.flightNumber}
                    onChange={(e) => setFlightInfo({ ...flightInfo, flightNumber: e.target.value })}
                    data-cms-id="form-flight-info-flight-number"
                    fullWidth
                    data-testid="flight-number-input"
                  />
                </Stack>
                <Stack direction="horizontal" spacing="sm">
                  <Input
                    placeholder="Arrival Time"
                    value={flightInfo.arrivalTime}
                    onChange={(e) => setFlightInfo({ ...flightInfo, arrivalTime: e.target.value })}
                    data-cms-id="form-flight-info-arrival-time"
                    fullWidth
                    data-testid="arrival-time-input"
                  />
                  <Input
                    placeholder="Terminal"
                    value={flightInfo.terminal}
                    onChange={(e) => setFlightInfo({ ...flightInfo, terminal: e.target.value })}
                    data-cms-id="form-flight-info-terminal"
                    fullWidth
                    data-testid="terminal-input"
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* Save Info for Future */}
            <Stack spacing="sm">
              <Label htmlFor="saveInfoForFuture" data-cms-id="form-save-info-for-future-label" mode={mode}>
                {getCMSField(cmsData, 'contactInfoPhase-label', 'Save Information for Future Bookings')}
              </Label>
              <Stack direction="horizontal" spacing="md">
                <RadioButton
                  id="saveInfoForFuture-yes"
                  name="saveInfoForFuture"
                  value="true"
                  checked={saveInfoForFuture}
                  onChange={() => setSaveInfoForFuture(true)}
                  data-cms-id="form-save-info-for-future-yes"
                  label={getCMSField(cmsData, 'contactInfoPhase-yes', 'Yes, save my information')}
                  data-testid="save-info-yes"
                />
                <RadioButton
                  id="saveInfoForFuture-no"
                  name="saveInfoForFuture"
                  value="false"
                  checked={!saveInfoForFuture}
                  onChange={() => setSaveInfoForFuture(false)}
                  data-cms-id="form-save-info-for-future-no"
                  label={getCMSField(cmsData, 'contactInfoPhase-no', 'No, don\'t save my information')}
                  data-testid="save-info-no"
                />
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Navigation Buttons */}
        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={onBack}
            variant="outline"
            fullWidth
            data-testid="back-to-trip-details-button"
          >
            {getCMSField(cmsData, 'contactInfoPhase-back', 'Back to Trip Details')}
          </Button>
          
          <Button
            onClick={onContinue}
            variant="primary"
            fullWidth
            disabled={!canContinue}
            data-testid="continue-to-payment-button"
          >
            {getCMSField(cmsData, 'contactInfoPhase-continue', 'Continue to Payment')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
