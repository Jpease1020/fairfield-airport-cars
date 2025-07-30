import React from 'react';
import { ActivityItem } from './ActivityItem';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

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
  emptyMessage?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  emptyMessage = 'No activities to display'
}) => {
  if (activities.length === 0) {
    return (
      <Container>
        <Stack align="center" spacing="md">
          <Span>📭</Span>
          <Text variant="muted">{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack spacing="md">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          icon={activity.icon}
          title={activity.title}
          subtitle={activity.subtitle}
          amount={activity.amount}
          href={activity.href}
          onClick={activity.onClick}
        />
      ))}
    </Stack>
  );
}; 