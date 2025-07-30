'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '../../../design/design-system/tokens';
import { Card } from '@/design/components/core/layout/card';
import { Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/design/components/core/layout/EditableSystem';

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'default' | 'highlighted' | 'compact';
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'highlighted':
        return `color: ${colors.primary[600]};`;
      case 'compact':
        return `color: ${colors.text.secondary};`;
      default:
        return `color: ${colors.text.secondary};`;
    }
  }}

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

// Styled content container
const ContentContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})<{
  variant: 'default' | 'highlighted' | 'compact';
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  flex: 1;
  min-width: 0;

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'highlighted':
        return `
          color: ${colors.text.primary};
        `;
      case 'compact':
        return `
          color: ${colors.text.secondary};
        `;
      default:
        return `
          color: ${colors.text.primary};
        `;
    }
  }}
`;

// Styled title container
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-weight: 600;
`;

export interface HelpCardProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  icon: React.ReactNode;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'highlighted' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const HelpCard: React.FC<HelpCardProps> = ({
  // Core props
  children,
  
  // Content
  icon,
  title,
  description,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  return (
    <Card id={id} {...rest}>
      <Stack spacing="sm">
          <TitleContainer>
            <IconContainer variant={variant} size={size}>
              {icon}
            </IconContainer>
            
            {typeof title === 'string' ? (
              <EditableText field="helpcard.title" defaultValue={title}>
                {title}
              </EditableText>
            ) : (
              title
            )}
          </TitleContainer>
          
          <ContentContainer variant={variant}>
            {typeof description === 'string' ? (
              <EditableText field="helpcard.description" defaultValue={description}>
                {description}
              </EditableText>
            ) : (
              description
            )}
          </ContentContainer>
          
          {children}
        </Stack>
    </Card>
  );
}; 