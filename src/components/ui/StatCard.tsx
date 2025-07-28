import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, transitions } from '@/lib/design-system/tokens';
import { H3, Text, Link } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/components/ui';

// Styled stat card container
const StatCardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'default' | 'highlighted' | 'minimal';
  size: 'sm' | 'md' | 'lg';
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
      case 'highlighted':
        return `
          background-color: ${colors.primary[50]};
          border: 1px solid ${colors.primary[200]};
        `;
      case 'minimal':
        return `
          background-color: transparent;
          border: 1px solid ${colors.border.default};
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
        return `
          padding: ${spacing.md};
          gap: ${spacing.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.lg};
          gap: ${spacing.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.xl};
          gap: ${spacing.lg};
        `;
      default:
        return `
          padding: ${spacing.lg};
          gap: ${spacing.md};
        `;
    }
  }}

  /* Hover effects */
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
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
  variant: 'default' | 'highlighted' | 'minimal';
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
      case 'minimal':
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
  variant: 'default' | 'highlighted' | 'minimal';
  size: 'sm' | 'md' | 'lg';
}>`
  font-weight: ${fontWeight.bold};
  color: ${({ variant }) => {
    switch (variant) {
      case 'highlighted':
        return colors.primary[700];
      case 'minimal':
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
  variant?: 'default' | 'highlighted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
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
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const cardContent = (
    <StatCardContainer variant={variant} size={size} {...rest}>
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
      </Stack>
      
      {children}
    </StatCardContainer>
  );

  if (href) {
    return (
      <Link href={href}>
        <div id={id}>
          {cardContent}
        </div>
      </Link>
    );
  }

  return (
    <div id={id}>
      {cardContent}
    </div>
  );
}; 