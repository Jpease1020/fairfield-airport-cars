'use client';

import React from 'react';
import styled from 'styled-components';
import { Container } from '../layout/containers/Container';
import { useCMSData, getCMSField } from '../providers/CMSDesignProvider';
import { Heading } from '../components/base-components/text/Heading';
import { Text } from '../components/base-components/text/Text';

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
  const { cmsData } = useCMSData();
  return (
    <Container 
      as="header" 
      padding={padding} 
      margin={margin}
      spacing={spacing}
    >
      {title && (
        typeof title === 'string' ? (
          <Heading>
            {getCMSField(cmsData, 'page_header.title', title)}
          </Heading>
        ) : (
          title
        )
      )}
      {subtitle && (
        typeof subtitle === 'string' ? (
          <Text>
            {getCMSField(cmsData, 'page_header.subtitle', subtitle)}
          </Text>
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