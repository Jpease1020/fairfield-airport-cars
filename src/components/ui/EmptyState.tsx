import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';

// Styled empty state container
const EmptyStateContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'centered'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  centered: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.lg} ${spacing.xl};
        `;
      case 'md':
        return `
          padding: ${spacing.xl} ${spacing['2xl']};
        `;
      case 'lg':
        return `
          padding: ${spacing['2xl']} ${spacing['3xl']};
        `;
      default:
        return `
          padding: ${spacing.xl} ${spacing['2xl']};
        `;
    }
  }}

  /* Centered styles */
  ${({ centered }) => centered && `
    min-height: 200px;
  `}
`;

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  margin-bottom: ${spacing.md};
  color: ${colors.text.secondary};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.xl};
          width: 2rem;
          height: 2rem;
        `;
      case 'md':
        return `
          font-size: ${fontSize['2xl']};
          width: 3rem;
          height: 3rem;
        `;
      case 'lg':
        return `
          font-size: ${fontSize['3xl']};
          width: 4rem;
          height: 4rem;
        `;
      default:
        return `
          font-size: ${fontSize['2xl']};
          width: 3rem;
          height: 3rem;
        `;
    }
  }}
`;

// Styled title container
const TitleContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  margin-bottom: ${spacing.sm};
  color: ${colors.text.primary};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.lg};
          font-weight: 600;
        `;
      case 'md':
        return `
          font-size: ${fontSize.xl};
          font-weight: 600;
        `;
      case 'lg':
        return `
          font-size: ${fontSize['2xl']};
          font-weight: 700;
        `;
      default:
        return `
          font-size: ${fontSize.xl};
          font-weight: 600;
        `;
    }
  }}
`;

// Styled description container
const DescriptionContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  margin-bottom: ${spacing.lg};
  color: ${colors.text.secondary};
  max-width: 400px;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
        `;
      default:
        return `
          font-size: ${fontSize.md};
        `;
    }
  }}
`;

// Styled action container
const ActionContainer = styled.div`
  margin-top: ${spacing.md};
`;

export interface EmptyStateProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  // Core props
  children,
  
  // Content
  icon,
  title,
  description,
  action,
  
  // Appearance
  size = 'md',
  centered = false,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  return (
    <EmptyStateContainer
      id={id}
      size={size}
      centered={centered}
      role="status"
      aria-live="polite"
      {...rest}
    >
      {icon && (
        <IconContainer size={size}>
          {icon}
        </IconContainer>
      )}
      
      {title && (
        <TitleContainer size={size}>
          {title}
        </TitleContainer>
      )}
      
      {description && (
        <DescriptionContainer size={size}>
          {description}
        </DescriptionContainer>
      )}
      
      {action && (
        <ActionContainer>
          {action}
        </ActionContainer>
      )}
      
      {children}
    </EmptyStateContainer>
  );
}; 