import React from 'react';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface AlertItemProps {
  icon: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
  className?: string;
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
  className = '',
  theme = 'light'
}) => {
  const itemClass = [
    'alert-item',
    type,
    theme === 'dark' ? 'dark-theme' : '',
    (href || onClick) ? 'alert-item-clickable' : '',
    className
  ].filter(Boolean).join(' ');

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
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDismiss();
          }}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Container className={className}>
      {content}
    </Container>
  );
}; 