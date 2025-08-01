'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '@/design/system/tokens/tokens';
import { BoxProps } from './types';

const StyledBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'rounded', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  transition: ${transitions.default};

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return `padding: 0;`;
      case 'xs':
        return `padding: ${spacing.xs};`;
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

  /* Border radius styles */
  ${({ rounded }) => {
    switch (rounded) {
      case 'none':
        return `border-radius: 0;`;
      case 'sm':
        return `border-radius: ${borderRadius.sm};`;
      case 'md':
        return `border-radius: ${borderRadius.default};`;
      case 'lg':
        return `border-radius: ${borderRadius.lg};`;
      case 'xl':
        return `border-radius: ${borderRadius.xl};`;
      case 'full':
        return `border-radius: 50%;`;
      default:
        return `border-radius: ${borderRadius.default};`;
    }
  }}

  /* Margin styles */
  ${({ margin }) => {
    switch (margin) {
      case 'none':
        return `margin: 0;`;
      case 'xs':
        return `margin: ${spacing.xs};`;
      case 'sm':
        return `margin: ${spacing.sm};`;
      case 'md':
        return `margin: ${spacing.md};`;
      case 'lg':
        return `margin: ${spacing.lg};`;
      case 'xl':
        return `margin: ${spacing.xl};`;
      case '2xl':
        return `margin: ${spacing['2xl']};`;
      default:
        return `margin: 0;`;
    }
  }}

  /* Margin top styles */
  ${({ marginTop }) => {
    switch (marginTop) {
      case 'none':
        return `margin-top: 0;`;
      case 'xs':
        return `margin-top: ${spacing.xs};`;
      case 'sm':
        return `margin-top: ${spacing.sm};`;
      case 'md':
        return `margin-top: ${spacing.md};`;
      case 'lg':
        return `margin-top: ${spacing.lg};`;
      case 'xl':
        return `margin-top: ${spacing.xl};`;
      case '2xl':
        return `margin-top: ${spacing['2xl']};`;
      default:
        return `margin-top: 0;`;
    }
  }}

  /* Margin bottom styles */
  ${({ marginBottom }) => {
    switch (marginBottom) {
      case 'none':
        return `margin-bottom: 0;`;
      case 'xs':
        return `margin-bottom: ${spacing.xs};`;
      case 'sm':
        return `margin-bottom: ${spacing.sm};`;
      case 'md':
        return `margin-bottom: ${spacing.md};`;
      case 'lg':
        return `margin-bottom: ${spacing.lg};`;
      case 'xl':
        return `margin-bottom: ${spacing.xl};`;
      case '2xl':
        return `margin-bottom: ${spacing['2xl']};`;
      default:
        return `margin-bottom: 0;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
          background-color: transparent;
        `;
    }
  }}
`;

export const Box: React.FC<BoxProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  as: Component = 'div',
  ...rest
}) => {
  return (
    <StyledBox
      variant={variant}
      padding={padding}
      rounded={rounded}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      as={Component}
      {...rest}
    >
      {children}
    </StyledBox>
  );
};

export type { BoxProps }; 