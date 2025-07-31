'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '../../system/tokens/tokens';

// Styled switch root with enhanced accessibility
const StyledSwitch = styled.button.withConfig({
  shouldForwardProp: (prop) => !['checked', 'size', 'disabled', 'variant'].includes(prop)
})<{
  checked: boolean;
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  variant: 'default' | 'success' | 'warning' | 'error';
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border: none;
  background: none;
  padding: 0;
  outline: none;
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          width: 2rem;
          height: 1.25rem;
        `;
      case 'md':
        return `
          width: 2.75rem;
          height: 1.5rem;
        `;
      case 'lg':
        return `
          width: 3.5rem;
          height: 2rem;
        `;
      default:
        return `
          width: 2.75rem;
          height: 1.5rem;
        `;
    }
  }}

  /* Track styles */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({ checked, disabled, variant }) => {
      if (disabled) return colors.gray[300];
      if (!checked) return colors.gray[300];
      
      switch (variant) {
        case 'success':
          return colors.success[600];
        case 'warning':
          return colors.warning[600];
        case 'error':
          return colors.danger[600];
        default:
          return colors.primary[600];
      }
    }};
    transition: ${transitions.default};
  }

  /* Thumb styles */
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background-color: ${colors.background.primary};
    box-shadow: ${({ size, checked }) => {
      const thumbSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : '1rem';
      const translateX = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : '1rem';
      
      return `
        width: ${thumbSize};
        height: ${thumbSize};
        transform: translateX(${checked ? translateX : '0'});
      `;
    }};
    transition: ${transitions.default};
  }

  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }

  /* Disabled styles */
  ${({ disabled }) => disabled && `
    opacity: 0.5;
    
    &::before {
      background-color: ${colors.gray[300]};
    }
  `}

  /* Hover styles */
  &:hover:not(:disabled) {
    &::before {
      background-color: ${({ checked, variant }) => {
        if (!checked) return colors.gray[400];
        
        switch (variant) {
          case 'success':
            return colors.success[700];
          case 'warning':
            return colors.warning[700];
          case 'error':
            return colors.danger[700];
          default:
            return colors.primary[700];
        }
      }};
    }
  }

  /* Active styles */
  &:active:not(:disabled) {
    &::after {
      transform: ${({ size, checked }) => {
        const thumbSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : '1rem';
        const translateX = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : '1rem';
        return `translateX(${checked ? translateX : '0'}) scale(0.95)`;
      }};
    }
  }
`;

// Styled switch label
const SwitchLabel = styled.label<{ size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  user-select: none;
  
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

// Styled switch text
const SwitchText = styled.span<{ size: 'sm' | 'md' | 'lg' }>`
  color: ${colors.text.primary};
  font-weight: 500;
  
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

export interface SwitchProps {
  // Core props
  children?: React.ReactNode;
  
  // State
  checked: boolean;
  defaultChecked?: boolean;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  
  // States
  disabled?: boolean;
  
  // Content
  label?: string;
  
  // Events
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<any>) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // HTML attributes
  name?: string;
  id?: string;
  value?: string;
  
  // Rest props
  [key: string]: any;
}

export const Switch: React.FC<SwitchProps> = React.forwardRef<any, SwitchProps>(({
  // Core props
  children,
  
  // State
  checked,
  defaultChecked,
  
  // Appearance
  size = 'md',
  variant = 'default',
  
  // States
  disabled = false,
  
  // Content
  label,
  
  // Events
  onCheckedChange,
  onChange,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  
  // HTML attributes
  name,
  id,
  value,
  
  // Rest props
  ...rest
}, ref) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleClick = (e: React.MouseEvent<any>) => {
    if (disabled) return;
    
    const newChecked = !currentChecked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
    onChange?.(e as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newChecked = !currentChecked;
      
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      
      onCheckedChange?.(newChecked);
    }
  };

  const switchElement = (
    <StyledSwitch
      ref={ref}
      type="button"
      role="switch"
      aria-checked={currentChecked}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      checked={currentChecked}
      size={size}
      variant={variant}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      name={name}
      id={id}
      value={value}
      tabIndex={disabled ? -1 : 0}
      {...rest}
    >
      {children}
    </StyledSwitch>
  );

  // If label is provided, wrap in label element
  if (label) {
    return (
      <SwitchLabel size={size}>
        {switchElement}
        <SwitchText size={size}>
          {label}
        </SwitchText>
      </SwitchLabel>
    );
  }

  return switchElement;
});

Switch.displayName = 'Switch'; 