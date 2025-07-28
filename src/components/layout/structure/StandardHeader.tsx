import React from 'react';
import { Container, H1, H2 } from '@/components/ui';
import { EditableText, EditableHeading } from '@/components/ui';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'start' | 'center' | 'end';
  spacing?: 'sm' | 'md' | 'lg';
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ 
  title, 
  subtitle, 
  align = 'start',
  spacing = 'md'
}) => {
  return (
    <Container variant="navigation" as="header" spacing={spacing}>
      <EditableHeading field="header.title" defaultValue={title}>
        {title}
      </EditableHeading>
      {subtitle && (
        <EditableHeading field="header.subtitle" defaultValue={subtitle} level={2}>
          {subtitle}
        </EditableHeading>
      )}
    </Container>
  );
}; 