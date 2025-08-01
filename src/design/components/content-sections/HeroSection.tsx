'use client';

import React from 'react';
import { Container, Stack, H1, Text, Button } from '@/ui';
import Link from 'next/link';

export interface HeroSectionProps {
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
  'data-testid'?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  'data-testid': dataTestId,
  ...rest
}) => {
  return (
    <Container maxWidth="full" padding="xl" variant="section" data-testid={dataTestId} {...rest}>
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H1 align="center">{title}</H1>
          {subtitle && (
            <Text variant="lead" align="center" size="lg">
              {subtitle}
            </Text>
          )}
          {description && (
            <Text variant="muted" align="center">
              {description}
            </Text>
          )}
        </Stack>
        
        {(primaryAction || secondaryAction) && (
          <Stack direction="horizontal" spacing="md">
            {primaryAction && (
              <Link href={primaryAction.href}>
                <Button variant="primary" size="lg">
                  {primaryAction.label}
                </Button>
              </Link>
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
      </Stack>
    </Container>
  );
}; 