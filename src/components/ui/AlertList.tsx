import React from 'react';
import { AlertItem } from './AlertItem';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface AlertData {
  id: string | number;
  icon: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface AlertListProps {
  alerts: AlertData[];
  theme?: 'light' | 'dark';
  emptyMessage?: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  theme = 'light',
  emptyMessage = 'No alerts to display'
}) => {
  if (alerts.length === 0) {
    return (
      <Container>
        <Stack align="center" spacing="md">
          <Span>🔔</Span>
          <Text>{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack spacing="md">
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          icon={alert.icon}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          href={alert.href}
          onClick={alert.onClick}
          onDismiss={alert.onDismiss}
          theme={theme}
        />
      ))}
    </Stack>
  );
}; 