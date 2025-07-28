import React from 'react';
import { Container, H3, Text, Span, EditableText } from '@/components/ui';

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
          <EditableText field="infocard.title" defaultValue={title}>
            {title}
          </EditableText>
        </H3>
        {cardDescription && (
          <Text>
            <EditableText field="infocard.description" defaultValue={cardDescription}>
              {cardDescription}
            </EditableText>
          </Text>
        )}
      </Container>
      <Container>
        {children}
      </Container>
    </Container>
  );
}; 