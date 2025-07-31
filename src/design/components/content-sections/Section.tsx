'use client';

import React from 'react';
import { Container, Stack, H2, Text } from '@/design/ui';
import { EditableText } from '@/design/ui';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  titleField?: string;
  subtitleField?: string;
  variant?: 'default' | 'main' | 'section';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  as?: 'section' | 'div' | 'article';
  id?: string;
}

/**
 * Section - A reusable section component for consistent page layouts
 * 
 * Provides a standardized way to create sections with titles, subtitles,
 * and consistent spacing and alignment.
 */
export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  titleField,
  subtitleField,
  variant = 'default',
  maxWidth = 'xl',
  padding = 'xl',
  spacing = 'xl',
  align = 'flex-start',
  as: Component = 'section',
  id,
  ...rest
}) => {
  return (
    <Container maxWidth={maxWidth} padding={padding} variant={variant} as={Component} id={id} {...rest}>
      <Stack spacing={spacing} align={align}>
        {/* Header */}
        {(title || titleField) && (
          <Stack spacing="md" align="center">
            <H2 align="center">
              {titleField ? (
                <EditableText field={titleField} defaultValue={title}>
                  {title}
                </EditableText>
              ) : (
                title
              )}
            </H2>
            {(subtitle || subtitleField) && (
              <Text variant="lead" align="center">
                {subtitleField ? (
                  <EditableText field={subtitleField} defaultValue={subtitle}>
                    {subtitle}
                  </EditableText>
                ) : (
                  subtitle
                )}
              </Text>
            )}
          </Stack>
        )}
        
        {/* Content */}
        {children}
      </Stack>
    </Container>
  );
}; 