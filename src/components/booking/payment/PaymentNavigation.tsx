'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stack, Button, Text, StatusMessage } from '@/design/ui';
import { colors, spacing } from '@/design/system/tokens/tokens';

const ButtonWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
`;

const PaymentNote = styled(Text)`
  font-size: 0.75rem;
  color: ${colors.text.secondary};
  text-align: center;
  font-style: italic;
`;

interface PaymentNavigationProps {
  onBack: () => void;
  onProcessPayment: () => void;
  isProcessingPayment: boolean;
  cmsData: Record<string, string> | undefined;
  validationErrors?: string[];
  /** When true, show "No Payment Required" note under the button. When false, hide it to avoid confusion. */
  noPaymentRequired?: boolean;
}

export const PaymentNavigation: React.FC<PaymentNavigationProps> = ({
  onBack,
  onProcessPayment,
  isProcessingPayment,
  cmsData,
  validationErrors = [],
  noPaymentRequired = true,
}) => {
  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Stack direction="horizontal" spacing="md" justify="space-between" align="stretch" data-testid="payment-navigation">
      <ButtonWrapper>
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={isProcessingPayment}
          data-testid="payment-back-button"

          text={cmsData?.['paymentPhase-backButton'] || 'Back'}
          fullWidth
        />
      </ButtonWrapper>
      
      <ButtonWrapper>
        <Button
          variant="primary"
          size="md"
          onClick={onProcessPayment}
          disabled={isProcessingPayment}
          loading={isProcessingPayment}
          data-testid="payment-process-button"

          text={
            isMobile
              ? (cmsData?.['paymentPhase-processButton-mobile'] || 'Confirm Booking')
              : (cmsData?.['paymentPhase-processButton'] || 'Confirm Booking')
          }
          fullWidth
        />
        {noPaymentRequired && (
          <PaymentNote>
            {cmsData?.['paymentPhase-noPaymentNote'] || 'No Payment Required'}
          </PaymentNote>
        )}
      </ButtonWrapper>
      
      {/* Error message display below button - scroll target for mobile */}
      {validationErrors.length > 0 && (
        <StatusMessage
          type="error"
          message={validationErrors.join(', ')}
          id="payment-validation-error-message"
          data-testid="payment-validation-error-message"
        />
      )}
    </Stack>
  );
};
