import React from 'react';
import { Container, H3, Text, Span } from '@/components/ui';

interface InfoCardProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  icon?: string;     // Icon support
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  subtitle,
  icon,
  children,
  theme = 'light',
  variant = 'default'
}) => {
  // Use subtitle as fallback for description
  const cardDescription = description || subtitle;

  return (
    <Container>
      <Container>
        <H3>
          {icon && (
            <Span>
              {icon}
            </Span>
          )}
          {title}
        </H3>
        {cardDescription && (
          <Text>
            {cardDescription}
          </Text>
        )}
      </Container>
      <Container>
        {children}
      </Container>
    </Container>
  );
}; 