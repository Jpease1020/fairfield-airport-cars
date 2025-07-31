'use client';

import React from 'react';
import { Container } from '../layout/containers/Container';
import { Card } from '../layout/containers/Card';
import { Stack } from '../layout/grid/Stack';
import { Grid } from '../layout/grid/Grid';
import { Col } from '../layout/grid/Col';
import { Text, H1, H2, H3 } from '../ui-components/Text';
import { Button } from '../ui-components/Button';
import { CustomerPageTemplate } from './PageTemplates';
import Link from 'next/link';

// ============================================================================
// LAYER 6: MARKETING TEMPLATES
// Marketing-focused page templates for landing pages and conversions
// ============================================================================

/**
 * Hero Landing Page Template
 * Landing page with prominent hero section
 */
export interface HeroLandingTemplateProps {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaHref: string;
  heroBackground?: string;
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const HeroLandingTemplate: React.FC<HeroLandingTemplateProps> = ({
  heroTitle,
  heroSubtitle,
  ctaText,
  ctaHref,
  heroBackground,
  showNavigation = true,
  showFooter = true,
  maxWidth = 'full'
}) => {
  return (
    <CustomerPageTemplate
      showNavigation={showNavigation}
      showFooter={showFooter}
      maxWidth={maxWidth}
    >
      <Container maxWidth="full">
        <Container maxWidth="xl" padding="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H1 align="center">{heroTitle}</H1>
              <Text variant="lead" align="center" size="lg">
                {heroSubtitle}
              </Text>
            </Stack>
            
            <Link href={ctaHref}>
              <Button variant="primary" size="lg">
                {ctaText}
              </Button>
            </Link>
          </Stack>
        </Container>
      </Container>
    </CustomerPageTemplate>
  );
};

/**
 * Features Showcase Template
 * Page highlighting key features and benefits
 */
export interface FeatureShowcaseProps {
  title: string;
  subtitle?: string;
  features: Array<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
  }>;
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const FeatureShowcaseTemplate: React.FC<FeatureShowcaseProps> = ({
  title,
  subtitle,
  features,
  showNavigation = true,
  showFooter = true,
  maxWidth = 'xl'
}) => {
  return (
    <CustomerPageTemplate
      showNavigation={showNavigation}
      showFooter={showFooter}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          <Stack spacing="md" align="center">
            <H2 align="center">{title}</H2>
            {subtitle && (
              <Text variant="lead" align="center">
                {subtitle}
              </Text>
            )}
          </Stack>
          
          <Grid cols={12} gap="lg">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Col key={index} span={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card variant="outlined">
                    <Stack spacing="md" align="center">
                      <IconComponent />
                      <H3 align="center">{feature.title}</H3>
                      <Text align="center">{feature.description}</Text>
                    </Stack>
                  </Card>
                </Col>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
};

/**
 * Testimonials Template
 * Page showcasing customer testimonials and reviews
 */
export interface TestimonialItem {
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialsTemplateProps {
  title: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const TestimonialsTemplate: React.FC<TestimonialsTemplateProps> = ({
  title,
  subtitle,
  testimonials,
  showNavigation = true,
  showFooter = true,
  maxWidth = 'xl'
}) => {
  return (
    <CustomerPageTemplate
      showNavigation={showNavigation}
      showFooter={showFooter}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          <Stack spacing="md" align="center">
            <H2 align="center">{title}</H2>
            {subtitle && (
              <Text variant="lead" align="center">
                {subtitle}
              </Text>
            )}
          </Stack>
          
          <Grid cols={12} gap="lg">
            {testimonials.map((testimonial, index) => (
              <Col key={index} span={{ xs: 12, sm: 6, lg: 4 }}>
                <Card variant="outlined">
                  <Stack spacing="md">
                    {testimonial.rating && (
                      <Stack direction="horizontal" spacing="xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < testimonial.rating! ? '⭐' : '☆'}
                          </span>
                        ))}
                      </Stack>
                    )}
                    
                    <Text variant="lead">"{testimonial.content}"</Text>
                    
                    <Stack spacing="xs">
                      <Text variant="small" weight="bold">
                        {testimonial.name}
                      </Text>
                      {(testimonial.role || testimonial.company) && (
                        <Text variant="small" color="muted">
                          {testimonial.role}
                          {testimonial.role && testimonial.company && ' at '}
                          {testimonial.company}
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
};

/**
 * Hero Section Component
 * Reusable hero section for marketing pages
 */
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
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction
}) => {
  return (
    <Container maxWidth="xl" padding="xl">
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

/**
 * Pricing Template
 * Page showcasing pricing plans and packages
 */
export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

export interface PricingTemplateProps {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PricingTemplate: React.FC<PricingTemplateProps> = ({
  title,
  subtitle,
  plans,
  showNavigation = true,
  showFooter = true,
  maxWidth = 'xl'
}) => {
  return (
    <CustomerPageTemplate
      showNavigation={showNavigation}
      showFooter={showFooter}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          <Stack spacing="md" align="center">
            <H2 align="center">{title}</H2>
            {subtitle && (
              <Text variant="lead" align="center">
                {subtitle}
              </Text>
            )}
          </Stack>
          
          <Grid cols={12} gap="lg">
            {plans.map((plan, index) => (
              <Col key={index} span={{ xs: 12, sm: 6, lg: 4 }}>
                <Card variant={plan.popular ? 'elevated' : 'outlined'}>
                  <Stack spacing="md">
                    {plan.popular && (
                      <Text variant="small" color="primary" weight="bold" align="center">
                        MOST POPULAR
                      </Text>
                    )}
                    
                    <Stack spacing="sm" align="center">
                      <H3 align="center">{plan.name}</H3>
                      <Stack direction="horizontal" spacing="xs" align="center">
                        <H2>{plan.price}</H2>
                        {plan.period && (
                          <Text variant="small" color="muted">
                            /{plan.period}
                          </Text>
                        )}
                      </Stack>
                      <Text align="center" variant="muted">
                        {plan.description}
                      </Text>
                    </Stack>
                    
                    <Stack spacing="sm">
                      {plan.features.map((feature, featureIndex) => (
                        <Stack key={featureIndex} direction="horizontal" spacing="sm">
                          <span>✓</span>
                          <Text variant="small">{feature}</Text>
                        </Stack>
                      ))}
                    </Stack>
                    
                    <Link href={plan.ctaHref}>
                      <Button 
                        variant={plan.popular ? 'primary' : 'outline'} 
                        fullWidth
                      >
                        {plan.ctaText}
                      </Button>
                    </Link>
                  </Stack>
                </Card>
              </Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
}; 