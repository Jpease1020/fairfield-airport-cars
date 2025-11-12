'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Container,
  Stack,
  Text,
  Button,
  Box,
  Input,
  Label,
  Alert
} from '@/design/ui';

interface TipCalculatorProps {
  baseAmount: number;
  onTipChange: (tipAmount: number, tipPercentage: number) => void;
  initialTipPercentage?: number;
  disabled?: boolean;
  cmsData: any;
}

const TIP_PERCENTAGES = [15, 18, 20, 25];

export function TipCalculator() {
  return null;
}