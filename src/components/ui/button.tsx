import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';
import { Spinner } from './spinner';

// Styled button component with all CSS rules defined
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'shape', 'fullWidth', 'loading', 'icon', 'iconPosition'].includes(prop)
})<{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'default' | 'rounded' | 'pill' | 'square';
  fullWidth: boolean;
  loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-shadow: ${shadows.default};
  opacity: ${({ loading }) => (loading ? 0.5 : 1)};
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: none;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.xs};
        `;
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.sm} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.md} ${spacing.xl};
          font-size: ${fontSize.lg};
        `;
      case 'xl':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.xl};
        `;
      default:
        return `
          padding: ${spacing.sm} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${colors.primary[600]};
          color: ${colors.text.white};
        `;
      case 'secondary':
        return `
          background-color: ${colors.secondary[600]};
          color: ${colors.text.white};
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.default};
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${colors.text.primary};
        `;
      case 'danger':
        return `
          background-color: ${colors.danger[600]};
          color: ${colors.text.white};
        `;
      case 'success':
        return `
          background-color: ${colors.success[600]};
          color: ${colors.text.white};
        `;
      case 'warning':
        return `
          background-color: ${colors.warning[600]};
          color: ${colors.text.white};
        `;
      default:
        return `
          background-color: ${colors.primary[600]};
          color: ${colors.text.white};
        `;
    }
  }}

  /* Shape styles */
  ${({ shape }) => {
    switch (shape) {
      case 'default':
        return `border-radius: ${borderRadius.default};`;
      case 'rounded':
        return `border-radius: ${borderRadius.md};`;
      case 'pill':
        return `border-radius: ${borderRadius.pill};`;
      case 'square':
        return `border-radius: ${borderRadius.none};`;
      default:
        return `border-radius: ${borderRadius.default};`;
    }
  }}

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;



// Styled icon wrapper
const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  margin-${({ position }) => position === 'left' ? 'right' : 'left'}: ${spacing.sm};
`;

// Button Component - Clean Reusable Component (No className!)
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  shape?: 'default' | 'rounded' | 'pill' | 'square';
  as?: 'button' | 'a' | 'div';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  shape = 'default',
  as: Component = 'button'
}) => {
  return (
    <StyledButton
      as={Component}
      variant={variant}
      size={size}
      shape={shape}
      fullWidth={fullWidth}
      loading={loading}
      type={Component === 'button' ? type : undefined}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && (
        <Spinner size="sm" />
      )}
      {icon && !loading && iconPosition === 'left' && (
        <IconWrapper position="left">{icon}</IconWrapper>
      )}
      <span aria-hidden={loading}>{children}</span>
      {icon && !loading && iconPosition === 'right' && (
        <IconWrapper position="right">{icon}</IconWrapper>
      )}
    </StyledButton>
  );
}; 