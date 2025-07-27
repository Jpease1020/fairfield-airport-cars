import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Container, H4, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'info', 
    title, 
    children, 
    onClose,
    dismissible = false,
    ...props 
  }, ref) => {
    const variantClasses = {
      success: 'bg-bg-success border-border-success text-text-success',
      error: 'bg-bg-error border-border-error text-text-error',
      warning: 'bg-bg-warning border-border-warning text-text-warning',
      info: 'bg-bg-info border-border-info text-text-info',
    };

    const iconClasses = {
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info',
    };

    return (
      <Container
        className={className}
        {...props}
      >
        <Stack direction="horizontal" align="center" justify="between">
          <Container>
            {title && (
              <H4>{title}</H4>
            )}
            <Text size="sm">
              {children}
            </Text>
          </Container>
          {dismissible && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X />
            </Button>
          )}
        </Stack>
      </Container>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert }; 