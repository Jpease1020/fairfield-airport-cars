'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, transitions, shadows, borderRadius } from '@/lib/design-system/tokens';
import { H3, Text, Link } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/components/ui';

// Styled stat card container
const StatCardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'hover'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  size: 'sm' | 'md' | 'lg';
  hover: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
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
  justify-content: space-between;
  align-items: center;
`;

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
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
      case 'elevated':
        return `color: ${colors.primary[600]};`;
      case 'outlined':
        return `color: ${colors.text.secondary};`;
      case 'filled':
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

// Styled stat number container
const StatNumberContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  size: 'sm' | 'md' | 'lg';
}>`
  font-weight: ${fontWeight.bold};
  color: ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return colors.primary[700];
      case 'outlined':
        return colors.text.primary;
      case 'filled':
        return colors.text.primary;
      default:
        return colors.text.primary;
    }
  }};
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.lg};`;
      case 'md':
        return `font-size: ${fontSize.xl};`;
      case 'lg':
        return `font-size: ${fontSize['2xl']};`;
      default:
        return `font-size: ${fontSize.xl};`;
    }
  }}
`;

// Styled change indicator
const ChangeIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['changeType', 'size'].includes(prop)
})<{
  changeType: 'positive' | 'negative' | 'neutral';
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: ${fontSize.sm};
  font-weight: ${fontWeight.medium};
  transition: ${transitions.default};

  /* Change type styles */
  ${({ changeType }) => {
    switch (changeType) {
      case 'positive':
        return `color: ${colors.success[600]};`;
      case 'negative':
        return `color: ${colors.danger[600]};`;
      case 'neutral':
        return `color: ${colors.text.secondary};`;
      default:
        return `color: ${colors.text.secondary};`;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.xs};`;
      case 'md':
        return `font-size: ${fontSize.sm};`;
      case 'lg':
        return `font-size: ${fontSize.md};`;
      default:
        return `font-size: ${fontSize.sm};`;
    }
  }}
`;

export interface StatCardProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  title: string | React.ReactNode;
  icon: React.ReactNode;
  statNumber: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string | React.ReactNode;
  
  // Behavior
  href?: string;
  
  // Appearance
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const StatCard: React.FC<StatCardProps> = ({
  // Core props
  children,
  
  // Content
  title,
  icon,
  statNumber,
  statChange,
  changeType = 'neutral',
  description,
  
  // Behavior
  href,
  
  // Appearance
  variant = 'default',
  size = 'md',
  hover = false,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const cardContent = (
    <StatCardContainer variant={variant} size={size} hover={hover} {...rest}>
      <HeaderContainer>
        <H3>
          {typeof title === 'string' ? (
            <EditableText field="statcard.title" defaultValue={title}>
              {title}
            </EditableText>
          ) : (
            title
          )}
        </H3>
        <IconContainer variant={variant} size={size}>
          {icon}
        </IconContainer>
      </HeaderContainer>
      
      <Stack>
        <StatNumberContainer variant={variant} size={size}>
          {statNumber}
        </StatNumberContainer>
        
        {statChange && (
          <ChangeIndicator changeType={changeType} size={size}>
            {statChange}
          </ChangeIndicator>
        )}
        
        {description && (
          <Text>
            {typeof description === 'string' ? (
              <EditableText field="statcard.description" defaultValue={description}>
                {description}
              </EditableText>
            ) : (
              description
            )}
          </Text>
        )}
        
        {children}
      </Stack>
    </StatCardContainer>
  );

  if (href) {
    return (
      <Link href={href}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}; 