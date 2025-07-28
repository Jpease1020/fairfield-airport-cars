import React from 'react';
import { Container, H1, H2 } from '@/components/ui';
import { EditableText, EditableHeading } from '@/components/ui';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  return (
    <Container variant="navigation" as="header">
      <EditableHeading field="header.title" defaultValue={title}>
        {title}
      </EditableHeading>
      <EditableHeading field="header.subtitle" defaultValue={subtitle} level={2}>
        {subtitle}
      </EditableHeading>
    </Container>
  );
}; 