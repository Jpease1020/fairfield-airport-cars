import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Button } from './button';

interface AlertItemProps {
  icon: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
  theme?: 'light' | 'dark';
}

export const AlertItem: React.FC<AlertItemProps> = ({
  icon,
  type = 'info',
  title,
  message,
  href,
  onClick,
  onDismiss,
  theme = 'light'
}) => {
  const content = (
    <>
      <Container>
        <Span>{icon}</Span>
      </Container>
      <Stack>
        <Text>{title}</Text>
        <Text>{message}</Text>
      </Stack>
      {onDismiss && (
        <Button 
          onClick={() => onDismiss()}
          aria-label="Dismiss alert"
        >
          ✕
        </Button>
      )}
    </>
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
      <Button onClick={onClick}>
        {content}
      </Button>
    );
  }

  return (
    <Container>
      {content}
    </Container>
  );
}; 