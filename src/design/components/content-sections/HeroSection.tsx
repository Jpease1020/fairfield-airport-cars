'use client';

import React from 'react';
import { Container } from '../../layout/containers/Container';
import { Stack } from '../../layout/framing/Stack';
import { H1 } from '../base-components/text/Headings';
import { Text } from '../base-components/text/Text';
import { Button } from '../base-components/Button';
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
    <Container maxWidth="full" padding="xl" variant="hero" data-testid={dataTestId} {...rest}>
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