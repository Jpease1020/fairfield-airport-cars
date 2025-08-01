'use client';

import React from 'react';
import { Stack, Container, Box, Text, H4 } from '@/ui';

interface ContentItem {
  id: string | number;
  title?: string;
  content: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}

interface ContentStackProps {
  items: ContentItem[];
  direction?: 'vertical' | 'horizontal';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  showCards?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

/**
 * ContentStack - A stack layout for content items
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: 1, title: "Section 1", content: <div>Content 1</div> },
 *   { id: 2, title: "Section 2", content: <div>Content 2</div> }
 * ];
 * 
 * <ContentStack items={items} direction="vertical" spacing="lg" />
 * ```
 */
export const ContentStack: React.FC<ContentStackProps> = ({
  items,
  direction = 'vertical',
  spacing = 'md',
  align = 'flex-start',
  justify = 'flex-start',
  showCards = true,
  emptyMessage = 'No content available',
  emptyIcon = '📭'
}) => {
  if (items.length === 0) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="muted">{emptyIcon}</Text>
          <Text variant="muted">{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack 
      direction={direction} 
      spacing={spacing} 
      align={align} 
      justify={justify}
    >
      {items.map((item) => {
        const content = (
          <Stack direction="vertical" spacing="sm">
            {item.title && (
              <Container>
                <H4>{item.title}</H4>
              </Container>
            )}
            <Container>
              {item.content}
            </Container>
          </Stack>
        );

        return (
          <Container key={item.id}>
            {showCards ? (
              <Box variant={item.variant || 'default'} padding="md">
                {content}
              </Box>
            ) : (
              content
            )}
          </Container>
        );
      })}
    </Stack>
  );
}; 