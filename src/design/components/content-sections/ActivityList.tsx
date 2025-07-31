'use client';

import React from 'react';
import { Stack, Container, Box, Text, H4, ActivityItem } from '@/design/ui';

interface ActivityData {
  id: string | number;
  icon: string;
  iconType?: 'success' | 'pending' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
}

interface ActivityListProps {
  activities: ActivityData[];
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

/**
 * ActivityList - A stack layout for activity items
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const activities = [
 *   { id: 1, icon: "🚗", title: "Booking Created", subtitle: "2 hours ago" },
 *   { id: 2, icon: "✅", title: "Payment Received", subtitle: "1 hour ago" }
 * ];
 * 
 * <ActivityList activities={activities} spacing="md" />
 * ```
 */
export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  spacing = 'md',
  showCards = true,
  emptyMessage = 'No activities to display',
  emptyIcon = '📭'
}) => {
  if (activities.length === 0) {
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
    <Stack direction="vertical" spacing={spacing}>
      {activities.map((activity) => {
        const content = (
          <ActivityItem
            icon={activity.icon}
            title={activity.title}
            subtitle={activity.subtitle}
            amount={activity.amount}
            href={activity.href}
            onClick={activity.onClick}
          />
        );

        return (
          <Container key={activity.id}>
            {showCards ? (
              <Box variant="default" padding="md">
                {content}
              </Box>
            ) : (
              content
            )}
          </Container>
        );
      })}
    </Stack>
  );
}; 