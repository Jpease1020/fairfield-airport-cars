import React from 'react';
import { LoadingSpinner } from '@/components/data';
import { Container, H3, Text } from '@/components/ui';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  subtitle,
  message,
  showSpinner = true,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    'sm': 'h-32',
    'md': 'h-64',
    'lg': 'h-96'
  }[size];

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