'use client';

import React from 'react';
import { Text, TextProps } from './Text';

export interface ParagraphProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'body' | 'lead' | 'small' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Rest props
  [key: string]: any;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  variant = 'body',
  size = 'md',
  align = 'left',
  color = 'default',
  weight = 'normal',
  ...rest
}) => {
  return (
    <Text
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      color={color}
      as="p"
      {...rest}
    >
      {children}
    </Text>
  );
}; 