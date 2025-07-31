import React from 'react';
import { Container, Text, Span, Link } from '@/ui';
import { Stack } from '@/ui';
import { Button } from '@/ui';

interface ActivityItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  subtitle,
  amount,
  href,
  onClick,
  variant = 'default',
  size = 'md'
}) => {
  const content = (
    <Container variant={variant} padding={size}>
      <Stack direction="horizontal" spacing="md" align="center">
        <Container variant="default">
          <Span>{icon}</Span>
        </Container>
        
        <Stack direction="vertical" spacing="xs">
          <Text variant="body" size={size}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="muted" size="sm">
              {subtitle}
            </Text>
          )}
        </Stack>
        
        {amount && (
          <Container variant="default">
            <Text variant="body" size={size}>
              {amount}
            </Text>
          </Container>
        )}
      </Stack>
    </Container>
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
      <Button 
        variant="ghost" 
        onClick={onClick}
        fullWidth
      >
        {content}
      </Button>
    );
  }

  return content;
}; 