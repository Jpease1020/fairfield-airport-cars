import React from 'react';
import { ActionCard } from './ActionCard';
import { Container, Text, Span } from '@/components/ui';
import { Grid, Stack } from '@/components/ui/layout/containers';

interface ActionData {
  id: string | number;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  description?: string;
  variant?: 'default' | 'outlined' | 'filled';
  disabled?: boolean;
}

interface ActionGridProps {
  actions: ActionData[];
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  emptyMessage?: string;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  actions,
  columns = 4,
  size = 'md',
  theme = 'light',
  emptyMessage = 'No actions available'
}) => {
  if (actions.length === 0) {
    return (
      <Container>
        <Stack align="center" spacing="md">
          <Span>⚡</Span>
          <Text variant="muted">{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Grid cols={columns as 1 | 2 | 3 | 4 | 5 | 6 | 12} gap="md">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          icon={action.icon}
          label={action.label}
          href={action.href}
          onClick={action.onClick}
          description={action.description}
          variant={action.variant}
          size={size}
          theme={theme}
          disabled={action.disabled}
        />
      ))}
    </Grid>
  );
}; 