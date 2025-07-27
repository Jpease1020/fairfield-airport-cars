import React from 'react';
import { Container, H1, Text, Button } from '@/components/ui';
import { Section } from '@/components/ui/containers';

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
        <div style={{ backgroundImage: `url(${backgroundImage})` }}>
          <div />
        </div>
      )}
      
      <Container maxWidth="xl">
        <H1>{title}</H1>
        {subtitle && <Text>{subtitle}</Text>}
        {description && <Text>{description}</Text>}
        
        {(primaryAction || secondaryAction) && (
          <div>
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
                  {secondaryAction.label} <span aria-hidden="true">→</span>
                </Button>
              </a>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
};