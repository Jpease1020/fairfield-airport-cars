'use client';

import React from 'react';
import { Container, Stack } from '@/design/ui';

interface ListItemProps {
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

interface ListProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'separated' | 'compact';
  direction?: 'vertical' | 'horizontal';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'ul' | 'ol' | 'nav';
  id?: string;
}

/**
 * List - A foundational list layout component
 * 
 * @example
 * ```tsx
 * <List variant="bordered" spacing="md">
 *   <ListItem>
 *     <Text>List item 1</Text>
 *   </ListItem>
 *   <ListItem>
 *     <Text>List item 2</Text>
 *   </ListItem>
 * </List>
 * ```
 */
export const List: React.FC<ListProps> = ({ 
  children, 
  variant = 'default',
  direction = 'vertical',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start',
  container = true,
  maxWidth = '2xl',
  padding = 'none',
  margin = 'none',
  as: Component = 'div',
  id,
  ...rest
}) => {
  const listContent = (
    <Stack 
      direction={direction} 
      spacing={spacing} 
      align={align} 
      justify={justify}
      as={Component}
    >
      {children}
    </Stack>
  );

  if (container) {
    return (
      <Container 
        variant={variant === 'bordered' ? 'card' : 'default'}
        maxWidth={maxWidth} 
        padding={padding} 
        margin={margin}
        id={id}
        {...rest}
      >
        {listContent}
      </Container>
    );
  }

  return (
    <div id={id} {...rest}>
      {listContent}
    </div>
  );
};

/**
 * ListItem - A component for individual list items
 * 
 * @example
 * ```tsx
 * <ListItem spacing="sm" align="center">
 *   <Text>Item content</Text>
 * </ListItem>
 * ```
 */
export const ListItem: React.FC<ListItemProps> = ({ 
  children, 
  spacing = 'none',
  align = 'flex-start',
  justify = 'flex-start'
}) => {
  return (
    <Stack 
      direction="horizontal" 
      spacing={spacing} 
      align={align} 
      justify={justify}
    >
      {children}
    </Stack>
  );
}; 