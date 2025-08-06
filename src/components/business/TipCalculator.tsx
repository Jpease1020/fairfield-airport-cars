'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Input, 
  Label, 
  Card, 
  Badge,
  Box
} from '@/ui';

interface TipCalculatorProps {
  baseAmount: number;
  onTipChange: (tipAmount: number, tipPercent: number) => void;
  currency?: string;
  showCustomTip?: boolean;
  className?: string;
}

const TIP_OPTIONS = [
  { percent: 0, label: 'No Tip' },
  { percent: 15, label: '15%' },
  { percent: 18, label: '18%' },
  { percent: 20, label: '20%' },
  { percent: 25, label: '25%' }
];

export function TipCalculator({ 
  baseAmount, 
  onTipChange, 
  currency = 'USD',
  showCustomTip = true,
  className 
}: TipCalculatorProps) {
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

  const tipAmount = calculateTip(selectedTip);
  const total = baseAmount + tipAmount;

  return (
    <Container>
      <Card variant="elevated" padding="lg">
        <Stack spacing="lg">
          <Stack spacing="sm">
            <Text variant="h3">💡 Add a Tip</Text>
            <Text variant="body" color="muted">
              Show your appreciation for excellent service
            </Text>
          </Stack>

          <Stack spacing="md">
            <Stack spacing="sm">
              <Label>Tip Percentage</Label>
              <Stack direction="horizontal" spacing="sm" wrap="wrap">
                {TIP_OPTIONS.map((option) => (
                  <Button
                    key={option.percent}
                    variant={selectedTip === option.percent ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleTipSelect(option.percent)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {showCustomTip && (
              <Stack spacing="sm">
                <Label htmlFor="custom-tip">Custom Tip Amount</Label>
                <Input
                  id="custom-tip"
                  type="number"
                  placeholder="Enter custom tip amount"
                  value={customTip}
                  onChange={(e) => handleCustomTip(e.target.value)}
                />
                <Text variant="small" color="muted">
                  Enter a specific dollar amount
                </Text>
              </Stack>
            )}

            <Box variant="elevated" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text variant="body">Base Fare</Text>
                  <Text variant="body" weight="medium">
                    {formatCurrency(baseAmount)}
                  </Text>
                </Stack>

                <Stack direction="horizontal" justify="space-between" align="center">
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <Badge variant="success" size="sm">💡</Badge>
                    <Text variant="body">Tip ({selectedTip}%)</Text>
                  </Stack>
                  <Text variant="body" weight="medium">
                    {formatCurrency(tipAmount)}
                  </Text>
                </Stack>

                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text variant="h4" weight="bold">Total</Text>
                  <Text variant="h4" weight="bold" color="primary">
                    {formatCurrency(total)}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
} 