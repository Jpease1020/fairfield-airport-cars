'use client';

import React from 'react';
import styled from 'styled-components';
import { Container } from '../layout/containers/Container';
import { H1 } from '../components/base-components/text/Headings';
import { Text } from '../components/base-components/text/Text';
import { FlexboxMargin } from '../system/shared-types';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

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
  margin?: FlexboxMargin; // Limited margin for flexbox positioning
  spacing?: 'sm' | 'md' | 'lg';
  cmsData?: any;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  actions = [],
  padding = 'lg',
  margin = 'none',
  spacing = 'md',
  cmsData
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
          <H1>
            {getCMSField(cmsData, 'page_header-title', title)}
          </H1>
        ) : (
          title
        )
      )}
      {subtitle && (
        typeof subtitle === 'string' ? (
          <Text>
            {getCMSField(cmsData, 'page_header-subtitle', subtitle)}
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