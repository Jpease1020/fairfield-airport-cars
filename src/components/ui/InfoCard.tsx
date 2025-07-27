import React from 'react';
import { Container, H3, Text } from '@/components/ui';

interface InfoCardProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  icon?: string;     // Icon support
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  subtitle,
  icon,
  children,
  className = '',
  theme = 'light',
  variant = 'default'
}) => {
  const cardClass = [
    'info-card',
    `info-card-${variant}`,
    theme === 'dark' ? 'info-card-dark' : 'info-card-light',
    className
  ].filter(Boolean).join(' ');

  // Use subtitle as fallback for description
  const cardDescription = description || subtitle;

  return (
    <Container className={cardClass}>
      <Container className="info-card-header">
        <H3 className="info-card-title">
          {icon && (
            <span className="info-card-icon">
              {icon}
            </span>
          )}
          {title}
        </H3>
        {cardDescription && (
          <Text className="info-card-description">
            {cardDescription}
          </Text>
        )}
      </Container>
      <Container className="info-card-body">
        {children}
      </Container>
    </Container>
  );
}; 