import React from 'react';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface ActivityItemProps {
  icon: string;
  iconType?: 'success' | 'pending' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  iconType = 'info',
  title,
  subtitle,
  amount,
  href,
  onClick,
  className = '',
  theme = 'light'
}) => {
  const itemClass = [
    'activity-item',
    theme === 'dark' ? 'dark-theme' : '',
    (href || onClick) ? 'activity-item-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <Container>
        <Span>{icon}</Span>
      </Container>
      <Stack>
        <Text>{title}</Text>
        {subtitle && <Text>{subtitle}</Text>}
      </Stack>
      {amount && (
        <Container>
          <Span>{amount}</Span>
        </Container>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Container className={className}>
      {content}
    </Container>
  );
}; 