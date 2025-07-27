import React from 'react';
import { Alert } from '@/components/feedback';
import { Button } from './button';
import { Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  retryLabel?: string;
  showRetryButton?: boolean;
  variant?: 'error' | 'warning';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  retry,
  retryLabel = 'Try Again',
  showRetryButton = false,
  variant = 'error'
}) => {
  return (
    <Stack spacing="lg">
      <Alert variant={variant} title={title}>
        {message}
      </Alert>
      
      {showRetryButton && retry && (
        <Container>
          <Button 
            onClick={retry}
            variant="outline"
          >
            <Span>🔄</Span>
            <Span>{retryLabel}</Span>
          </Button>
        </Container>
      )}
    </Stack>
  );
}; 