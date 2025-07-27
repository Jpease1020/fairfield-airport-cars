import React from 'react';
import { Container, H1, Text, Button, Link } from '@/components/ui';
import { Section, Stack } from '@/components/ui/containers';

interface HeroSectionProps {
  title: string;
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

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction
}) => {
  return (
    <Section 
      variant="brand" 
      padding="xl"
    >
      <Container maxWidth="xl">
        <H1>{title}</H1>
        {subtitle && <Text>{subtitle}</Text>}
        {description && <Text>{description}</Text>}
        
        {(primaryAction || secondaryAction) && (
          <Stack direction="horizontal" spacing="md">
            {primaryAction && (
              <Button variant="primary" size="lg">
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button variant="outline" size="lg">
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
          </Stack>
        )}
      </Container>
    </Section>
  );
};