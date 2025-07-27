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
    <Container className={`flex items-center justify-center ${sizeClasses} ${className}`}>
      <Container className="">
        {showSpinner && (
          <Container className="">
            <LoadingSpinner />
          </Container>
        )}
        <H3 className="">{title}</H3>
        {subtitle && (
          <Text className="">{subtitle}</Text>
        )}
        {message && (
          <Text className="">{message}</Text>
        )}
      </Container>
    </Container>
  );
}; 