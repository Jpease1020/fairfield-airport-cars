'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions, shadows, borderRadius } from '@/lib/design-system/tokens';
import { H3, Text } from '@/components/ui';
import { EditableText } from '@/components/ui';

// Styled card container
const InfoCardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'hover'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  size: 'sm' | 'md' | 'lg';
  hover: boolean;
}>`
  transition: ${transitions.default};
  border-radius: ${borderRadius.default};
  box-shadow: ${shadows.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          box-shadow: ${shadows.lg};
        `;
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${colors.border.default};
        `;
      case 'filled':
        return `
          background-color: ${colors.background.secondary};
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
        `;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}

  /* Hover styles */
  ${({ hover, variant }) => hover && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${shadows.lg};
    }
  `}
`;

// Styled header container
const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

// Styled title container
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Styled icon container
const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  font-size: ${fontSize.lg};
`;

// Styled content container
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

export interface InfoCardProps {
  // Core props
  children: React.ReactNode;
  
  // Content
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  subtitle?: string | React.ReactNode; // Alias for description
  icon?: string;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  hover?: boolean;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  // Core props
  children,
  
  // Content
  title,
  description,
  subtitle,
  icon,
  
  // Appearance
  size = 'md',
  variant = 'default',
  hover = false,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  // Use subtitle as fallback for description
  const cardDescription = description || subtitle;

  return (
    <InfoCardContainer
      variant={variant}
      size={size}
      hover={hover}
      id={id}
      {...rest}
    >
      <HeaderContainer>
        <TitleContainer>
          {icon && (
            <IconContainer>
              {icon}
            </IconContainer>
          )}
          {typeof title === 'string' ? (
            <EditableText field="infocard.title" defaultValue={title}>
              {title}
            </EditableText>
          ) : (
            title
          )}
        </TitleContainer>
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
      </HeaderContainer>
      <ContentContainer>
        {children}
      </ContentContainer>
    </InfoCardContainer>
  );
}; 