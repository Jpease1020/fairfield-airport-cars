'use client';

import React from 'react';
import { Container, Stack, Text, H4 } from '@/ui';


interface ContentFooterProps {
  title?: string;
  description?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode[];
  icon?: React.ReactNode;
  variant?: 'default' | 'centered' | 'split';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

/**
 * ContentFooter - A generic footer layout for content sections
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * <ContentFooter 
 *   title="Footer Title"
 *   description="Footer description"
 *   links={[{ label: "Link 1", href: "/link1" }]}
 *   actions={[<Button>Action</Button>]}
 * />
 * ```
 */
export const ContentFooter: React.FC<ContentFooterProps> = ({
  title,
  description,
  links = [],
  actions = [],
  icon,
  variant = 'default',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start'
}) => {
  const footerContent = (
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
      
      {(title || description) && (
        <Container>
          {title && (
            <H4>{title}</H4>
          )}
          {description && (
            <Text variant="muted" size="sm">
              {description}
            </Text>
          )}
        </Container>
      )}
      
      {links.length > 0 && (
        <Container>
          <Stack direction="horizontal" spacing="md">
            {links.map((link, index) => (
              <Container key={index}>
                <a href={link.href}>
                  <Text variant="muted" size="sm">
                    {link.label}
                  </Text>
                </a>
              </Container>
            ))}
          </Stack>
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
          {footerContent}
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
              
              {(title || description) && (
                <Container>
                  {title && (
                    <H4>{title}</H4>
                  )}
                  {description && (
                    <Text variant="muted" size="sm">
                      {description}
                    </Text>
                  )}
                </Container>
              )}
              
              {links.length > 0 && (
                <Container>
                  <Stack direction="horizontal" spacing="md">
                    {links.map((link, index) => (
                      <Container key={index}>
                        <a href={link.href}>
                          <Text variant="muted" size="sm">
                            {link.label}
                          </Text>
                        </a>
                      </Container>
                    ))}
                  </Stack>
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
      {footerContent}
    </Container>
  );
}; 