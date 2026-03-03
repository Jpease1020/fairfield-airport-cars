'use client';

import React from 'react';
import { Container } from '@/design/layout/containers/Container';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';
import { Card } from '@/design/layout/content/Card';
import { Badge } from '@/design/components/base-components/Badge';

interface PaymentSummaryProps {
  baseFare: number;
  tipAmount: number;
  currency?: string;
  cmsData: any;
}

export function PaymentSummary({ 
  baseFare, 
  tipAmount, 
  currency = 'USD',
  cmsData
}: PaymentSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const subtotal = baseFare;
  const total = subtotal + tipAmount;

  return (
    <Container variant="default" padding="md">
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" spacing="lg">
          <Stack direction="vertical" spacing="sm">
              <Text variant="lead" weight="bold">{cmsData?.['paymentSummaryTitle'] || '💳 Payment Summary'}</Text >
            <Text variant="small" color="muted">{cmsData?.['paymentSummarySubtitle'] || 'Review your fare breakdown'}</Text>
          </Stack>

          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" justify="space-between">
              <Text variant="body">{cmsData?.['paymentSummaryBaseFare'] || 'Base Fare'}</Text>
              <Text variant="body" weight="medium">
                {formatCurrency(baseFare)}
              </Text>
            </Stack>

            <Card variant="default" padding="xs">
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Text variant="body">{cmsData?.['paymentSummarySubtotal'] || 'Subtotal'}</Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(subtotal)}
                </Text>
              </Stack>
            </Card>

            {tipAmount > 0 && (
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Stack direction="horizontal" spacing="sm" align="center">
                  <Badge variant="success">💡</Badge>
                  <Text variant="body">{cmsData?.['paymentSummaryTip'] || 'Tip ({tipPercent}%)'}</Text>
                </Stack>
                <Text variant="body" weight="medium">
                  {formatCurrency(tipAmount)}
                </Text>
              </Stack>
            )}

            <Card variant="elevated" padding="md">
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                  <Text variant="lead" weight="bold">{cmsData?.['paymentSummaryTotal'] || 'Total'}</Text>
                <Text variant="lead" weight="bold">{cmsData?.['paymentSummaryTotalAmount'] || 'Total'}</Text>
                <Text variant="lead" weight="bold">
                  {formatCurrency(total)}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
} 