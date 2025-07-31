'use client';

import React from 'react';
import { Container, Box, Stack, Text, H4 } from '@/design/ui';

interface ContentListItem {
  id: string | number;
  title: string;
  description?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}

interface ContentListProps {
  items: ContentListItem[];
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

/**
 * ContentList - A stack layout for list items
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: 1, title: "Item 1", description: "Description 1" },
 *   { id: 2, title: "Item 2", description: "Description 2" }
 * ];
 * 
 * <ContentList items={items} spacing="md" />
 * ```
 */
export const ContentList: React.FC<ContentListProps> = ({
  items,
  spacing = 'md',
  showCards = true,
  emptyMessage = 'No items available',
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
    <Stack direction="vertical" spacing={spacing}>
      {items.map((item) => {
        const content = (
          <Stack direction="horizontal" spacing="md" align="flex-start">
            {item.icon && (
              <Container>
                {item.icon}
              </Container>
            )}
            
            <Container>
              <Stack direction="vertical" spacing="sm">
                <H4>{item.title}</H4>
                {item.description && (
                  <Text variant="muted" size="sm">
                    {item.description}
                  </Text>
                )}
                {item.content && (
                  <Container>
                    {item.content}
                  </Container>
                )}
              </Stack>
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