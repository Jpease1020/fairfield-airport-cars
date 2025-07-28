import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';
import { Button } from './button';

// Styled alert component with enhanced prop filtering
const StyledAlert = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'padding', 'dismissible', 'interactive'].includes(prop)
})<{
  variant: 'success' | 'error' | 'warning' | 'info';
  size: 'sm' | 'md' | 'lg';
  padding: 'sm' | 'md' | 'lg' | 'xl';
  dismissible: boolean;
  interactive: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  border-radius: ${borderRadius.lg};
  transition: ${transitions.default};
  position: relative;
  box-shadow: ${shadows.sm};

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

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return `
          background-color: ${colors.success[50]};
          border: 1px solid ${colors.success[200]};
          color: ${colors.success[800]};
        `;
      case 'error':
        return `
          background-color: ${colors.danger[50]};
          border: 1px solid ${colors.danger[200]};
          color: ${colors.danger[800]};
        `;
      case 'warning':
        return `
          background-color: ${colors.warning[50]};
          border: 1px solid ${colors.warning[200]};
          color: ${colors.warning[800]};
        `;
      case 'info':
      default:
        return `
          background-color: ${colors.primary[50]};
          border: 1px solid ${colors.primary[200]};
          color: ${colors.primary[800]};
        `;
    }
  }}

  /* Interactive states */
  ${({ interactive }) => interactive && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${shadows.md};
    }
    
    &:active {
      transform: translateY(0);
    }
  `}

  /* Dismissible styles */
  ${({ dismissible }) => dismissible && `
    padding-right: ${spacing.xl};
  `}

  /* Focus styles for accessibility */
  &:focus-within {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
`;

// Styled icon container with enhanced styling
const IconContainer = styled.div<{ size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          width: 1.25rem;
          height: 1.25rem;
          font-size: 1rem;
        `;
      case 'md':
        return `
          width: 1.5rem;
          height: 1.5rem;
          font-size: 1.25rem;
        `;
      case 'lg':
        return `
          width: 1.75rem;
          height: 1.75rem;
          font-size: 1.5rem;
        `;
      default:
        return `
          width: 1.5rem;
          height: 1.5rem;
          font-size: 1.25rem;
        `;
    }
  }}
`;

// Styled content container with improved layout
const ContentContainer = styled.div<{ hasTitle: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ hasTitle }) => hasTitle ? spacing.xs : '0'};
  flex: 1;
  min-width: 0;
`;

// Styled title with enhanced typography
const AlertTitle = styled.h3<{ size: 'sm' | 'md' | 'lg' }>`
  margin: 0;
  font-weight: 600;
  line-height: 1.4;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled message with improved readability
const AlertMessage = styled.div<{ size: 'sm' | 'md' | 'lg' }>`
  margin: 0;
  line-height: 1.5;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled close button container with improved positioning
const CloseButtonContainer = styled.div<{ size: 'sm' | 'md' | 'lg' }>`
  position: absolute;
  top: ${spacing.sm};
  right: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          top: ${spacing.xs};
          right: ${spacing.xs};
        `;
      case 'lg':
        return `
          top: ${spacing.md};
          right: ${spacing.md};
        `;
      default:
        return '';
    }
  }}
`;

// Styled close button with enhanced accessibility
const CloseButton = styled(Button)`
  border-radius: ${borderRadius.pill};
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize.md};
  line-height: 1;
  opacity: 0.7;
  transition: ${transitions.default};
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export interface AlertProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Content
  title?: string;
  
  // Interactive
  dismissible?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Polymorphic support
  as?: 'div' | 'section' | 'article';
  
  // Rest props
  [key: string]: any;
}

export const Alert: React.FC<AlertProps> = ({
  // Core props
  children,
  
  // Appearance
  variant = 'info',
  size = 'md',
  padding = 'md',
  
  // Content
  title,
  
  // Interactive
  dismissible = false,
  onClose,
  onClick,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  
  // Polymorphic support
  as: Component = 'div',
  
  // Rest props
  ...rest
}) => {
  const isInteractive = Boolean(onClick);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getRole = () => {
    switch (variant) {
      case 'error':
        return 'alert';
      case 'warning':
        return 'alert';
      default:
        return 'status';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isInteractive) {
        onClick?.();
      }
    }
  };

  return (
    <StyledAlert
      as={Component}
      variant={variant}
      size={size}
      padding={padding}
      dismissible={dismissible}
      interactive={isInteractive}
      role={getRole()}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive ? 0 : undefined}
      {...rest}
    >
      <IconContainer size={size} aria-hidden="true">
        {getIcon()}
      </IconContainer>
      
      <ContentContainer hasTitle={Boolean(title)}>
        {title && (
          <AlertTitle size={size}>
            {title}
          </AlertTitle>
        )}
        <AlertMessage size={size}>
          {children}
        </AlertMessage>
      </ContentContainer>
      
      {dismissible && onClose && (
        <CloseButtonContainer size={size}>
          <CloseButton
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close alert"
            type="button"
          >
            ×
          </CloseButton>
        </CloseButtonContainer>
      )}
    </StyledAlert>
  );
};

Alert.displayName = 'Alert';

 