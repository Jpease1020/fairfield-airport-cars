'use client';

import React from 'react';
import styled from 'styled-components';
import { Stack, Button } from '@/design/ui';

const ButtonWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
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
          text={cmsData?.['paymentPhase-processButton'] || 'Confirm Booking - No Payment Required'}
          fullWidth
        />
      </ButtonWrapper>
    </Stack>
  );
};
