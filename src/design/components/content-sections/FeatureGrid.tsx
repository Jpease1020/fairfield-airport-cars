'use client';

import React from 'react';
import { Grid, Col, Container, ContentBox, Stack, Text, H4 } from '@/design/ui';

interface Feature {
  id?: string | number;
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

/**
 * FeatureGrid - A grid layout for feature items
 * Built on Layer 1 (Grid) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const features = [
 *   { icon: "⏰", title: "On Time", description: "Reliable pickup times" },
 *   { icon: "🚙", title: "Clean Cars", description: "Well-maintained vehicles" },
 *   { icon: "💳", title: "Easy Payment", description: "Secure online booking" }
 * ];
 * 
 * <FeatureGrid features={features} columns={3} />
 * ```
 */
export const FeatureGrid: React.FC<FeatureGridProps> = ({ 
  features, 
  columns = 3,
  gap = 'lg',
  showCards = true,
  emptyMessage = 'No features available',
  emptyIcon = '✨'
}) => {
  if (features.length === 0) {
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
      {features.map((feature, index) => {
        const content = (
          <Stack direction="vertical" spacing="md" align="center">
            <Container>
              <Text size="xl">{feature.icon}</Text>
            </Container>
            <Container>
              <H4>{feature.title}</H4>
            </Container>
            <Container>
              <Text variant="muted">{feature.description}</Text>
            </Container>
          </Stack>
        );

        return (
          <Col key={feature.id || index}>
            {showCards ? (
              <ContentBox variant="default" padding="lg">
                {content}
              </ContentBox>
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