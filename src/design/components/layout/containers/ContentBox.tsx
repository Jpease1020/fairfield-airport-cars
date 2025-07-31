'use client';

import React from 'react';
import { Container, Stack, AlignItems, JustifyContent } from '@/design/ui';

interface ContentBoxProps {
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
 * ContentBox - A structural component for organizing content with built-in Stack layout
 * 
 * This component combines a Container with a Stack to provide a consistent way
 * to organize content with proper spacing and alignment.
 * 
 * @example
 * ```tsx
 * <ContentBox variant="elevated" padding="lg" spacing="md">
 *   <Text variant="lead">Content Title</Text>
 *   <Text>Content goes here</Text>
 * </ContentBox>
 * ```
 */
export const ContentBox: React.FC<ContentBoxProps> = ({ 
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