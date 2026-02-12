'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Container, Stack, Text, Button, Box, Input, Textarea, RadioButton, H2, Label } from '@/design/ui';
import { CustomerInfo, ValidationResult } from '@/types/booking';
import { useCMSData } from '../../design/providers/CMSDataProvider';
import { useBooking } from '@/providers/BookingProvider';
import { colors, spacing, borderRadius } from '@/design/system/tokens/tokens';

interface ContactInfoPhaseProps {
  customerData: CustomerInfo;
  onCustomerUpdate: (data: Partial<CustomerInfo>) => void;
  onBack: () => void;
  onContinue: () => void;
  validation: ValidationResult;
  cmsData: any;
}

/**
 * Validates if a phone number is a valid US phone (10+ digits)
 */
function isValidUSPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

// Styled component defined outside to prevent dynamic creation
const Half = styled.div`
  flex: 1;
  display: flex;
  min-width: 0; /* Allow flexbox to shrink */
`;

const ButtonContainer = styled(Stack)`
  @media (max-width: 768px) {
    flex-direction: row;
    gap: ${spacing.md};
    
    /* Ensure buttons are equal width on mobile */
    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }
`;

const ValidationIndicator = styled.span<{ $isValid: boolean }>`
  color: ${({ $isValid }) => ($isValid ? colors.success[600] : colors.danger[600])};
  margin-left: 2px;
`;

const ErrorMessageBox = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.danger[50]};
  border: 1px solid ${colors.danger[200]};
  border-radius: ${borderRadius.lg};
  color: ${colors.danger[800]};
  margin-top: ${spacing.md};
  width: 100%;
  font-weight: 500;
`;

const SmsDisclaimerText = styled(Text)`
  margin-left: 28px;
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
  
  // Get hasAttemptedValidation from booking provider
  const { hasAttemptedValidation } = useBooking();

  // Track if we've already looked up preferences for this phone
  const lastLookedUpPhone = useRef<string>('');
  const [_isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Look up returning customer's preferences when phone number is entered
   * This auto-fills their SMS opt-in preference from their last booking
   */
  const lookupCustomerPreferences = useCallback(async (phone: string) => {
    // Normalize phone for comparison
    const normalizedPhone = phone.replace(/\D/g, '');

    // Skip if we've already looked up this phone
    if (normalizedPhone === lastLookedUpPhone.current) return;

    // Only lookup if phone is valid
    if (!isValidUSPhone(phone)) return;

    lastLookedUpPhone.current = normalizedPhone;
    setIsLoadingPreferences(true);

    try {
      const res = await fetch(`/api/customer/preferences?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.found && data.preferences) {
        // Auto-fill returning customer's preferences
        const updates: Partial<CustomerInfo> = {
          smsOptIn: data.preferences.smsOptIn
        };

        // If they opted to save info and we have it, also fill name/email
        if (data.preferences.saveInfoForFuture) {
          if (data.preferences.name && !customerData.name) {
            updates.name = data.preferences.name;
          }
          if (data.preferences.email && !customerData.email) {
            updates.email = data.preferences.email;
          }
          updates.saveInfoForFuture = true;
        }

        onCustomerUpdate(updates);
      }
    } catch (error) {
      // Silently fail - this is a nice-to-have feature
      console.error('[ContactInfoPhase] Failed to lookup preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [customerData.name, customerData.email, onCustomerUpdate]);

  // Lookup preferences when phone number changes and is valid
  useEffect(() => {
    if (isValidUSPhone(customerData.phone)) {
      // Debounce the lookup
      const timeoutId = setTimeout(() => {
        lookupCustomerPreferences(customerData.phone);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [customerData.phone, lookupCustomerPreferences]);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
              <Label htmlFor="name-input">
                {pageCmsData?.['form-name-label'] || 'Full Name'}
                <ValidationIndicator 
                  $isValid={!!customerData.name.trim() && !validation?.fieldErrors?.['name-input']}
                >
                  {!!customerData.name.trim() && !validation?.fieldErrors?.['name-input'] ? ' ✓' : ' *'}
                </ValidationIndicator>
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
            </Stack>

            <Stack spacing="sm">
              <Label htmlFor="email-input">
                {pageCmsData?.['form-email-label'] || 'Email'}
                <ValidationIndicator 
                  $isValid={!!customerData.email.trim() && !validation?.fieldErrors?.['email-input']}
                >
                  {!!customerData.email.trim() && !validation?.fieldErrors?.['email-input'] ? ' ✓' : ' *'}
                </ValidationIndicator>
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
            </Stack>

            <Stack spacing="sm">
              <Label htmlFor="phone-input">
                {pageCmsData?.['form-phone-label'] || 'Phone Number'}
                <ValidationIndicator 
                  $isValid={!!customerData.phone.trim() && !validation?.fieldErrors?.['phone-input']}
                >
                  {!!customerData.phone.trim() && !validation?.fieldErrors?.['phone-input'] ? ' ✓' : ' *'}
                </ValidationIndicator>
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

            <Stack spacing="sm">
              <RadioButton
                id="sms-opt-in"
                name="sms-opt-in"
                value="sms-opt-in"
                checked={customerData.smsOptIn}
                onChange={() => onCustomerUpdate({ smsOptIn: !customerData.smsOptIn })}
                data-testid="sms-opt-in-checkbox"
                label="Send me occasional deals and promotions via text message"
              />
              <SmsDisclaimerText variant="small" color="secondary">
                Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.
              </SmsDisclaimerText>
            </Stack>
          </Stack>
        </Box>

        {/* Navigation */}
        <ButtonContainer direction="horizontal" spacing="md" fullWidth>
          <Half>
            <Button
              onClick={onBack}
              variant="outline"
              fullWidth
              size="md"
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
              size="md"
              cmsId="continue-button"
              data-testid="contact-info-continue-button"
              text={
                isMobile
                  ? (pageCmsData?.['continue-button-mobile'] || 'Continue')
                  : (pageCmsData?.['continue-button'] || 'Continue to Payment')
              }
            />
          </Half>
        </ButtonContainer>
        
        {/* Error message display below button - scroll target for mobile */}
        {validation.errors.length > 0 && hasAttemptedValidation && (
          <ErrorMessageBox
            id="contact-info-error-message"
            data-testid="contact-info-error-message"
          >
            <strong>❌ Error:</strong> {validation.errors.join(', ')}
          </ErrorMessageBox>
        )}
      </Stack>
    </Container>
  );
}
