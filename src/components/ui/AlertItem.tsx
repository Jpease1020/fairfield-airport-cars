import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { Button } from './button';

interface AlertItemProps {
  icon: string;
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const AlertItem: React.FC<AlertItemProps> = ({
  icon,
  title,
  message,
  href,
  onClick,
  onDismiss,
  variant = 'default',
  size = 'md'
}) => {
  const content = (
    <Container variant="default" padding={size}>
      <Stack direction="horizontal" spacing="md" align="center">
        <Container variant="default">
          <Span>{icon}</Span>
        </Container>
        
        <Stack direction="vertical" spacing="xs">
          <Text variant="body" size={size}>
            {title}
          </Text>
          <Text size="sm">
            {message}
          </Text>
        </Stack>
        
        {onDismiss && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            ✕
          </Button>
        )}
      </Stack>
    </Container>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button 
        variant="ghost" 
        onClick={onClick}
        fullWidth
      >
        {content}
      </Button>
    );
  }

  return content;
}; 