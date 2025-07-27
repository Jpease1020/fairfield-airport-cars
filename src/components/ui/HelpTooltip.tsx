'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from './button';
import { Container } from './containers';

interface HelpTooltipProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  size = 'md'
}) => {
  const [isVisible] = React.useState(false);

  return (
    <Container>
      <Button
        variant="ghost"
        size={size}
      >
        <HelpCircle />
      </Button>
      
      {isVisible && (
        <Container>
          {content}
        </Container>
      )}
    </Container>
  );
}; 