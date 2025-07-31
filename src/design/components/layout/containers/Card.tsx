'use client';

import React from 'react';
import { Container } from './Container';
import { Stack } from '../grid/Stack';
import { AlignItems, JustifyContent } from '../grid/types';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: AlignItems;
  justify?: JustifyContent;
  as?: 'div' | 'article' | 'section';
  id?: string;
}

/**
 * Card - A foundational card layout component
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg" spacing="md">
 *   <Text variant="heading">Card Title</Text>
 *   <Text>Card content goes here</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  spacing = 'none',
  align = 'flex-start',
  justify = 'flex-start',
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <Container 
      variant={variant === 'elevated' ? 'elevated' : variant === 'outlined' ? 'card' : 'default'}
      padding={padding}
      as={Component}
      id={id}
      {...rest}
    >
      <Stack 
        direction="vertical" 
        spacing={spacing} 
        align={align} 
        justify={justify}
      >
        {children}
      </Stack>
    </Container>
  );
}; 