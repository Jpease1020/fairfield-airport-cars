import React from 'react';
import { 
  Breakpoint, 
  FlexDirection, 
  FlexWrap, 
  AlignItems, 
  JustifyContent, 
  Spacing,
  ResponsiveValue,
  BaseLayoutProps 
} from '../shared-types';

// Content Layout Types - Type definitions for content layout components

// Re-export shared types
export type { 
  Breakpoint, 
  FlexDirection, 
  FlexWrap, 
  AlignItems, 
  JustifyContent, 
  Spacing,
  ResponsiveValue
};

// Base component props
export interface BaseContentProps extends BaseLayoutProps {}

// Stack component props
export interface StackProps extends BaseContentProps {
  direction?: ResponsiveValue<'horizontal' | 'vertical'>;
  spacing?: ResponsiveValue<Spacing>;
  align?: ResponsiveValue<AlignItems>;
  justify?: ResponsiveValue<JustifyContent>;
  wrap?: ResponsiveValue<FlexWrap>;
  padding?: ResponsiveValue<Spacing>;
  margin?: ResponsiveValue<Spacing>;
}

// Box component props
export interface BoxProps extends BaseContentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

 