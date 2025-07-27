'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from './button';
import { Container } from './containers';

interface HelpTooltipProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  size = 'md',
  variant = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Container variant={variant}>
      <Button
        variant="ghost"
        size={size}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <HelpCircle />
      </Button>
      
      {isVisible && (
        <Container variant="tooltip">
          {content}
        </Container>
      )}
    </Container>
  );
};

export { HelpTooltip }; 