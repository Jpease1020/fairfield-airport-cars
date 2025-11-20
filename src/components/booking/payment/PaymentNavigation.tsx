'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stack, Button, Text } from '@/design/ui';
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
}

export const PaymentNavigation: React.FC<PaymentNavigationProps> = ({
  onBack,
  onProcessPayment,
  isProcessingPayment,
  cmsData
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
          cmsId="payment-back-button"
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
          cmsId="payment-process-button"
          text={
            isMobile
              ? (cmsData?.['paymentPhase-processButton-mobile'] || 'Confirm Booking')
              : (cmsData?.['paymentPhase-processButton'] || 'Confirm Booking')
          }
          fullWidth
        />
        <PaymentNote>
          {cmsData?.['paymentPhase-noPaymentNote'] || 'No Payment Required'}
        </PaymentNote>
      </ButtonWrapper>
    </Stack>
  );
};
