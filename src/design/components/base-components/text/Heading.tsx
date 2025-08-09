'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';
import { BaseComponentProps, TextVariant, TextSize, FontWeight, TextAlign, ColorVariant } from '../../../system/shared-types';

// Styled heading component
const StyledHeading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align'].includes(prop)
})<{
  variant: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align: 'left' | 'center' | 'right';
}>`
  margin: 0;
  line-height: 1.2;
  font-family: ${fontFamily.sans};
  transition: ${transitions.default};

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
      case '2xl':
        return `font-size: ${fontSize['2xl']};`;
      case '3xl':
        return `font-size: ${fontSize['3xl']};`;
      case '4xl':
        return `font-size: ${fontSize['4xl']};`;
      case '5xl':
        return `font-size: ${fontSize['5xl']};`;
      case '6xl':
        return `font-size: ${fontSize['6xl']};`;
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
      case 'extrabold':
        return `font-weight: 800;`; // Note: fontWeight doesn't have extrabold, using hardcoded value
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
      default:
        return `text-align: left;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'accent':
        return `color: ${colors.primary[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

export interface HeadingProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  
  // HTML attributes
  id?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  cmsKey?: string; // optional explicit cms path
  
  // Rest props
  [key: string]: any;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  weight = 'normal',
  align = 'left',
  id, 
  as: Component = 'h1',
  cmsKey,
  ...rest
}) => {
  const ref = React.useRef<HTMLElement | null>(null);
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      ref={ref as any}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
}; 