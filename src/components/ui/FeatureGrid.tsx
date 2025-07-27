import React from 'react';
import { Container, Text, H4 } from '@/components/ui';
import { Grid, Stack } from '@/components/ui/containers';

interface Feature {
  id?: string | number;
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
}

/**
 * FeatureGrid - A reusable component for displaying feature cards in a grid
 * 
 * @example
 * ```tsx
 * const features = [
 *   { icon: "⏰", title: "On Time", description: "Reliable pickup times" },
 *   { icon: "🚗", title: "Clean Cars", description: "Well-maintained vehicles" },
 *   { icon: "💳", title: "Easy Payment", description: "Secure online booking" }
 * ];
 * 
 * <FeatureGrid features={features} columns={3} />
 * ```
 */
export const FeatureGrid: React.FC<FeatureGridProps> = ({ 
  features, 
  columns = 3
}) => {
  return (
    <Grid cols={columns as 1 | 2 | 3 | 4 | 5 | 6 | 12} gap="lg">
      {features.map((feature, index) => (
        <Stack key={feature.id || index} spacing="md" align="center">
          <Container>
            <Text>{feature.icon}</Text>
          </Container>
          <H4>{feature.title}</H4>
          <Text variant="muted">{feature.description}</Text>
        </Stack>
      ))}
    </Grid>
  );
};

export default FeatureGrid; 