'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Card } from '@/components/ui/layout/containers';
import { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui';

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  flex-shrink: 0;
  margin-right: ${spacing.sm};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
          width: 1rem;
          height: 1rem;
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
          width: 1.5rem;
          height: 1.5rem;
        `;
      default:
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
    }
  }}
`;

// Styled title container
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Styled description container
const DescriptionContainer = styled.div`
  margin-top: ${spacing.sm};
  color: ${colors.text.secondary};
`;

export interface FormSectionProps {
  // Core props
  children: React.ReactNode;
  
  // Content
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const FormSection: React.FC<FormSectionProps> = ({
  // Core props
  children,
  
  // Content
  title,
  description,
  icon,
  
  // Appearance
  size = 'md',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  return (
    <Card {...rest}>
      <CardHeader>
        <TitleContainer>
          {icon && (
            <IconContainer size={size}>
              {icon}
            </IconContainer>
          )}
          <CardTitle>
            {title}
          </CardTitle>
        </TitleContainer>
        
        {description && (
          <DescriptionContainer>
            <Text>{description}</Text>
          </DescriptionContainer>
        )}
      </CardHeader>
      
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}; 