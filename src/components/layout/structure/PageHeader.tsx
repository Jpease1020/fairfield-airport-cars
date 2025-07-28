import React from 'react';
import styled from 'styled-components';
import { Container } from '@/components/ui';
import { EditableText, EditableHeading } from '@/components/ui';

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode[];
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'sm' | 'md' | 'lg';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  actions = [],
  padding = 'lg',
  margin = 'none',
  spacing = 'md'
}) => {
  return (
    <Container 
      as="header" 
      padding={padding} 
      margin={margin}
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
      {actions && actions.length > 0 && (
        <ActionsContainer>
          {actions}
        </ActionsContainer>
      )}
      {children}
    </Container>
  );
};

PageHeader.displayName = 'PageHeader'; 