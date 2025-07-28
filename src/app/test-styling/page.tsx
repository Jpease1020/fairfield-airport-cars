'use client';

import { Container, Text, H1, Button } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

export default function TestStylingPage() {
  return (
    <Container padding="xl">
      <Stack spacing="lg">
        <H1>🎨 Styling Test Page</H1>
        
        <Text variant="lead">
          This page tests if our beautiful design system is working properly.
        </Text>
        
        <Container variant="card" padding="lg">
          <Stack spacing="md">
            <H1>Secondary Button Test</H1>
            <Button variant="secondary">
              Secondary Button
            </Button>
          </Stack>
        </Container>
        
        <Container variant="elevated" padding="lg">
          <Stack spacing="md">
            <H1>Text Color Test</H1>
            <Text variant="lead">This should be styled text</Text>
            <Text>This should be regular text</Text>
          </Stack>
        </Container>
      </Stack>
    </Container>
  );
} 