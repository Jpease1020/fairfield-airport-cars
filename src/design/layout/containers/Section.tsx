'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, transitions } from '@/design/system/tokens/tokens';
import { Container } from './Container';
import { BaseLayoutProps, SectionVariant, SpacingScale, MaxWidth } from '@/design/system/shared-types';

// Layout Section Props
interface LayoutSectionProps extends BaseLayoutProps {
  variant?: SectionVariant;
  padding?: SpacingScale;
  container?: boolean;
  maxWidth?: MaxWidth;
  fullWidth?: boolean;
}

const StyledSection = styled.section.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  variant: 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
      case '2xl':
        return `padding: ${spacing['2xl']};`;
      default:
        return `padding: ${spacing.lg};`;
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
      case 'alternate':
        return `
          background-color: ${colors.background.secondary};
        `;
      case 'brand':
        return `
          background-color: ${colors.primary[50]};
          color: ${colors.primary[900]};
        `;
      case 'muted':
        return `
          background-color: ${colors.gray[50]};
          color: ${colors.gray[700]};
        `;
      case 'hero':
        return `
          background-color: ${colors.primary[600]};
          color: ${colors.text.white};
        `;
      case 'cta':
        return `
          background-color: ${colors.success[600]};
          color: ${colors.text.white};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

export const LayoutSection: React.FC<LayoutSectionProps> = ({ 
  variant = 'default', 
  padding = 'lg', 
  container = true, 
  maxWidth = '2xl',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  fullWidth = false,
  as: Component = 'section',
  children,
  id,
  ...rest
}) => {
  if (container && !fullWidth) {
    return (
      <StyledSection
        variant={variant}
        padding={padding}
        margin={margin}
        marginTop={marginTop}
        marginBottom={marginBottom}
        as={Component}
        id={id}
        {...rest}
      >
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </StyledSection>
    );
  }

  return (
    <StyledSection
      variant={variant}
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledSection>
  );
}; 