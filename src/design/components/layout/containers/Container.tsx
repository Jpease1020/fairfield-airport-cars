'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, transitions } from '../../../system/tokens/tokens';

// Core Container component - foundational layout component
interface ContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
}

const StyledContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'maxWidth', 'padding', 'margin', 'marginTop', 'marginBottom', 'spacing'].includes(prop)
})<{
  variant: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  transition: ${transitions.default};

  /* Max width styles */
  ${({ maxWidth }) => {
    switch (maxWidth) {
      case 'sm':
        return `max-width: 24rem;`;
      case 'md':
        return `max-width: 28rem;`;
      case 'lg':
        return `max-width: 32rem;`;
      case 'xl':
        return `max-width: 36rem;`;
      case '2xl':
        return `max-width: 42rem;`;
      case 'full':
        return `max-width: 100%;`;
      default:
        return `max-width: 36rem;`;
    }
  }}

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
        return `padding: ${spacing.md};`;
    }
  }}

  /* Margin styles */
  ${({ margin }) => {
    switch (margin) {
      case 'none':
        return `margin: 0 auto;`; // Center the container
      case 'xs':
        return `margin: ${spacing.xs} auto;`;
      case 'sm':
        return `margin: ${spacing.sm} auto;`;
      case 'md':
        return `margin: ${spacing.md} auto;`;
      case 'lg':
        return `margin: ${spacing.lg} auto;`;
      case 'xl':
        return `margin: ${spacing.xl} auto;`;
      case '2xl':
        return `margin: ${spacing['2xl']} auto;`;
      default:
        return `margin: 0 auto;`; // Center the container
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
      case 'card':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          box-shadow: ${shadows.default};
        `;
      case 'section':
        return `
          background-color: ${colors.background.secondary};
          border-radius: ${borderRadius.default};
        `;
      case 'main':
        return `
          background-color: ${colors.background.primary};
          min-height: 100vh;
        `;
      case 'content':
        return `
          background-color: ${colors.background.primary};
          border-radius: ${borderRadius.default};
        `;
      case 'navigation':
        return `
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.default};
        `;
      case 'tooltip':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.sm};
          box-shadow: ${shadows.lg};
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          box-shadow: ${shadows.lg};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

export const Container: React.FC<ContainerProps> = ({ 
  children,
  variant = 'default',
  maxWidth = '2xl', 
  padding = 'md', 
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  spacing = 'none',
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <StyledContainer
      variant={variant}
      maxWidth={maxWidth}
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      spacing={spacing}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledContainer>
  );
};

// Spacer component - simple spacing utility
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
}

const StyledSpacer = styled.div<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis: 'horizontal' | 'vertical';
}>`
  ${({ size, axis }) => {
    const space = spacing[size];
    return axis === 'horizontal' 
      ? `width: ${space}; height: 1px;`
      : `height: ${space}; width: 100%;`;
  }}
`;

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  axis = 'vertical' 
}) => {
  return <StyledSpacer size={size} axis={axis} />;
};

// PositionedContainer component - for positioning needs
interface PositionedContainerProps {
  children: React.ReactNode;
  position?: 'fixed' | 'absolute' | 'relative';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display?: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
}

const StyledPositionedContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['position', 'top', 'right', 'bottom', 'left', 'zIndex', 'display', 'flexDirection', 'alignItems', 'justifyContent'].includes(prop)
})<{
  position: 'fixed' | 'absolute' | 'relative';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}>`
  position: ${({ position }) => position};
  ${({ top }) => top && `top: ${top};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ bottom }) => bottom && `bottom: ${bottom};`}
  ${({ left }) => left && `left: ${left};`}
  ${({ zIndex }) => zIndex && `z-index: ${zIndex};`}
  display: ${({ display }) => display};
  ${({ display, flexDirection, alignItems, justifyContent }) => 
    display === 'flex' && `
      flex-direction: ${flexDirection};
      align-items: ${alignItems};
      justify-content: ${justifyContent};
    `
  }
`;

export const PositionedContainer: React.FC<PositionedContainerProps> = ({
  children,
  position = 'relative',
  top,
  right,
  bottom,
  left,
  zIndex,
  display = 'block',
  flexDirection = 'row',
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <StyledPositionedContainer
      position={position}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      zIndex={zIndex}
      display={display}
      flexDirection={flexDirection}
      alignItems={alignItems}
      justifyContent={justifyContent}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledPositionedContainer>
  );
}; 