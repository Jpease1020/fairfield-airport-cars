import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';
import { Button } from './button';
import { EditableText } from './EditableText';

// Styled status message container
const StatusMessageContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['type', 'variant', 'size'].includes(prop)
})<{
  type: 'success' | 'error' | 'warning' | 'info';
  variant: 'default' | 'filled' | 'outlined';
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.default};
  transition: ${transitions.default};
  font-size: ${fontSize.md};
  line-height: 1.5;

  /* Type styles */
  ${({ type, variant }) => {
    switch (type) {
      case 'success':
        return variant === 'filled' 
          ? `
            background-color: ${colors.success[50]};
            color: ${colors.success[800]};
            border: 1px solid ${colors.success[200]};
          `
          : `
            background-color: ${colors.background.primary};
            color: ${colors.success[700]};
            border: 1px solid ${colors.success[300]};
          `;
      case 'error':
        return variant === 'filled'
          ? `
            background-color: ${colors.danger[50]};
            color: ${colors.danger[800]};
            border: 1px solid ${colors.danger[200]};
          `
          : `
            background-color: ${colors.background.primary};
            color: ${colors.danger[700]};
            border: 1px solid ${colors.danger[300]};
          `;
      case 'warning':
        return variant === 'filled'
          ? `
            background-color: ${colors.warning[50]};
            color: ${colors.warning[800]};
            border: 1px solid ${colors.warning[200]};
          `
          : `
            background-color: ${colors.background.primary};
            color: ${colors.warning[700]};
            border: 1px solid ${colors.warning[300]};
          `;
      case 'info':
        return variant === 'filled'
          ? `
            background-color: ${colors.primary[50]};
            color: ${colors.primary[800]};
            border: 1px solid ${colors.primary[200]};
          `
          : `
            background-color: ${colors.background.primary};
            color: ${colors.primary[700]};
            border: 1px solid ${colors.primary[300]};
          `;
      default:
        return `
          background-color: ${colors.background.primary};
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.default};
        `;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
    }
  }}

  /* Hover effects */
  &:hover {
    box-shadow: ${shadows.sm};
  }
`;

// Styled content container
const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  flex: 1;
`;

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['type', 'size'].includes(prop)
})<{
  type: 'success' | 'error' | 'warning' | 'info';
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

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

// Styled message container
const MessageContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

// Styled dismiss button container
const DismissButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export interface StatusMessageProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  
  // Behavior
  onDismiss?: () => void;
  dismissible?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  // Core props
  children,
  
  // Content
  type,
  message,
  icon,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // Behavior
  onDismiss,
  dismissible = false,
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    return `${type} message: ${message}`;
  };

  return (
    <StatusMessageContainer
      id={id}
      type={type}
      variant={variant}
      size={size}
      role="alert"
      aria-live="polite"
      aria-label={getAriaLabel()}
      {...rest}
    >
      <ContentContainer>
        <IconContainer type={type} size={size}>
          {icon || getDefaultIcon()}
        </IconContainer>
        
        <MessageContainer>
          <EditableText field="statusmessage.message" defaultValue={message}>
            {message}
          </EditableText>
        </MessageContainer>
      </ContentContainer>
      
      {(onDismiss || dismissible) && (
        <DismissButtonContainer>
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            aria-label="Dismiss message"
          >
            ×
          </Button>
        </DismissButtonContainer>
      )}
      
      {children}
    </StatusMessageContainer>
  );
}; 