'use client';

import React from 'react';
import styled from 'styled-components';

// PositionedContainer component - for positioning needs
export interface PositionedContainerProps {
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