'use client';

import React from 'react';
import { Grid } from '../layout/grid/Grid';
import { Col } from '../layout/grid/Col';
import { Container } from '../layout/containers/Container';
import { Card } from '../layout/containers/Card';
import { Stack } from '../layout/grid/Stack';
import { Text, H3, H4 } from '../ui-components/Text';

interface ContentItem {
  id: string | number;
  title: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}

interface ContentGridProps {
  items: ContentItem[];
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

/**
 * ContentGrid - A generic grid layout for content items
 * Built on Layer 1 (Grid) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: 1, title: "Feature 1", description: "Description", content: <div>Content</div> },
 *   { id: 2, title: "Feature 2", description: "Description", content: <div>Content</div> }
 * ];
 * 
 * <ContentGrid items={items} columns={3} gap="lg" showCards />
 * ```
 */
export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  columns = 3,
  gap = 'md',
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
    <Grid cols={columns} gap={gap}>
      {items.map((item) => {
        const content = (
          <Stack direction="vertical" spacing="md">
            {item.icon && (
              <Container>
                {item.icon}
              </Container>
            )}
            <Container>
              <H4>{item.title}</H4>
              {item.description && (
                <Text variant="muted">{item.description}</Text>
              )}
            </Container>
            <Container>
              {item.content}
            </Container>
          </Stack>
        );

        return (
          <Col key={item.id}>
            {showCards ? (
              <Card variant={item.variant || 'default'} padding="lg">
                {content}
              </Card>
            ) : (
              <Container>
                {content}
              </Container>
            )}
          </Col>
        );
      })}
    </Grid>
  );
}; 