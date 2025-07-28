import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack, Card } from '@/components/ui/containers';
import { Button } from './button';
import { EditableText } from '@/components/ui';

interface ActionCardProps {
  icon: string;
  label: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
  description?: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  href,
  onClick,
  description,
  size = 'md',
  disabled = false
}) => {
  const content = (
    <Stack spacing="sm" align="center">
      <Container>
        <Span>{icon}</Span>
      </Container>
      {typeof label === 'string' ? (
        <EditableText field="actioncard.label" defaultValue={label}>
          {label}
        </EditableText>
      ) : (
        label
      )}
      {description && (
        typeof description === 'string' ? (
          <EditableText field="actioncard.description" defaultValue={description}>
            {description}
          </EditableText>
        ) : (
          description
        )
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