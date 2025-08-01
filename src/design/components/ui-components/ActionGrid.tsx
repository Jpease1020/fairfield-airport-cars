import React from 'react';
import { Box, Grid } from '@/ui';
import { Container, Text, Span } from '@/ui';
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
        <Box
          key={action.id}
          variant="elevated"
          padding={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
        >
          {action.label}
        </Box>
      ))}
    </Grid>
  );
}; 