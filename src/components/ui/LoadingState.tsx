import React from 'react';
import { LoadingSpinner } from '@/components/data';
import { Container, H3, Text } from '@/components/ui';

// LoadingState Component - BULLETPROOF TYPE SAFETY!
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
}) => {

  return (
        <Container>
      <Container>
        {showSpinner && (
          <Container>
            <LoadingSpinner />
          </Container>
        )}
        <H3>{title}</H3>
        {subtitle && (
          <Text>{subtitle}</Text>
        )}
        {message && (
          <Text>{message}</Text>
        )}
      </Container>
    </Container>
  );
}; 