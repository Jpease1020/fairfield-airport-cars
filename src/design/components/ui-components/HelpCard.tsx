'use client';

import React from 'react';
import { Card } from '../layout/containers/Card';
import { Text } from './Text';
import { Stack } from '../layout/grid/Stack';
import { Box } from '../layout/grid/Box';
import { EditableText } from './EditableSystem';

export interface HelpCardProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  icon: React.ReactNode;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'highlighted' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const HelpCard: React.FC<HelpCardProps> = ({
  // Core props
  children,
  
  // Content
  icon,
  title,
  description,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  // Map variant to text color
  const getTextColor = () => {
    switch (variant) {
      case 'highlighted':
        return 'primary';
      case 'compact':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  // Map size to icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'md';
    }
  };

  return (
    <Card id={id} {...rest}>
      <Stack direction="horizontal" spacing="md" align="flex-start">
        {/* Icon Container */}
        <div
          style={{
            flexShrink: 0,
            fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
            width: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1.25rem',
            height: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: variant === 'highlighted' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-sm)'
          }}
        >
          {icon}
        </div>
        
        {/* Content Container */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Stack direction="horizontal" spacing="sm" align="center">
            {typeof title === 'string' ? (
              <Text variant="body" size={getIconSize()} color={getTextColor()} weight="semibold">
                <EditableText field="helpcard.title" defaultValue={title}>
                  {title}
                </EditableText>
              </Text>
            ) : (
              title
            )}
          </Stack>
          
          {/* Description */}
          {typeof description === 'string' ? (
            <Text variant="body" size="sm" color={getTextColor()}>
              <EditableText field="helpcard.description" defaultValue={description}>
                {description}
              </EditableText>
            </Text>
          ) : (
            description
          )}
          
          {/* Children */}
          {children}
        </div>
      </Stack>
    </Card>
  );
}; 