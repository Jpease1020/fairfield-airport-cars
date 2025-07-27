import React from 'react';
import { Container, Text, H3, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

// Clean Alert Component - CASCADE EFFECT FORCES COMPLIANCE!
export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  size = 'md',
  padding = 'md',
  dismissible = false,
  onClose
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

  const getAlertVariant = () => {
    switch (variant) {
      case 'success':
        return 'card';
      case 'error':
        return 'elevated';
      case 'warning':
        return 'card';
      case 'info':
      default:
        return 'default';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <Container
      variant={getAlertVariant()}
      padding={padding}
    >
      <Stack direction="horizontal" spacing="sm" align="start">
        <Span size="lg">{getIcon()}</Span>
        <Stack direction="vertical" spacing="xs" fullWidth>
          {title && (
            <H3 variant="default" size="lg" color={getTextColor()}>
              {title}
            </H3>
          )}
          {children && (
            <Text color={getTextColor()} size={size}>
              {children}
            </Text>
          )}
        </Stack>
        {dismissible && onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </Stack>
    </Container>
  );
};
Alert.displayName = 'Alert';

 