'use client';

import React, { useState } from 'react';
import { Container } from '@/design/layout/containers/Container';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';
import { Input } from '@/design/components/base-components/forms/Input';
import { Label } from '@/design/components/base-components/forms/Label';
import { Button } from '@/design/components/base-components/Button';
import { Card } from '@/design/layout/content/Card';
import { Badge } from '@/design/components/base-components/Badge';

interface TipCalculatorProps {
  baseAmount: number;
  onTipChange: (tipAmount: number, tipPercent: number) => void;
  currency?: string;
}

const TIP_OPTIONS = [
  { percent: 0, label: 'No Tip' },
  { percent: 10, label: '10%' },
  { percent: 15, label: '15%' },
  { percent: 18, label: '18%' },
  { percent: 20, label: '20%' },
  { percent: 25, label: '25%' }
];

export function TipCalculator({ baseAmount, onTipChange, currency = 'USD' }: TipCalculatorProps) {
  const [selectedTip, setSelectedTip] = useState(18);
  const [customTip, setCustomTip] = useState('');

  const calculateTip = (percent: number) => {
    return Math.round((baseAmount * percent) / 100);
  };

  const handleTipSelect = (percent: number) => {
    setSelectedTip(percent);
    setCustomTip('');
    onTipChange(calculateTip(percent), percent);
  };

  const handleCustomTip = (value: string) => {
    setCustomTip(value);
    const amount = parseFloat(value) || 0;
    const percent = baseAmount > 0 ? Math.round((amount / baseAmount) * 100) : 0;
    setSelectedTip(percent);
    onTipChange(amount, percent);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Container variant="default" padding="md">
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" spacing="lg">
          <Stack direction="vertical" spacing="sm">
            <Text variant="lead" weight="bold">
              💡 Tip Calculator
            </Text>
            <Text variant="small" color="muted">
              Calculate your tip based on service quality
            </Text>
          </Stack>

          <Stack direction="vertical" spacing="md">
            <Stack direction="vertical" spacing="sm">
              <Label htmlFor="bill-amount">Bill Amount</Label>
              <Input
                id="bill-amount"
                type="number"
                placeholder="Enter bill amount"
                value={baseAmount.toString()}
                onChange={(e) => onTipChange(parseFloat(e.target.value) || 0, selectedTip)}
              />
            </Stack>

            <Stack direction="vertical" spacing="sm">
              <Label>Tip Percentage</Label>
              <Stack direction="horizontal" spacing="sm">
                {TIP_OPTIONS.map((option) => (
                  <Button
                    key={option.percent}
                    variant={selectedTip === option.percent ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleTipSelect(option.percent)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Stack direction="vertical" spacing="sm">
              <Label htmlFor="custom-tip">Custom Tip</Label>
              <Text variant="small" color="muted">
                Enter a custom tip amount
              </Text>
              <Input
                id="custom-tip"
                type="number"
                placeholder="Enter custom tip"
                value={customTip}
                onChange={(e) => handleCustomTip(e.target.value)}
              />
            </Stack>

            <Card variant="default" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Stack direction="horizontal" spacing="sm" justify="space-between">
                  <Text variant="body">Bill Amount</Text>
                  <Text variant="body" weight="medium">
                    {formatCurrency(baseAmount)}
                  </Text>
                </Stack>

                <Stack direction="horizontal" spacing="sm" justify="space-between">
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <Badge variant="success">💡</Badge>
                    <Text variant="body">Tip ({selectedTip}%)</Text>
                  </Stack>
                  <Text variant="body" weight="medium">
                    {formatCurrency(calculateTip(selectedTip))}
                  </Text>
                </Stack>

                <Stack direction="horizontal" spacing="sm" justify="space-between">
                  <Text variant="lead" weight="bold">Total</Text>
                  <Text variant="lead" weight="bold">
                    {formatCurrency(baseAmount + calculateTip(selectedTip))}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
} 