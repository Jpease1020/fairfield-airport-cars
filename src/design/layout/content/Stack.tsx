'use client';

import React from 'react';
import styled from 'styled-components';
import { spacing, transitions } from '@/design/system/tokens/tokens';
import { StackProps } from './types';

const StyledStack = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'spacing', 'align', 'justify', 'wrap', 'padding', 'margin'].includes(prop)
})<{
  direction: any;
  spacing: any;
  align: any;
  justify: any;
  wrap: any;
  padding: any;
  margin: any;
}>`
  display: flex;
  flex-direction: ${({ direction }) => {
    if (typeof direction === 'string') {
      return direction === 'horizontal' ? 'row' : 'column';
    }
    return direction?.xs === 'horizontal' ? 'row' : 'column';
  }};
  align-items: ${({ align }) => {
    if (typeof align === 'string') return align;
    return align?.xs || 'flex-start';
  }};
  justify-content: ${({ justify }) => {
    if (typeof justify === 'string') return justify;
    return justify?.xs || 'flex-start';
  }};
  flex-wrap: ${({ wrap }) => {
    if (typeof wrap === 'string') return wrap;
    return wrap?.xs || 'nowrap';
  }};
  gap: ${({ spacing: spacingProp }) => {
    if (typeof spacingProp === 'string') {
      if (spacingProp === 'none') return '0';
      return spacingProp === 'xs' ? spacing.xs :
             spacingProp === 'sm' ? spacing.sm :
             spacingProp === 'md' ? spacing.md :
             spacingProp === 'lg' ? spacing.lg :
             spacingProp === 'xl' ? spacing.xl :
             spacingProp === '2xl' ? spacing['2xl'] : '0';
    }
    const space = spacingProp?.xs || 'md';
    return space === 'none' ? '0' : spacing[space as keyof typeof spacing];
  }};
  padding: ${({ padding }) => {
    if (typeof padding === 'string') {
      if (padding === 'none') return '0';
      return padding === 'xs' ? spacing.xs :
             padding === 'sm' ? spacing.sm :
             padding === 'md' ? spacing.md :
             padding === 'lg' ? spacing.lg :
             padding === 'xl' ? spacing.xl :
             padding === '2xl' ? spacing['2xl'] : '0';
    }
    const pad = padding?.xs || 'none';
    return pad === 'none' ? '0' : spacing[pad as keyof typeof spacing];
  }};
  margin: ${({ margin }) => {
    if (typeof margin === 'string') {
      if (margin === 'none') return '0';
      return margin === 'xs' ? spacing.xs :
             margin === 'sm' ? spacing.sm :
             margin === 'md' ? spacing.md :
             margin === 'lg' ? spacing.lg :
             margin === 'xl' ? spacing.xl :
             margin === '2xl' ? spacing['2xl'] : '0';
    }
    const marg = margin?.xs || 'none';
    return marg === 'none' ? '0' : spacing[marg as keyof typeof spacing];
  }};
  transition: ${transitions.default};

  /* Responsive breakpoints */
  ${({ direction, align, justify, wrap, spacing: spacingProp, padding, margin }) => {
    const breakpoints = {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };

    return Object.entries(breakpoints).map(([breakpoint, width]) => {
      const responsiveStyles = [];
      
      if (direction && typeof direction === 'object' && direction[breakpoint as keyof typeof direction]) {
        const dir = direction[breakpoint as keyof typeof direction];
        responsiveStyles.push(`flex-direction: ${dir === 'horizontal' ? 'row' : 'column'};`);
      }
      
      if (align && typeof align === 'object' && align[breakpoint as keyof typeof align]) {
        responsiveStyles.push(`align-items: ${align[breakpoint as keyof typeof align]};`);
      }
      
      if (justify && typeof justify === 'object' && justify[breakpoint as keyof typeof justify]) {
        responsiveStyles.push(`justify-content: ${justify[breakpoint as keyof typeof justify]};`);
      }
      
      if (wrap && typeof wrap === 'object' && wrap[breakpoint as keyof typeof wrap]) {
        responsiveStyles.push(`flex-wrap: ${wrap[breakpoint as keyof typeof wrap]};`);
      }
      
      if (spacingProp && typeof spacingProp === 'object' && spacingProp[breakpoint]) {
        const space = spacingProp[breakpoint];
        const gapValue = space === 'none' ? '0' : spacing[space as keyof typeof spacing];
        responsiveStyles.push(`gap: ${gapValue};`);
      }
      
      if (padding && typeof padding === 'object' && padding[breakpoint]) {
        const pad = padding[breakpoint];
        const padValue = pad === 'none' ? '0' : spacing[pad as keyof typeof spacing];
        responsiveStyles.push(`padding: ${padValue};`);
      }
      
      if (margin && typeof margin === 'object' && margin[breakpoint]) {
        const marg = margin[breakpoint];
        const margValue = marg === 'none' ? '0' : spacing[marg as keyof typeof spacing];
        responsiveStyles.push(`margin: ${margValue};`);
      }
      
      return responsiveStyles.length > 0 
        ? `@media (min-width: ${width}) { ${responsiveStyles.join(' ')} }`
        : '';
    }).join(' ');
  }}
`;

export const Stack: React.FC<StackProps> = ({ 
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
  padding = 'none',
  margin = 'none',
  as: Component = 'div',
  ...rest
}) => {
  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      align={align}
      justify={justify}
      wrap={wrap}
      padding={padding}
      margin={margin}
      as={Component}
      {...rest}
    >
      {children}
    </StyledStack>
  );
}; 