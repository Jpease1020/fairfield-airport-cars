'use client';

import React from 'react';
import { Container } from '../../layout/containers/Container';
import { Text } from '../base-components/text/Text';
import { Stack } from '../../layout/framing/Stack';
import { Card } from '../../layout/content/Card';
import { Badge } from '../base-components/Badge';
import { Button } from '../base-components/Button';

interface PaymentSummaryProps {
  baseFare: number;
  tipAmount: number;
  tipPercent: number;
  vehicleUpgrade?: number;
  serviceLevel?: number;
  currency?: string;
}

export function PaymentSummary({ 
  baseFare, 
  tipAmount, 
  tipPercent, 
  vehicleUpgrade = 0, 
  serviceLevel = 0,
  currency = 'USD' 
}: PaymentSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const subtotal = baseFare + vehicleUpgrade + serviceLevel;
  const total = subtotal + tipAmount;

  return (
    <Container variant="default" padding="md">
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" spacing="lg">
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              💳 Payment Summary
            </Text>
            <Text variant="small" color="muted">
              Review your fare breakdown
            </Text>
          </Stack>

          <Stack direction="vertical" spacing="sm">
            <Stack direction="horizontal" spacing="sm" justify="space-between">
              <Text variant="body">Base Fare</Text>
              <Text variant="body" weight="medium">
                {formatCurrency(baseFare)}
              </Text>
            </Stack>

            {vehicleUpgrade > 0 && (
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Text variant="body">Vehicle Upgrade</Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(vehicleUpgrade)}
                </Text>
              </Stack>
            )}

            {serviceLevel > 0 && (
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Text variant="body">Service Level</Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(serviceLevel)}
                </Text>
              </Stack>
            )}

            <Card variant="default" padding="xs">
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Text variant="body">Subtotal</Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(subtotal)}
                </Text>
              </Stack>
            </Card>

            {tipAmount > 0 && (
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Stack direction="horizontal" spacing="sm" align="center">
                  <Badge variant="success">💡</Badge>
                  <Text variant="body">Tip ({tipPercent}%)</Text>
                </Stack>
                <Text variant="body" weight="medium">
                  {formatCurrency(tipAmount)}
                </Text>
              </Stack>
            )}

            <Card variant="elevated" padding="md">
              <Stack direction="horizontal" spacing="sm" justify="space-between">
                <Text variant="lead" weight="bold">Total</Text>
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