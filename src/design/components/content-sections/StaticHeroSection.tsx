import React from 'react';
import { Container } from '../../layout/containers/Container';
import { H1 } from '../base-components/text/Headings';
import { Text } from '../base-components/text/Text';
import { Button } from '../base-components/Button';
import { Stack } from '../../layout/framing/Stack';
import Link from 'next/link';

interface StaticHeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  titleId?: string;
  subtitleId?: string;
  descriptionId?: string;
  primaryAction?: {
    label: string;
    href: string;
    labelId?: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
    labelId?: string;
  };
}

export function StaticHeroSection({
  title = "Professional Airport Transportation",
  subtitle = "Reliable rides to and from Fairfield Airport",
      description = "Book your ride with confidence. Professional driver, clean vehicle, and on-time service guaranteed.",
  titleId,
  subtitleId,
  descriptionId,
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
          <H1 size="2xl" color="primary" align="center" cmsId={titleId}>
            {title}
          </H1>
          <Text variant="lead" size="lg" align="center" cmsId={subtitleId}>
            {subtitle}
          </Text>
          <Text variant="muted" size="md" align="center" cmsId={descriptionId}>
            {description}
          </Text>
        </Stack>
        
        <Stack 
          direction={{ xs: 'vertical', sm: 'horizontal' }}
          spacing="md"
          align="center"
        >
          <Link href={primaryAction.href}>
            <Button variant="primary" size="lg" cmsId={primaryAction.labelId || ''} text={primaryAction.label}/>
          </Link>
          <Link href={secondaryAction.href}>
            <Button variant="outline" size="lg" cmsId={secondaryAction.labelId || ''} text={secondaryAction.label}/>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
} 