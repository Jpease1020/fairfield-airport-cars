import React from 'react';
import { Container, Text, H3 } from '@/components/ui';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onClose?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({
  variant = 'info',
  title,
  children,
  className,
  ...props
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <Container
      className={className}
      {...props}
    >
      {getIcon()}
      {title && (
        <H3>
          {title}
        </H3>
      )}
      {children && (
        <Text>
          {children}
        </Text>
      )}
    </Container>
  );
});
Alert.displayName = 'Alert';

 