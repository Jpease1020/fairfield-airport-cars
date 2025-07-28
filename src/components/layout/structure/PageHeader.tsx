import React from 'react';
import { Container, H1, Text } from '@/components/ui';
import { EditableText, EditableHeading } from '@/components/ui';

interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'left' | 'center' | 'right';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  padding = 'lg',
  margin = 'none'
}) => {
  return (
    <Container as="header" padding={padding} margin={margin}>
      {title && (
        <EditableHeading field="page_header.title" defaultValue={title}>
          {title}
        </EditableHeading>
      )}
      {subtitle && (
        <EditableText field="page_header.subtitle" defaultValue={subtitle}>
          {subtitle}
        </EditableText>
      )}
      {children}
    </Container>
  );
};

PageHeader.displayName = 'PageHeader'; 