'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, fontSize, fontWeight, fontFamily, transitions } from '../../../system/tokens/tokens';

// Styled link component
const StyledLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'external'].includes(prop)
})<{
  variant: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size: 'sm' | 'base' | 'lg';
  external: boolean;
}>`
  font-family: ${fontFamily.sans};
  text-decoration: none;
  transition: ${transitions.default};
  cursor: pointer;

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          color: ${colors.primary[600]};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
      case 'secondary':
        return `
          color: ${colors.text.secondary};
          
          &:hover {
            color: ${colors.text.primary};
            text-decoration: underline;
          }
        `;
      case 'muted':
        return `
          color: ${colors.text.secondary};
          
          &:hover {
            color: ${colors.text.primary};
            text-decoration: underline;
          }
        `;
      case 'underline':
        return `
          color: ${colors.primary[600]};
          text-decoration: underline;
          
          &:hover {
            color: ${colors.primary[800]};
          }
        `;
      case 'button':
        return `
          color: ${colors.primary[600]};
          font-weight: ${fontWeight.medium};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
      default:
        return `
          color: ${colors.primary[600]};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'base':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Focus styles */
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
`;

export interface LinkProps {
  // Core props
  children: React.ReactNode;
  href: string;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size?: 'sm' | 'base' | 'lg';
  
  // Behavior
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  external?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  target = '_self',
  rel,
  variant = 'primary',
  size = 'base',
  external = false,
  ...rest
}) => {
  const linkRel = external ? 'noopener noreferrer' : rel;

  return (
    <StyledLink
      href={href}
      target={target}
      rel={linkRel}
      variant={variant}
      size={size}
      external={external}
      {...rest}
    >
      {children}
    </StyledLink>
  );
}; 