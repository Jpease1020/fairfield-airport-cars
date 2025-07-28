import React from 'react';
import { Container, H3, Text, Span, EditableText } from '@/components/ui';

interface InfoCardProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  subtitle?: string | React.ReactNode; // Alias for description
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
          {typeof title === 'string' ? (
            <EditableText field="infocard.title" defaultValue={title}>
              {title}
            </EditableText>
          ) : (
            title
          )}
        </H3>
        {cardDescription && (
          <Text>
            {typeof cardDescription === 'string' ? (
              <EditableText field="infocard.description" defaultValue={cardDescription}>
                {cardDescription}
              </EditableText>
            ) : (
              cardDescription
            )}
          </Text>
        )}
      </Container>
      <Container>
        {children}
      </Container>
    </Container>
  );
}; 