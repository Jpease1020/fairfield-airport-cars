'use client';

import React, { useState, useEffect } from 'react';
import { Text } from '@/design/components/base-components/text/Text';

interface QuoteCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
}

export const QuoteCountdown: React.FC<QuoteCountdownProps> = ({ 
  expiresAt, 
  onExpired 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        onExpired?.();
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const isExpired = timeLeft === 'Expired';
  const isLowTime = timeLeft !== 'Expired' && parseInt(timeLeft.split(':')[0]) < 1;

  return (
    <Text 
      size="sm" 
      weight={isExpired ? "semibold" : "medium"}
      color={isExpired ? "error" : isLowTime ? "warning" : "muted"}
      data-testid="quote-countdown"
    >
      {isExpired ? 'Quote expired' : `Valid for ${timeLeft}`}
    </Text>
  );
};
