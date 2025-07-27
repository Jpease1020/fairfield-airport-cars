import React from 'react';
import { Container, Text, Span, Link } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Button } from './button';

interface ActivityItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  subtitle,
  amount,
  href,
  onClick,
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