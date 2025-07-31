'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '../../system/tokens/tokens';

// Reusable IconContainer component
export interface IconContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'circular' | 'square';
}

export const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'color', 'variant'].includes(prop)
})<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'circular' | 'square';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: ${transitions.default};

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.disabled};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      default:
        return `color: ${colors.text.secondary};`;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
          width: 1rem;
          height: 1rem;
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
          width: 1.5rem;
          height: 1.5rem;
        `;
      default:
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'circular':
        return `
          border-radius: 50%;
          background-color: ${colors.background.secondary};
        `;
      case 'square':
        return `
          border-radius: 4px;
          background-color: ${colors.background.secondary};
        `;
      default:
        return '';
    }
  }}
`;

// Reusable ContentContainer component
export interface ContentContainerProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  flex?: boolean;
}

export const ContentContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'align', 'justify', 'gap', 'flex'].includes(prop)
})<{
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  flex?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction === 'horizontal' ? 'row' : 'column'};
  align-items: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  }};
  justify-content: ${({ justify }) => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      case 'around':
        return 'space-around';
      default:
        return 'flex-start';
    }
  }};
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
  flex: ${({ flex }) => flex ? '1' : 'none'};
  min-width: 0;
`;

// Reusable HeaderContainer component
export interface HeaderContainerProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end' | 'between';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const HeaderContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['align', 'gap'].includes(prop)
})<{
  align?: 'start' | 'center' | 'end' | 'between';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }};
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
`;

// Reusable ActionsContainer component
export interface ActionsContainerProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ActionsContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['align', 'gap'].includes(prop)
})<{
  align?: 'start' | 'center' | 'end';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      default:
        return 'flex-end';
    }
  }};
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
  flex-shrink: 0;
`;

// Reusable EditContainer component
export interface EditContainerProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
}

export const EditContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['align', 'justify'].includes(prop)
})<{
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
}>`
  display: flex;
  align-items: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      default:
        return 'center';
    }
  }};
  justify-content: ${({ justify }) => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      default:
        return 'center';
    }
  }};
`; 