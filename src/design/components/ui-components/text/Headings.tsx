'use client';

import React from 'react';
import { Heading, HeadingProps } from './Heading';

// H1 Component
export const H1: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '5xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h1',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
};

// H2 Component
export const H2: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '4xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h2',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
};

// H3 Component
export const H3: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '2xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h3',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
};

// H4 Component
export const H4: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h4',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
};

// H5 Component
export const H5: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'lg',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h5',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
};

// H6 Component
export const H6: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h6',
  ...rest
}) => {
  return (
    <Heading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </Heading>
  );
}; 