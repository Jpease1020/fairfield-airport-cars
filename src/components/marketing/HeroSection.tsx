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
    <Section variant="brand" padding="xl" className="hero-section">
      {backgroundImage && (
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="hero-background-overlay" />
        </div>
      )}
      
      <Container maxWidth="xl" className={contentClasses}>
        <H1 className="hero-title">{title}</H1>
        {subtitle && <Text className="hero-subtitle">{subtitle}</Text>}
        {description && <Text className="hero-description">{description}</Text>}
        
        {(primaryAction || secondaryAction) && (
          <div className="hero-actions">
            {primaryAction && (
              <a 
                href={primaryAction.href}
                className="hero-primary-action"
              >
                <Button 
                  variant="primary"
                  size="lg"
                  className="hero-primary-action"
                >
                  {primaryAction.label}
                </Button>
              </a>
            )}
            
            {secondaryAction && (
              <a 
                href={secondaryAction.href}
                className="hero-secondary-action"
              >
                <Button 
                  variant="outline"
                  size="lg"
                  className="hero-secondary-action"
                >
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