import React from 'react';
import { Container, H3, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

// StatCard Component - BULLETPROOF TYPE SAFETY!
interface StatCardProps {
  title: string;
  icon: string;
  statNumber: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  href?: string;
  variant?: 'default' | 'highlighted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  statNumber,
  statChange,
  changeType = 'neutral',
  description,
  href,
  variant = 'default',
  size = 'md'
}) => {
  const cardContent = (
    <>
      <Stack direction="horizontal" justify="between" align="center">
        <H3>{title}</H3>
        <Span>{icon}</Span>
      </Stack>
      <Stack>
        <Span>{statNumber}</Span>
        {statChange && (
          <Text className={`stat-change ${changeType}`}>{statChange}</Text>
        )}
        {description && (
          <Text className="card-description">{description}</Text>
        )}
      </Stack>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`card ${className}`.trim()}>
        {cardContent}
      </a>
    );
  }

  return (
    <Container className={`card ${className}`.trim()}>
      {cardContent}
    </Container>
  );
}; 