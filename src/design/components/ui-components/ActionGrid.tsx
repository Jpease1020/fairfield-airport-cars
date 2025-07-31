import React from 'react';
import { Card } from '@/ui';
import { Container, Text, Span } from '@/ui';
import { Grid } from '@/design/components/grid';
import { Stack } from '@/ui';

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
  emptyMessage?: string;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  actions,
  columns = 4,
  size = 'md',
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
        <Card
          key={action.id}
          variant="action"
          size={size}
          href={action.href}
          onClick={action.onClick}
          disabled={action.disabled}
          icon={action.icon}
          title={action.label}
          description={action.description}
        >
          {action.label}
        </Card>
      ))}
    </Grid>
  );
}; 