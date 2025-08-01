'use client';

import React from 'react';
import { Box, Text, Stack, Container, EditableText } from '@/ui';

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
    <Box id={id} {...rest}>
      <Stack direction="horizontal" spacing="md" align="flex-start">
        {/* Icon Container */}
        <Container
          variant="default"
          padding="sm"
        >
          {icon}
        </Container>
        
        {/* Content Container */}
        <Container
          variant="default"
          padding="sm"
        >
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
        </Container>
      </Stack>
    </Box>
  );
}; 