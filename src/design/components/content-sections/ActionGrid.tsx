'use client';

import { Container, Stack, Box, Grid, Col, Text, H4, Button } from '@/ui';
import React from 'react';

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
  emptyIcon?: string;
}

/**
 * ActionGrid - A grid layout for action buttons/cards
 * Built on Layer 1 (Grid) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const actions = [
 *   { id: 1, icon: "🚗", label: "Book Ride", onClick: () => {} },
 *   { id: 2, icon: "📞", label: "Call Us", href: "tel:+1234567890" }
 * ];
 * 
 * <ActionGrid actions={actions} columns={3} />
 * ```
 */
export const ActionGrid: React.FC<ActionGridProps> = ({
  actions,
  columns = 4,
  size = 'md',
  emptyMessage = 'No actions available',
  emptyIcon = '⚡'
}) => {
  if (actions.length === 0) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="muted">{emptyIcon}</Text>
          <Text variant="muted">{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Grid cols={columns as 1 | 2 | 3 | 4 | 5 | 6 | 12} gap="md">
      {actions.map((action) => (
        <Col key={action.id}>
          <Box variant="default" padding="md">
            <Stack direction="vertical" spacing="md" align="center">
              <Container>
                <Text size={size === 'lg' ? 'xl' : size === 'sm' ? 'sm' : 'md'}>
                  {action.icon}
                </Text>
              </Container>
              
              <Container>
                <H4>{action.label}</H4>
                {action.description && (
                  <Text variant="muted" size="sm">
                    {action.description}
                  </Text>
                )}
              </Container>
              
              <Container>
                {action.href ? (
                  <a href={action.href}>
                    <Button
                      variant={action.variant === 'outlined' ? 'outline' : action.variant === 'filled' ? 'primary' : 'outline'}
                      size={size}
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant={action.variant === 'outlined' ? 'outline' : action.variant === 'filled' ? 'primary' : 'outline'}
                    size={size}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                )}
              </Container>
            </Stack>
          </Box>
        </Col>
      ))}
    </Grid>
  );
}; 