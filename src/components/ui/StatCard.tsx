import React from 'react';
import { Container, H3, Text } from '@/components/ui';

interface StatCardProps {
  title: string;
  icon: string;
  statNumber: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  href?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  statNumber,
  statChange,
  changeType = 'neutral',
  description,
  href,
  className = ''
}) => {
  const cardContent = (
    <>
      <Container >
        <H3 >{title}</H3>
        <span >{icon}</span>
      </Container>
      <Container >
        <div >{statNumber}</div>
        {statChange && (
          <Text className={`stat-change ${changeType}`}>{statChange}</Text>
        )}
        {description && (
          <Text className="card-description">{description}</Text>
        )}
      </Container>
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