import React from 'react';
import { Container, Text, Span } from '@/components/ui';
import { Stack, Card } from '@/components/ui/containers';

interface ActionCardProps {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  description?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  href,
  onClick,
  description,
  variant = 'default',
  size = 'md',
  theme = 'light',
  disabled = false
}) => {
  const content = (
    <Stack spacing="sm" align="center">
      <Container>
        <Span>{icon}</Span>
      </Container>
      <Span>{label}</Span>
      {description && (
        <Text variant="muted">{description}</Text>
      )}
    </Stack>
  );

  if (disabled) {
    return (
      <Card variant="outlined" padding={size}>
        {content}
      </Card>
    );
  }

  if (href) {
    return (
      <a href={href}>
        <Card variant="outlined" padding={size}>
          {content}
        </Card>
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick}>
        <Card variant="outlined" padding={size}>
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card variant="outlined" padding={size}>
      {content}
    </Card>
  );
}; 