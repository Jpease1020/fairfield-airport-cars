import React from 'react';
import { Container } from '@/components/ui';
import { EditableText, EditableHeading } from '@/components/ui';

interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'left' | 'center' | 'right';
  spacing?: 'sm' | 'md' | 'lg';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  padding = 'lg',
  margin = 'none',
  align = 'left',
  spacing = 'md'
}) => {
  return (
    <Container 
      as="header" 
      padding={padding} 
      margin={margin}
      align={align}
      spacing={spacing}
    >
      {title && (
        typeof title === 'string' ? (
          <EditableHeading field="page_header.title" defaultValue={title}>
            {title}
          </EditableHeading>
        ) : (
          title
        )
      )}
      {subtitle && (
        typeof subtitle === 'string' ? (
          <EditableText field="page_header.subtitle" defaultValue={subtitle}>
            {subtitle}
          </EditableText>
        ) : (
          subtitle
        )
      )}
      {children}
    </Container>
  );
};

PageHeader.displayName = 'PageHeader'; 