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
    <div className={`flex items-center justify-center ${sizeClasses} ${className}`}>
      <div className="text-center">
        {showSpinner && (
          <div className="mb-4">
            <LoadingSpinner />
          </div>
        )}
        <H3 className="text-lg font-medium text-text-primary mb-2">{title}</H3>
        {subtitle && (
          <Text className="text-text-secondary mb-2">{subtitle}</Text>
        )}
        {message && (
          <Text className="text-text-light">{message}</Text>
        )}
      </div>
    </div>
  );
}; 