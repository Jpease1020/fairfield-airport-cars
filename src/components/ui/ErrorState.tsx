import React from 'react';
import { Alert } from '@/components/feedback';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  retryLabel?: string;
  showRetryButton?: boolean;
  variant?: 'error' | 'warning';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  retry,
  retryLabel = 'Try Again',
  showRetryButton = false,
  variant = 'error',
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant={variant} title={title}>
        {message}
      </Alert>
      
      {showRetryButton && retry && (
        <div className="">
          <Button 
            onClick={retry}
            variant="outline"
            className=""
          >
            <span>🔄</span>
            <span>{retryLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}; 