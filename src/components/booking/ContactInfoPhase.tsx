'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Stack, Text, Button, Box, Input, Textarea, RadioButton, H2, Label } from '@/design/ui';
import { FieldValidationStatus } from '@/design/components/base-components/forms/FieldValidationStatus';
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

// Styled component defined outside to prevent dynamic creation
const Half = styled.div`
  flex: 1;
  display: flex;
`;

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

            <Stack spacing="sm">
              <Label htmlFor="name-input" required>
                {pageCmsData?.['form-name-label'] || 'Full Name'}
              </Label>
              <Input
                id="name-input"
                value={customerData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ name: e.target.value })}
                placeholder={pageCmsData?.['form-name-placeholder'] || 'Enter your full name'}
                cmsId="form-name-input"
                fullWidth
                required
                error={!!validation?.fieldErrors?.['name-input']}
                data-testid="name-input"
              />
              <FieldValidationStatus
                isValid={!!customerData.name.trim() && !validation?.fieldErrors?.['name-input']}
                show={!!customerData.name.trim() || !!validation?.fieldErrors?.['name-input']}
              />
            </Stack>

            <Stack spacing="sm">
              <Label htmlFor="email-input" required>
                {pageCmsData?.['form-email-label'] || 'Email'}
              </Label>
              <Input
                id="email-input"
                type="email"
                value={customerData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ email: e.target.value })}
                placeholder={pageCmsData?.['form-email-placeholder'] || 'Enter your email'}
                cmsId="form-email-input"
                fullWidth
                required
                error={!!validation?.fieldErrors?.['email-input']}
                data-testid="email-input"
              />
              <FieldValidationStatus
                isValid={!!customerData.email.trim() && !validation?.fieldErrors?.['email-input']}
                show={!!customerData.email.trim() || !!validation?.fieldErrors?.['email-input']}
              />
            </Stack>

            <Stack spacing="sm">
              <Label htmlFor="phone-input" required>
                {pageCmsData?.['form-phone-label'] || 'Phone Number'}
              </Label>
              <Input
                id="phone-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="^\+?1?[\-\.\s]?\(?\d{3}\)?[\-\.\s]?\d{3}[\-\.\s]?\d{4}$"
                maxLength={17}
                aria-label="Phone number"
                value={customerData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomerUpdate({ phone: e.target.value })}
                placeholder={'Enter your phone number'}
                cmsId="form-phone-input"
                fullWidth
                required
                error={!!validation?.fieldErrors?.['phone-input']}
                data-testid="phone-input"
              />
              <FieldValidationStatus
                isValid={!!customerData.phone.trim() && !validation?.fieldErrors?.['phone-input']}
                show={!!customerData.phone.trim() || !!validation?.fieldErrors?.['phone-input']}
              />
            </Stack>

            <Stack spacing="sm">
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
        <Stack direction="horizontal" spacing="md" fullWidth>
          <Half>
            <Button
              onClick={onBack}
              variant="outline"
              fullWidth
              cmsId="back-button"
              data-testid="contact-info-back-button"            
              text={pageCmsData?.['back-button'] || 'Back'}
            />
          </Half>
          <Half>
            <Button
              onClick={onContinue}
              variant="primary"
              fullWidth
              cmsId="continue-button"
              data-testid="contact-info-continue-button"
              text={pageCmsData?.['continue-button'] || 'Continue to Payment'}
            />
          </Half>
        </Stack>
      </Stack>
    </Container>
  );
}
