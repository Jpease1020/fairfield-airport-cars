'use client';

import React from 'react';
import { Container, Stack, Text } from '@/design/ui';

interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  variant?: 'default' | 'elevated' | 'card';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  hover?: boolean;
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
}

/**
 * Card - A versatile component for displaying content in card format
 * 
 * @example
 * ```tsx
 * // Content Card
 * <Card title="Card Title" description="Card description">
 *   <p>Card content</p>
 * </Card>
 * 
 * // Action Card
 * <Card title="Clickable Card" onClick={() => console.log('clicked')} hover>
 *   <p>Click me!</p>
 * </Card>
 * 
 * // Icon Card
 * <Card title="Icon Card" icon="🚀">
 *   <p>Card with icon</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({ 
  children,
  title,
  subtitle,
  description,
  icon,
  variant = 'elevated',
  padding = 'lg',
  spacing = 'md',
  onClick,
  hover = false,
  as: Component = 'div',
  id,
  ...rest
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'elevated':
        return 'elevated';
      case 'card':
        return 'card';
      default:
        return 'default';
    }
  };

  const getHoverStyles = () => {
    if (!hover) return {};
    return {
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
      }
    };
  };

  return (
    <Container 
      variant={getVariant()}
      padding={padding}
      as={Component}
      id={id}
      {...rest}
    >
      <Stack direction="vertical" spacing={spacing}>
        {(title || subtitle || description || icon) && (
          <Stack direction="vertical" spacing="sm">
            {icon && (
              <Text size="lg">{icon}</Text>
            )}
            {title && (
              <Text variant="lead" size="md" weight="semibold">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text variant="lead" size="sm" weight="medium">
                {subtitle}
              </Text>
            )}
            {description && (
              <Text variant="muted" size="sm">
                {description}
              </Text>
            )}
          </Stack>
        )}
        {children}
      </Stack>
    </Container>
  );
}; 