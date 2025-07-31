'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/ui';
import { Container, Text } from '@/ui';
import { Stack } from '@/ui';

interface HelpTooltipProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Container variant="default">
      <Stack direction="horizontal" spacing="xs" align="center">
        <Button
          variant="ghost"
          size={size}
          onClick={handleToggle}
          aria-label={`Help: ${content}`}
          aria-expanded={isVisible}
          aria-haspopup="dialog"
        >
          <HelpCircle size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        </Button>
        
        {isVisible && (
          <Container 
            variant="elevated" 
            padding="sm"
            maxWidth="sm"
          >
            <Text size="sm">
              {content}
            </Text>
          </Container>
        )}
      </Stack>
    </Container>
  );
}; 