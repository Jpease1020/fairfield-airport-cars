import React from 'react';
import { Container, H1, Text, Button, Span } from '@/components/ui';
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
  backgroundImage?: string;
  variant?: 'default' | 'centered';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  variant = 'default'
}) => {
  const contentClasses = `hero-content ${variant === 'centered' ? 'hero-content-centered' : ''}`;

  return (
    <Section variant="brand" padding="xl">
      {backgroundImage && (
        <Container style={{ backgroundImage: `url(${backgroundImage})` }}>
          <Container>
            <Span>Background</Span>
          </Container>
        </Container>
      )}
      
      <Container maxWidth="xl">
        <H1>{title}</H1>
        {subtitle && <Text>{subtitle}</Text>}
        {description && <Text>{description}</Text>}
        
        {(primaryAction || secondaryAction) && (
          <Stack direction="horizontal" spacing="md">
            {primaryAction && (
              <a href={primaryAction.href}>
                <Button variant="primary" size="lg">
                  {primaryAction.label}
                </Button>
              </a>
            )}
            
            {secondaryAction && (
              <a href={secondaryAction.href}>
                <Button variant="outline" size="lg">
                  {secondaryAction.label} <Span aria-hidden="true">→</Span>
                </Button>
              </a>
            )}
          </Stack>
        )}
      </Container>
    </Section>
  );
};