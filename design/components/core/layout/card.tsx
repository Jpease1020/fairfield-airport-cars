'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, transitions } from '../../../design-system/tokens';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { Stack } from './layout/containers';
import { Text } from './text';

// Styled card component with consistent styling approach
const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'hoverable', 'fullWidth', 'isClickable', 'disabled'].includes(prop)
})<{
  variant: 'default' | 'outlined' | 'elevated' | 'light' | 'dark' | 'action' | 'info' | 'help' | 'stat';
  size: 'sm' | 'md' | 'lg';
  hoverable: boolean;
  fullWidth: boolean;
  isClickable: boolean;
  disabled: boolean;
}>`
  display: block;
  border-radius: ${borderRadius.md};
  transition: ${transitions.default};
  cursor: ${({ isClickable, disabled }) => {
    if (disabled) return 'not-allowed';
    if (isClickable) return 'pointer';
    return 'default';
  }};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.md};
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.lg};
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.xl};
          font-size: ${fontSize.lg};
        `;
      default:
        return `
          padding: ${spacing.lg};
          font-size: ${fontSize.md};
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
      case 'action':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      case 'info':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      case 'help':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      case 'stat':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
    }
  }}

  /* Hover effects */
  ${({ hoverable, isClickable, disabled }) => {
    if (!hoverable || disabled) return '';
    return `
      &:hover {
        transform: ${isClickable ? 'translateY(-2px)' : 'none'};
        box-shadow: ${shadows.md};
      }
    `;
  }}
`;

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'light' | 'dark' | 'action' | 'info' | 'help' | 'stat';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  statNumber?: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  'aria-label'?: string;
  as?: 'div' | 'article' | 'section';
  fullWidth?: boolean;
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  hoverable = false,
  onClick,
  href,
  disabled = false,
  icon,
  title,
  description,
  statNumber,
  statChange,
  changeType = 'neutral',
  'aria-label': ariaLabel,
  as: Component = 'div',
  fullWidth = false,
  ...rest
}) => {
  const isClickable = !!(onClick || href);

  const handleClick = () => {
    if (disabled || !isClickable) return;
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const renderContent = () => {
    if (title || description || icon || statNumber) {
      return (
        <>
          {(title || icon) && (
            <Stack direction="vertical" spacing="md">
              {title && (
                <Text size="md" weight="semibold">
                  {typeof title === 'string' ? <EditableText field="card.title" defaultValue={title} /> : title}
                </Text>
              )}
            </Stack>
          )}
          <Stack direction="vertical" spacing="md">
            {description && (
              <Text size="md" color="secondary">
                {typeof description === 'string' ? <EditableText field="card.description" defaultValue={description} /> : description}
              </Text>
            )}
            {statNumber && (
              <Stack direction="horizontal" align="center" spacing="sm">
                <Text size="lg" weight="semibold">{statNumber}</Text>
                {statChange && (
                  <Text 
                    size="sm" 
                    color={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'error' : 'secondary'}
                  >
                    {statChange}
                  </Text>
                )}
              </Stack>
            )}
            {children}
          </Stack>
        </>
      );
    }
    return children;
  };

  return (
    <StyledCard
      variant={variant}
      size={size}
      hoverable={hoverable}
      isClickable={isClickable}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      as={Component}
      {...rest}
    >
      {renderContent()}
    </StyledCard>
  );
};

 