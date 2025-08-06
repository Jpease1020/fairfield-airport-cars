import React from 'react';
import { Container, H1, Text, Button, Stack } from '@/ui';
import Link from 'next/link';

interface StaticHeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function StaticHeroSection({
  title = "Professional Airport Transportation",
  subtitle = "Reliable rides to and from Fairfield Airport",
  description = "Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed.",
  primaryAction = {
    label: "Book Now",
    href: "/book"
  },
  secondaryAction = {
    label: "Learn More",
    href: "/about"
  }
}: StaticHeroSectionProps) {
  return (
    <Container variant="hero" padding="xl">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H1 size="2xl" color="primary" align="center">
            {title}
          </H1>
          <Text variant="lead" size="lg" align="center">
            {subtitle}
          </Text>
          <Text variant="muted" size="md" align="center">
            {description}
          </Text>
        </Stack>
        
        <Stack 
          direction={{ xs: 'vertical', sm: 'horizontal' }}
          spacing="md"
          align="center"
        >
          <Link href={primaryAction.href}>
            <Button variant="primary" size="lg">
              {primaryAction.label}
            </Button>
          </Link>
          <Link href={secondaryAction.href}>
            <Button variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
} 