import React from 'react';
import { Alert } from './Alert';
import { Button } from './button';
import { Container, Span, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  retryLabel?: string;
  showRetryButton?: boolean;
  variant?: 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  retry,
  retryLabel = 'Try Again',
  showRetryButton = false,
  variant = 'error',
  size = 'md'
}) => {
  return (
    <Container variant="default" padding={size}>
      <Stack direction="vertical" spacing="lg">
        <Alert variant={variant} title={title}>
          <Text size="sm">
            {message}
          </Text>
        </Alert>
        
        {showRetryButton && retry && (
          <Container variant="default">
            <Button 
              onClick={retry}
              variant="outline"
              size={size}
            >
              <Stack direction="horizontal" spacing="xs" align="center">
                <Span>🔄</Span>
                <Text size="sm">
                  {retryLabel}
                </Text>
              </Stack>
            </Button>
          </Container>
        )}
      </Stack>
    </Container>
  );
}; 