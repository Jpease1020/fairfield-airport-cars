'use client';

import React from 'react';
import { Container, Stack, ContentBox, Text, H4 } from '@/design/ui';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  showCard?: boolean;
}

/**
 * ContentCard - A generic card layout for content
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * <ContentCard 
 *   title="ContentBox Title"
 *   subtitle="ContentBox subtitle"
 *   content={<div>ContentBox content goes here</div>}
 *   icon={<span>🚗</span>}
 *   variant="elevated"
 * />
 * ```
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  content,
  icon,
  variant = 'default',
  padding = 'md',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start',
  showCard = true
}) => {
  const cardContent = (
    <Stack 
      direction="vertical" 
      spacing={spacing} 
      align={align} 
      justify={justify}
    >
      {icon && (
        <Container>
          {icon}
        </Container>
      )}
      
      {(title || subtitle) && (
        <Container>
          {title && (
            <H4>{title}</H4>
          )}
          {subtitle && (
            <Text variant="muted" size="sm">
              {subtitle}
            </Text>
          )}
        </Container>
      )}
      
      <Container>
        {content}
      </Container>
    </Stack>
  );

  return showCard ? (
    <ContentBox variant={variant} padding={padding}>
      {cardContent}
    </ContentBox>
  ) : (
    <Container>
      {cardContent}
    </Container>
  );
}; 