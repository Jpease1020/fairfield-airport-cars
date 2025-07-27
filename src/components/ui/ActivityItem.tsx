import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Button } from './button';

interface ActivityItemProps {
  icon: string;
  iconType?: 'success' | 'pending' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
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
  theme = 'light'
}) => {
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
      <Link href={href}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button onClick={onClick}>
        {content}
      </Button>
    );
  }

  return (
    <Container>
      {content}
    </Container>
  );
}; 