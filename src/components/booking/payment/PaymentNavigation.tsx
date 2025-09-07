'use client';

import React from 'react';
import { Stack, Button } from '@/ui';

interface PaymentNavigationProps {
  onBack: () => void;
  onProcessPayment: () => void;
  isProcessingPayment: boolean;
  canProcessPayment: boolean;
  cmsData: any;
}

export const PaymentNavigation: React.FC<PaymentNavigationProps> = ({
  onBack,
  onProcessPayment,
  isProcessingPayment,
  canProcessPayment,
  cmsData
}) => {
  return (
    <Stack direction="horizontal" spacing="md" justify="space-between" data-testid="payment-navigation">
      <Button
        variant="outline"
        size="lg"
        onClick={onBack}
        disabled={isProcessingPayment}
        data-testid="payment-back-button"
        cmsId="payment-back-button"
        text={cmsData?.['paymentPhase-backButton'] || 'Back'}
      />
      
      <Button
        variant="primary"
        size="lg"
        onClick={onProcessPayment}
        disabled={!canProcessPayment || isProcessingPayment}
        loading={isProcessingPayment}
        data-testid="payment-process-button"
        cmsId="payment-process-button"
        text={cmsData?.['paymentPhase-processButton'] || 'Process Payment'}
      />
    </Stack>
  );
};
