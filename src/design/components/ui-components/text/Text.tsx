'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';

// Styled text component
const StyledText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align', 'color'].includes(prop)
})<{
  variant: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align: 'left' | 'center' | 'right' | 'justify';
  color: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
}>`
  margin: 0;
  font-family: ${fontFamily.sans};
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'body':
        return `line-height: 1.6;`;
      case 'lead':
        return `line-height: 1.6; font-weight: ${fontWeight.medium};`;
      case 'small':
        return `line-height: 1.4;`;
      case 'muted':
        return `line-height: 1.5;`;
      case 'caption':
        return `line-height: 1.4; text-transform: none;`;
      case 'overline':
        return `line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em;`;
      default:
        return `line-height: 1.6;`;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}

  /* Align styles */
  ${({ align }) => {
    switch (align) {
      case 'left':
        return `text-align: left;`;
      case 'center':
        return `text-align: center;`;
      case 'right':
        return `text-align: right;`;
      case 'justify':
        return `text-align: justify;`;
      default:
        return `text-align: left;`;
    }
  }}

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      case 'info':
        return `color: ${colors.primary[600]};`;
      case 'inherit':
        return `color: inherit;`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

export interface TextProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
  
  // HTML attributes
  as?: 'p' | 'span' | 'div' | 'article' | 'blockquote';
  
  // Rest props
  [key: string]: any;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  align = 'left',
  color = 'default',
  as: Component = 'p',
  ...rest
}) => {
  return (
    <StyledText
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      color={color}
      {...rest}
    >
      {children}
    </StyledText>
  );
}; 