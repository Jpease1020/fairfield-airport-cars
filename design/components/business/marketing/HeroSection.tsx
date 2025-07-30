import React from 'react';
import { Container, H1, Text, Button, Link } from '@/components/ui';
import { Section, Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/design/components/core/layout/EditableSystem';

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
        <H1>
          <EditableText field="hero.title" defaultValue={title}>
            {title}
          </EditableText>
        </H1>
        {subtitle && (
          <Text>
            <EditableText field="hero.subtitle" defaultValue={subtitle}>
              {subtitle}
            </EditableText>
          </Text>
        )}
        {description && (
          <Text>
            <EditableText field="hero.description" defaultValue={description}>
              {description}
            </EditableText>
          </Text>
        )}
        
        {(primaryAction || secondaryAction) && (
          <Stack direction="horizontal" spacing="md">
            {primaryAction && (
              <Button variant="primary" size="lg">
                <EditableText field="hero.primaryAction.label" defaultValue={primaryAction.label}>
                  {primaryAction.label}
                </EditableText>
              </Button>
            )}
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button variant="outline" size="lg">
                  <EditableText field="hero.secondaryAction.label" defaultValue={secondaryAction.label}>
                    {secondaryAction.label}
                  </EditableText>
                </Button>
              </Link>
            )}
          </Stack>
        )}
      </Container>
    </Section>
  );
};