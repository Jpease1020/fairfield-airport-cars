'use client';

import React from 'react';
import { Container, Stack, Text, Button, Box, Input, Label, Textarea, RadioButton, H2 } from '@/design/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { FlightInfo } from '@/hooks/useBookingForm';

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
  canContinue
}: ContactInfoPhaseProps) {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <H2 align="center" data-cms-id="pages.booking.personalInfo.title" mode={mode}>
          {getCMSField(cmsData, 'pages.booking.personalInfo.title', 'Contact Information')}
        </H2>
        
        <Text align="center" color="secondary">
          {getCMSField(cmsData, 'pages.booking.personalInfo.description', 'Please provide your contact information to proceed with your booking.')}
        </Text>
        
        {/* Contact Information Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Name */}
            <Stack spacing="sm">
              <Label htmlFor="name" data-cms-id="pages.booking.form.name.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.name.label', 'Full Name')} *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={getCMSField(cmsData, 'pages.booking.form.name.placeholder', 'Enter your full name')}
                data-cms-id="pages.booking.form.name.input"
                fullWidth
                required
                data-testid="name-input"
              />
            </Stack>

            {/* Email */}
            <Stack spacing="sm">
              <Label htmlFor="email" data-cms-id="pages.booking.form.email.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.email.label', 'Email Address')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder={getCMSField(cmsData, 'pages.booking.form.email.placeholder', 'Enter your email')}
                data-cms-id="pages.booking.form.email.input"
                fullWidth
                required
                data-testid="email-input"
              />
            </Stack>

            {/* Phone */}
            <Stack spacing="sm">
              <Label htmlFor="phone" data-cms-id="pages.booking.form.phone.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.phone.label', 'Phone Number')} *
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder={getCMSField(cmsData, 'pages.booking.form.phone.placeholder', 'Enter your phone number')}
                data-cms-id="pages.booking.form.phone.input"
                fullWidth
                required
                data-testid="phone-input"
              />
            </Stack>

            {/* Notes */}
            <Stack spacing="sm">
              <Label htmlFor="notes" data-cms-id="pages.booking.form.notes.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.notes.label', 'Special Requests')}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder={getCMSField(cmsData, 'pages.booking.form.notes.placeholder', 'Any special requests or notes for your driver')}
                data-cms-id="pages.booking.form.notes.input"
                rows={3}
                fullWidth
                data-testid="notes-input"
              />
            </Stack>

            {/* Flight Information */}
            <Stack spacing="sm">
              <Label htmlFor="flightInfo" data-cms-id="pages.booking.form.flightInfo.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.flightInfo.label', 'Flight Information (Optional)')}
              </Label>
              <Stack spacing="sm">
                <Stack direction="horizontal" spacing="sm">
                  <Input
                    placeholder="Airline"
                    value={flightInfo.airline}
                    onChange={(e) => setFlightInfo({ ...flightInfo, airline: e.target.value })}
                    data-cms-id="pages.booking.form.flightInfo.airline"
                    fullWidth
                    data-testid="airline-input"
                  />
                  <Input
                    placeholder="Flight Number"
                    value={flightInfo.flightNumber}
                    onChange={(e) => setFlightInfo({ ...flightInfo, flightNumber: e.target.value })}
                    data-cms-id="pages.booking.form.flightInfo.flightNumber"
                    fullWidth
                    data-testid="flight-number-input"
                  />
                </Stack>
                <Stack direction="horizontal" spacing="sm">
                  <Input
                    placeholder="Arrival Time"
                    value={flightInfo.arrivalTime}
                    onChange={(e) => setFlightInfo({ ...flightInfo, arrivalTime: e.target.value })}
                    data-cms-id="pages.booking.form.flightInfo.arrivalTime"
                    fullWidth
                    data-testid="arrival-time-input"
                  />
                  <Input
                    placeholder="Terminal"
                    value={flightInfo.terminal}
                    onChange={(e) => setFlightInfo({ ...flightInfo, terminal: e.target.value })}
                    data-cms-id="pages.booking.form.flightInfo.terminal"
                    fullWidth
                    data-testid="terminal-input"
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* Save Info for Future */}
            <Stack spacing="sm">
              <Label htmlFor="saveInfoForFuture" data-cms-id="pages.booking.form.saveInfoForFuture.label" mode={mode}>
                {getCMSField(cmsData, 'pages.booking.form.saveInfoForFuture.label', 'Save Information for Future Bookings')}
              </Label>
              <Stack direction="horizontal" spacing="md">
                <RadioButton
                  id="saveInfoForFuture-yes"
                  name="saveInfoForFuture"
                  value="true"
                  checked={saveInfoForFuture}
                  onChange={() => setSaveInfoForFuture(true)}
                  data-cms-id="pages.booking.form.saveInfoForFuture.yes"
                  label={getCMSField(cmsData, 'pages.booking.form.saveInfoForFuture.yes', 'Yes, save my information')}
                  data-testid="save-info-yes"
                />
                <RadioButton
                  id="saveInfoForFuture-no"
                  name="saveInfoForFuture"
                  value="false"
                  checked={!saveInfoForFuture}
                  onChange={() => setSaveInfoForFuture(false)}
                  data-cms-id="pages.booking.form.saveInfoForFuture.no"
                  label={getCMSField(cmsData, 'pages.booking.form.saveInfoForFuture.no', 'No, don\'t save my information')}
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
            {getCMSField(cmsData, 'pages.booking.steps.back', 'Back to Trip Details')}
          </Button>
          
          <Button
            onClick={onContinue}
            variant="primary"
            fullWidth
            disabled={!canContinue}
            data-testid="continue-to-payment-button"
          >
            {getCMSField(cmsData, 'pages.booking.steps.continue', 'Continue to Payment')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
