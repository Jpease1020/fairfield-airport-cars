import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack, Card } from '@/components/ui/containers';
import { Button } from './button';

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
      <Link href={href}>
        <Card variant="outlined" padding={size}>
          {content}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button onClick={onClick}>
        <Card variant="outlined" padding={size}>
          {content}
        </Card>
      </Button>
    );
  }

  return (
    <Card variant="outlined" padding={size}>
      {content}
    </Card>
  );
}; 