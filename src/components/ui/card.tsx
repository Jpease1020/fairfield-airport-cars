import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled card component with proper prop filtering
const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'hoverable', 'clickable'].includes(prop)
})<{
  variant: 'default' | 'outlined' | 'elevated' | 'light' | 'dark';
  size: 'sm' | 'md' | 'lg';
  hoverable: boolean;
  clickable: boolean;
}>`
  display: block;
  border-radius: ${borderRadius.lg};
  transition: ${transitions.default};
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.light};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.md};
        `;
      case 'md':
        return `
          padding: ${spacing.lg};
        `;
      case 'lg':
        return `
          padding: ${spacing.xl};
        `;
      default:
        return `
          padding: ${spacing.lg};
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      case 'outlined':
        return `
          background-color: transparent;
          border: 2px solid ${colors.border.default};
          box-shadow: none;
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: none;
          box-shadow: ${shadows.lg};
        `;
      case 'light':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.light};
          box-shadow: none;
        `;
      case 'dark':
        return `
          background-color: ${colors.gray[800]};
          border: 1px solid ${colors.gray[700]};
          color: ${colors.text.white};
          box-shadow: ${shadows.md};
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
    }
  }}

  /* Interactive states */
  ${({ hoverable, clickable }) => {
    if (hoverable || clickable) {
      return `
        cursor: ${clickable ? 'pointer' : 'default'};
        
        &:hover {
          transform: ${hoverable ? 'translateY(-2px)' : 'none'};
          box-shadow: ${hoverable ? shadows.lg : 'inherit'};
        }
        
        &:active {
          transform: ${clickable ? 'translateY(0)' : 'none'};
        }
      `;
    }
    return '';
  }}

  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
`;

// Styled card header
const StyledCardHeader = styled.div<{ variant: 'default' | 'centered' | 'minimal'; spacing: 'sm' | 'md' | 'lg' }>`
  margin-bottom: ${({ spacing: spacingValue }) => {
    switch (spacingValue) {
      case 'sm': return spacing.sm;
      case 'md': return spacing.md;
      case 'lg': return spacing.lg;
      default: return spacing.md;
    }
  }};
  
  ${({ variant }) => {
    switch (variant) {
      case 'centered':
        return `
          text-align: center;
        `;
      case 'minimal':
        return `
          padding-bottom: ${spacing.sm};
          border-bottom: 1px solid ${colors.border.light};
        `;
      default:
        return '';
    }
  }}
`;

// Styled card body
const StyledCardBody = styled.div<{ spacing: 'none' | 'sm' | 'md' | 'lg' | 'xl'; padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' }>`
  ${({ padding }) => {
    switch (padding) {
      case 'none': return 'padding: 0;';
      case 'sm': return `padding: ${spacing.sm};`;
      case 'md': return `padding: ${spacing.md};`;
      case 'lg': return `padding: ${spacing.lg};`;
      case 'xl': return `padding: ${spacing.xl};`;
      default: return `padding: ${spacing.md};`;
    }
  }}
  
  ${({ spacing: spacingValue }) => {
    if (spacingValue === 'none') return '';
    
    return `
      > * + * {
        margin-top: ${spacingValue === 'sm' ? spacing.sm : spacingValue === 'lg' ? spacing.lg : spacingValue === 'xl' ? spacing.xl : spacing.md};
      }
    `;
  }}
`;

// Styled card title
const StyledCardTitle = styled.h3<{ size: 'sm' | 'md' | 'lg' | 'xl'; variant: 'default' | 'prominent' | 'subtle' }>`
  margin: 0;
  font-weight: ${fontWeight.semibold};
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm': return `font-size: ${fontSize.md};`;
      case 'md': return `font-size: ${fontSize.lg};`;
      case 'lg': return `font-size: ${fontSize.xl};`;
      case 'xl': return `font-size: ${fontSize['2xl']};`;
      default: return `font-size: ${fontSize.lg};`;
    }
  }}
  
  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'prominent':
        return `
          color: ${colors.primary[600]};
          font-weight: ${fontWeight.bold};
        `;
      case 'subtle':
        return `
          color: ${colors.text.secondary};
          font-weight: ${fontWeight.normal};
        `;
      default:
        return `
          color: ${colors.text.primary};
        `;
    }
  }}
`;

// Styled card description
const StyledCardDescription = styled.p<{ size: 'sm' | 'md' | 'lg'; color: 'default' | 'muted' | 'secondary' }>`
  margin: 0;
  line-height: 1.5;
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm': return `font-size: ${fontSize.sm};`;
      case 'md': return `font-size: ${fontSize.md};`;
      case 'lg': return `font-size: ${fontSize.lg};`;
      default: return `font-size: ${fontSize.md};`;
    }
  }}
  
  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'muted':
        return `color: ${colors.text.disabled};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

export interface CardProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'outlined' | 'elevated' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  
  // Interactive
  onClick?: () => void;
  hoverable?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // Polymorphic support
  as?: 'div' | 'article' | 'section';
  
  // Rest props
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({
  // Core props
  children,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // Interactive
  onClick,
  hoverable = false,
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // Polymorphic support
  as: Component = 'div',
  
  // Rest props
  ...rest
}) => {
  const isClickable = Boolean(onClick);
  
  return (
    <StyledCard
      as={Component}
      variant={variant}
      size={size}
      hoverable={hoverable}
      clickable={isClickable}
      onClick={onClick}
      aria-label={ariaLabel}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      {...rest}
    >
      {children}
    </StyledCard>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'centered' | 'minimal';
  spacing?: 'sm' | 'md' | 'lg';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  variant = 'default',
  spacing = 'md'
}) => {
  return (
    <StyledCardHeader variant={variant} spacing={spacing}>
      {children}
    </StyledCardHeader>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  spacing = 'md',
  padding = 'md'
}) => {
  return (
    <StyledCardBody spacing={spacing} padding={padding}>
      {children}
    </StyledCardBody>
  );
};

export interface CardTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'prominent' | 'subtle';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  size = 'md',
  variant = 'default'
}) => {
  return (
    <StyledCardTitle size={size} variant={variant}>
      {children}
    </StyledCardTitle>
  );
};

export interface CardDescriptionProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'muted' | 'secondary';
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  size = 'md',
  color = 'default'
}) => {
  return (
    <StyledCardDescription size={size} color={color}>
      {children}
    </StyledCardDescription>
  );
}; 