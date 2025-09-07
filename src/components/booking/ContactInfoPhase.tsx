'use client';

import React from 'react';
import { Container, Stack, Text, Button, Box, Input, Label, Textarea, RadioButton, H2 } from '@/design/ui';
import { CustomerInfo, ValidationResult } from '@/types/booking';
import { useCMSData } from '../../design/providers/CMSDataProvider';

interface ContactInfoPhaseProps {
  customerData: CustomerInfo;
  onCustomerUpdate: (data: Partial<CustomerInfo>) => void;
  onBack: () => void;
  onContinue: () => void;
  validation: ValidationResult;
  cmsData: any;
}

export function ContactInfoPhase({
  customerData,
  onCustomerUpdate,
  onBack,
  onContinue,
  validation,
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
              <Label htmlFor="name" cmsId="booking-form-name-label" >
                {pageCmsData?.['form-name-label'] || 'Full Name'} *
              </Label>
              <Input
                id="name"
                value={customerData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ name: e.target.value })}
                placeholder={pageCmsData?.['form-name-placeholder'] || 'Enter your full name'}
                cmsId="form-name-input"
                fullWidth
                required
                data-testid="name-input"
              />
            </Stack>

            {/* Email */}
            <Stack spacing="sm">
              <Label htmlFor="email" cmsId="booking-form-email-label" >
                {pageCmsData?.['form-email-label'] || 'Email Address'} *
              </Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ email: e.target.value })}
                placeholder={pageCmsData?.['form-email-placeholder'] || 'Enter your email'}
                cmsId="form-email-input"
                fullWidth
                required
                data-testid="email-input"
              />
            </Stack>

            {/* Phone */}
            <Stack spacing="sm">
              <Label htmlFor="phone" cmsId="booking-form-phone-label" >
                {pageCmsData?.['form-phone-label'] || 'Phone Number'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={customerData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ phone: e.target.value })}
                placeholder={pageCmsData?.['form-phone-placeholder'] || 'Enter your phone number'}
                cmsId="form-phone-input"
                fullWidth
                required
                data-testid="phone-input"
              />
            </Stack>

            {/* Notes */}
            <Stack spacing="sm">
              <Label htmlFor="notes" cmsId="booking-form-notes-label" >
                {pageCmsData?.['form-notes-label'] || 'Special Instructions'}
              </Label>
              <Textarea
                id="notes"
                value={customerData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onCustomerUpdate({ notes: e.target.value })}
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
                checked={customerData.saveInfoForFuture}
                onChange={() => onCustomerUpdate({ saveInfoForFuture: !customerData.saveInfoForFuture })}
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
            disabled={!validation.isValid}
            cmsId="continue-button"
            data-testid="continue-button"
            
            text={pageCmsData?.['continue-button'] || 'Continue to Payment'}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
