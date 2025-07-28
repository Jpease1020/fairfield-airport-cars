'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { H3, Text } from '@/components/ui';
import { EditableText } from '@/components/ui';

// Styled card container
const InfoCardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'theme'].includes(prop)
})<{
  variant: 'default' | 'outlined' | 'elevated';
  theme: 'light' | 'dark';
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  border-radius: 8px;
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${colors.border.default};
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
        `;
    }
  }}

  /* Theme styles */
  ${({ theme }) => {
    switch (theme) {
      case 'dark':
        return `
          background-color: ${colors.background.secondary};
          color: ${colors.text.primary};
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          color: ${colors.text.primary};
        `;
    }
  }}
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
  theme?: 'light' | 'dark';
  variant?: 'default' | 'outlined' | 'elevated';
  
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
  theme = 'light',
  variant = 'default',
  
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
      theme={theme}
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