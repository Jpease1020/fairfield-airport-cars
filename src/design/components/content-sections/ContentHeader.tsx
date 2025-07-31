'use client';

import React from 'react';
import { Container } from '../layout/containers/Container';
import { Stack } from '../layout/grid/Stack';
import { Text, H2, H3, H4 } from '../ui-components/Text';

interface ContentHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode[];
  icon?: React.ReactNode;
  variant?: 'default' | 'centered' | 'split';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

/**
 * ContentHeader - A generic header layout for content sections
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * <ContentHeader 
 *   title="Section Title"
 *   subtitle="Section subtitle"
 *   description="Section description"
 *   actions={[<Button>Action</Button>]}
 *   icon={<span>🚗</span>}
 * />
 * ```
 */
export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  subtitle,
  description,
  actions = [],
  icon,
  variant = 'default',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start'
}) => {
  const headerContent = (
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
            <H3>{title}</H3>
          )}
          {subtitle && (
            <Text variant="muted" size="sm">
              {subtitle}
            </Text>
          )}
        </Container>
      )}
      
      {description && (
        <Container>
          <Text variant="muted">
            {description}
          </Text>
        </Container>
      )}
      
      {actions.length > 0 && (
        <Container>
          <Stack direction="horizontal" spacing="sm">
            {actions.map((action, index) => (
              <Container key={index}>
                {action}
              </Container>
            ))}
          </Stack>
        </Container>
      )}
    </Stack>
  );

  if (variant === 'centered') {
    return (
      <Container>
        <Stack direction="vertical" spacing={spacing} align="center">
          {headerContent}
        </Stack>
      </Container>
    );
  }

  if (variant === 'split') {
    return (
      <Container>
        <Stack direction="horizontal" spacing={spacing} justify="space-between" align="flex-start">
          <Container>
            <Stack direction="vertical" spacing={spacing}>
              {icon && (
                <Container>
                  {icon}
                </Container>
              )}
              
              {(title || subtitle) && (
                <Container>
                  {title && (
                    <H3>{title}</H3>
                  )}
                  {subtitle && (
                    <Text variant="muted" size="sm">
                      {subtitle}
                    </Text>
                  )}
                </Container>
              )}
              
              {description && (
                <Container>
                  <Text variant="muted">
                    {description}
                  </Text>
                </Container>
              )}
            </Stack>
          </Container>
          
          {actions.length > 0 && (
            <Container>
              <Stack direction="horizontal" spacing="sm">
                {actions.map((action, index) => (
                  <Container key={index}>
                    {action}
                  </Container>
                ))}
              </Stack>
            </Container>
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      {headerContent}
    </Container>
  );
}; 