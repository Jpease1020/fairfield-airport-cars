'use client';

import React from 'react';
import { Container, Stack, Text, Button, Box, Input, Label, Textarea, RadioButton, H2 } from '@/design/ui';
import { FlightInfo } from '@/hooks/useBookingForm';
import { useCMSData } from '../../design/providers/CMSDataProvider';

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
  cmsData: any;
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
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.booking || {};

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <H2 align="center" cmsId="personal-info-title" >
          {pageCmsData?.['contactInfoPhase-title'] || 'Contact Information'}
        </H2>
        
        <Text align="center" color="secondary" cmsId="contact-info-description">
          {pageCmsData?.['contactInfoPhase-description'] || 'Please provide your contact information to proceed with your booking.'}
        </Text>
        
        {/* Contact Information Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Name */}
            <Stack spacing="sm">
              <Label htmlFor="name" cmsId="form-name-label" >
                {pageCmsData?.['form-name-label'] || 'Full Name'} *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={pageCmsData?.['form-name-placeholder'] || 'Enter your full name'}
                cmsId="form-name-input"
                fullWidth
                required
                data-testid="name-input"
              />
            </Stack>

            {/* Email */}
            <Stack spacing="sm">
              <Label htmlFor="email" cmsId="form-email-label" >
                {pageCmsData?.['form-email-label'] || 'Email Address'} *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder={pageCmsData?.['form-email-placeholder'] || 'Enter your email'}
                cmsId="form-email-input"
                fullWidth
                required
                data-testid="email-input"
              />
            </Stack>

            {/* Phone */}
            <Stack spacing="sm">
              <Label htmlFor="phone" cmsId="form-phone-label" >
                {pageCmsData?.['form-phone-label'] || 'Phone Number'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder={pageCmsData?.['form-phone-placeholder'] || 'Enter your phone number'}
                cmsId="form-phone-input"
                fullWidth
                required
                data-testid="phone-input"
              />
            </Stack>

            {/* Notes */}
            <Stack spacing="sm">
              <Label htmlFor="notes" cmsId="form-notes-label" >
                {pageCmsData?.['form-notes-label'] || 'Special Instructions'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder={pageCmsData?.['form-notes-placeholder'] || 'Any special instructions for your driver?'}
                cmsId="form-notes-input"
                fullWidth
                rows={3}
                data-testid="notes-input"
              />
            </Stack>

            {/* Save Info for Future */}
            <Stack spacing="sm">
              <RadioButton
                id="save-info"
                name="save-info"
                value="save-info"
                checked={saveInfoForFuture}
                onChange={() => setSaveInfoForFuture(!saveInfoForFuture)}
                data-testid="save-info-checkbox"
                label={pageCmsData?.['save-info-label'] || 'Save my information for future bookings'}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Navigation */}
        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={onBack}
            variant="outline"
            cmsId="back-button"
            data-testid="back-button" 
            
            text={pageCmsData?.['back-button'] || 'Back'}
          />
          <Button
            onClick={onContinue}
            variant="primary"
            disabled={!canContinue}
            cmsId="continue-button"
            data-testid="continue-button"
            
            text={pageCmsData?.['continue-button'] || 'Continue to Payment'}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
