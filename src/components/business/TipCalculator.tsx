'use client';

import { useState, useEffect } from 'react';
import { 
  Container,
  Stack,
  Text,
  Button,
  Box,
  Input,
  Label,
  Alert
} from '@/ui';

interface TipCalculatorProps {
  baseAmount: number;
  onTipChange: (tipAmount: number, tipPercentage: number) => void;
  initialTipPercentage?: number;
  disabled?: boolean;
  cmsData: any;
}

const TIP_PERCENTAGES = [15, 18, 20, 25];

export function TipCalculator({
  baseAmount,
  onTipChange,
  initialTipPercentage = 20,
  disabled = false,
  cmsData
}: TipCalculatorProps) {
  const [selectedPercentage, setSelectedPercentage] = useState(initialTipPercentage);
  const [customPercentage, setCustomPercentage] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate tip and total when base amount or percentage changes
  useEffect(() => {
    const percentage = customPercentage ? parseFloat(customPercentage) : selectedPercentage;
    const calculatedTip = (baseAmount * percentage) / 100;
    const calculatedTotal = baseAmount + calculatedTip;

    setTipAmount(calculatedTip);
    setTotalAmount(calculatedTotal);
    onTipChange(calculatedTip, percentage);
  }, [baseAmount, selectedPercentage, customPercentage, onTipChange]);

  // Handle percentage selection
  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    setCustomPercentage('');
  };

  // Handle custom percentage input
  const handleCustomPercentageChange = (value: string) => {
    setCustomPercentage(value);
    if (value) {
      setSelectedPercentage(0);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container>
      <Stack spacing="lg">
        {/* Header */}
        <Stack spacing="sm">
          <Text weight="bold" size="lg" cmsId="tip-calculator-add-tip">{cmsData?.['tipCalculatorAddTip'] || 'Add a Tip'}</Text>
          <Text variant="muted" cmsId="tip-calculator-appreciation">
            {cmsData?.['tipCalculatorAppreciation'] || 'Show your appreciation for excellent service'}
          </Text>
        </Stack>

        {/* Base Amount Display */}
        <Box variant="outlined" padding="md">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text cmsId="tip-calculator-base-fare">{cmsData?.['tipCalculatorBaseFare'] || 'Base Fare'}</Text>
            <Text weight="bold" cmsId="ignore">{formatCurrency(baseAmount)}</Text>
          </Stack>
        </Box>

        {/* Tip Percentage Options */}
        <Stack spacing="md">
          <Text weight="bold" cmsId="tip-calculator-select-tip-percentage">{cmsData?.['tipCalculatorSelectTipPercentage'] || 'Select Tip Percentage'}</Text>
          
          <Stack direction="horizontal" spacing="sm">
            {TIP_PERCENTAGES.map((percentage) => (
              <Button
                key={percentage}
                variant={selectedPercentage === percentage && !customPercentage ? 'primary' : 'outline'}
                onClick={() => handlePercentageSelect(percentage)}
                disabled={disabled}
                size="sm"
                cmsId="ignore"
              text={`${percentage}%`}
            />
            ))}
          </Stack>

          {/* Custom Percentage Input */}
          <Stack spacing="sm">
            <Label htmlFor="customTip" cmsId="tip-calculator-custom-percentage">{cmsData?.['tipCalculatorCustomPercentage'] || 'Custom Percentage'}</Label>
            <Input
              id="customTip"
              type="number"
              value={customPercentage}
              onChange={(e) => handleCustomPercentageChange(e.target.value)}
              placeholder="Enter custom percentage"
              min="0"
              max="100"
              step="0.1"
              disabled={disabled}
              fullWidth
              cmsId="ignore"
            />
          </Stack>
        </Stack>

        {/* Tip Amount Display */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" cmsId="tip-calculator-tip-breakdown">{cmsData?.['tipCalculatorTipBreakdown'] || 'Tip Breakdown'}</Text>
            
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="tip-calculator-tip-amount">{cmsData?.['tipCalculatorTipAmount'] || 'Tip Amount'}</Text>
                <Text weight="bold">{formatCurrency(tipAmount)}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                  <Text cmsId="tip-calculator-tip-percentage">{cmsData?.['tipCalculatorTipPercentage'] || 'Tip Percentage'}</Text>
                <Text weight="bold">
                  {customPercentage ? `${customPercentage}%` : `${selectedPercentage}%`}
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Total Amount */}
        <Box variant="elevated" padding="lg">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text weight="bold" size="lg" cmsId="tip-calculator-total-amount">{cmsData?.['tipCalculatorTotalAmount'] || 'Total Amount'}</Text>
            <Text weight="bold" size="xl" cmsId="ignore">{formatCurrency(totalAmount)}</Text>
          </Stack>
        </Box>

        {/* Information */}
        <Alert variant="info">
          <Text size="sm" cmsId="tip-calculator-information">{cmsData?.['tipCalculatorInformation'] || 'Tips help support our drivers and ensure excellent service. All tips go directly to your driver.'}</Text>
        </Alert>
      </Stack>
    </Container>
  );
} 