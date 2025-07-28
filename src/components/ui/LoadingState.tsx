import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Container, H3, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'centered' | 'inline' | 'overlay';
  spacing?: 'compact' | 'normal' | 'relaxed';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  subtitle,
  message,
  showSpinner = true,
  size = 'md',
  variant = 'centered',
  spacing = 'normal'
}) => {
  const spacingMap: Record<string, 'sm' | 'md' | 'lg'> = {
    compact: 'sm',
    normal: 'md',
    relaxed: 'lg'
  };

  return (
    <Container 
      variant={variant === 'overlay' ? 'elevated' : 'default'} 
      padding={spacingMap[spacing]}
    >
      <Stack direction="vertical" spacing={spacingMap[spacing]} align="center">
        {showSpinner && (
          <Container variant="default">
            <LoadingSpinner size={size} />
          </Container>
        )}
        
        <Stack direction="vertical" spacing="xs" align="center">
          <H3 size={size}>
            {title}
          </H3>
          
          {subtitle && (
            <Text variant="muted" size="sm">
              {subtitle}
            </Text>
          )}
          
          {message && (
            <Text size="sm">
              {message}
            </Text>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}; 