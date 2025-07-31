'use client';

import React, { useState } from 'react';
import { Container } from '../layout/containers/Container';
import { Card } from '../layout/containers/Card';
import { Stack } from '../layout/grid/Stack';
import { Grid } from '../layout/grid/Grid';
import { Col } from '../layout/grid/Col';
import { Text, H2, H3, Span } from '../ui-components/Text';
import { Button } from '../ui-components/Button';
import { CustomerPageTemplate } from './PageTemplates';
import Link from 'next/link';

// ============================================================================
// LAYER 6: CONTENT TEMPLATES
// Content-focused page templates for marketing and informational pages
// ============================================================================

/**
 * Content Page Template
 * Standard content page with title, description, and sections
 */
export interface ContentPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  sections: React.ReactNode[];
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ContentPageTemplate: React.FC<ContentPageTemplateProps> = ({
  title,
  subtitle,
  description,
  sections,
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
          <Stack spacing="md">
            <H2>{title}</H2>
            {subtitle && (
              <Text variant="lead">{subtitle}</Text>
            )}
            {description && (
              <Text variant="muted">{description}</Text>
            )}
          </Stack>
          
          {sections.map((section, index) => (
            <Container key={index}>
              {section}
            </Container>
          ))}
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
};

/**
 * Conversion Page Template
 * Page with form and trust signals for conversions
 */
export interface ConversionPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  formContent: React.ReactNode;
  trustSignals?: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ConversionPageTemplate: React.FC<ConversionPageTemplateProps> = ({
  title,
  subtitle,
  description,
  formContent,
  trustSignals,
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
          <Stack spacing="md">
            <H2>{title}</H2>
            {subtitle && (
              <Text variant="lead">{subtitle}</Text>
            )}
            {description && (
              <Text variant="muted">{description}</Text>
            )}
          </Stack>
          
          <Grid cols={12} gap="xl">
            <Col span={{ xs: 12, lg: 8 }}>
              <Card>
                {formContent}
              </Card>
            </Col>
            
            {trustSignals && (
              <Col span={{ xs: 12, lg: 4 }}>
                {trustSignals}
              </Col>
            )}
          </Grid>
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
};

/**
 * Status Page Template
 * Page with success/error states and actions
 */
export interface StatusPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  status: 'success' | 'pending' | 'error' | 'info';
  content: React.ReactNode;
  actions?: {
    primary?: { text: string; href: string; variant?: 'primary' | 'outline' | 'secondary' };
    secondary?: { text: string; href: string; variant?: 'primary' | 'outline' | 'secondary' };
  };
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const StatusPageTemplate: React.FC<StatusPageTemplateProps> = ({
  title,
  subtitle,
  description,
  status,
  content,
  actions,
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
          <Stack spacing="md">
            <H2>{title}</H2>
            {subtitle && (
              <Text variant="lead">{subtitle}</Text>
            )}
            {description && (
              <Text variant="muted">{description}</Text>
            )}
          </Stack>
          
          {content}
          
          {actions && (
            <Stack direction="horizontal" spacing="md">
              {actions.primary && (
                <Link href={actions.primary.href}>
                  <Button variant={actions.primary.variant || 'primary'}>
                    {actions.primary.text}
                  </Button>
                </Link>
              )}
              {actions.secondary && (
                <Link href={actions.secondary.href}>
                  <Button variant={actions.secondary.variant || 'outline'}>
                    {actions.secondary.text}
                  </Button>
                </Link>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </CustomerPageTemplate>
  );
};

// ============================================================================
// SECTION TEMPLATES
// Reusable section components for content pages
// ============================================================================

/**
 * Standard content section with title and content
 */
export interface ContentSectionProps {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ComponentType<any>;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  id,
  title,
  content,
  icon
}) => {
  const IconComponent = icon;
  
  return (
    <section id={id}>
      <Stack spacing="md">
        <H3>
          {IconComponent && <IconComponent />}
          {title}
        </H3>
        {content}
      </Stack>
    </section>
  );
};

/**
 * Stats section with icon, value, and label
 */
export interface StatItem {
  icon: React.ComponentType<any>;
  value: string;
  label: string;
}

export interface StatsSectionProps {
  stats: StatItem[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <Grid cols={12} gap="md">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Col key={index} span={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined">
              <Stack spacing="sm" align="center">
                <IconComponent />
                <H3>{stat.value}</H3>
                <Text variant="small" align="center">
                  {stat.label}
                </Text>
              </Stack>
            </Card>
          </Col>
        );
      })}
    </Grid>
  );
};

/**
 * Contact section with contact information
 */
export interface ContactItem {
  icon: React.ComponentType<any>;
  value: string;
  action: { text: string; href: string; type: 'tel' | 'mailto' | 'link' };
}

export interface ContactSectionProps {
  contacts: ContactItem[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
  return (
    <Grid cols={12} gap="md">
      {contacts.map((contact, index) => {
        const IconComponent = contact.icon;
        return (
          <Col key={index} span={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <Stack spacing="sm" align="center">
                <IconComponent />
                <H3>{contact.value}</H3>
                <Text variant="small" align="center">
                  {contact.action.text}
                </Text>
              </Stack>
            </Card>
          </Col>
        );
      })}
    </Grid>
  );
};

/**
 * FAQ section with questions and answers
 * Airport-specific FAQ component with accordion functionality
 */
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  variant?: 'default' | 'accordion' | 'simple';
  spacing?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  subtitle,
  items,
  variant = 'default',
  spacing = 'md',
  maxWidth = 'lg',
  showCards = true
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  if (variant === 'accordion') {
    const toggleItem = (index: number) => {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    };

    return (
      <Stack spacing="xl">
        {(title || subtitle) && (
          <Stack spacing="md">
            {title && <H2>{title}</H2>}
            {subtitle && <Text variant="lead">{subtitle}</Text>}
          </Stack>
        )}
        
        <Stack spacing="md">
          {items.map((item, index) => {
            const content = (
              <Stack spacing="md">
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                >
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text>{item.question}</Text>
                    <Text>▼</Text>
                  </Stack>
                </Button>
                
                {openItems.has(index) && (
                  <Text>{item.answer}</Text>
                )}
              </Stack>
            );

            return (
              <Container key={index}>
                {showCards ? (
                  <Card variant="outlined">
                    {content}
                  </Card>
                ) : (
                  content
                )}
              </Container>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  if (variant === 'simple') {
    return (
      <Stack spacing="xl">
        {(title || subtitle) && (
          <Stack spacing="md">
            {title && <H2>{title}</H2>}
            {subtitle && <Text variant="lead">{subtitle}</Text>}
          </Stack>
        )}
        
        <Stack spacing="md">
          {items.map((item, index) => {
            const content = (
              <Stack spacing="sm">
                <H3>{item.question}</H3>
                <Text>{item.answer}</Text>
              </Stack>
            );

            return (
              <Container key={index}>
                {showCards ? (
                  <Card variant="outlined">
                    {content}
                  </Card>
                ) : (
                  content
                )}
              </Container>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  // Default variant
  return (
    <Stack spacing="xl">
      {(title || subtitle) && (
        <Stack spacing="md">
          {title && <H2>{title}</H2>}
          {subtitle && <Text variant="lead">{subtitle}</Text>}
        </Stack>
      )}
      
      <Stack spacing="md">
        {items.map((item, index) => {
          const content = (
            <Stack spacing="sm">
              <H3>{item.question}</H3>
              <Text>{item.answer}</Text>
            </Stack>
          );

          return (
            <Container key={index}>
              {showCards ? (
                <Card variant="outlined">
                  {content}
                </Card>
              ) : (
                content
              )}
            </Container>
          );
        })}
      </Stack>
    </Stack>
  );
};

/**
 * Features section with icon, title, and description
 */
export interface FeatureItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  features: FeatureItem[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <Grid cols={12} gap="lg">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Col key={index} span={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined">
              <Stack spacing="md">
                <IconComponent />
                <H3>{feature.title}</H3>
                <Text>{feature.description}</Text>
              </Stack>
            </Card>
          </Col>
        );
      })}
    </Grid>
  );
};

/**
 * Contact Methods Section Component
 * Reusable contact methods section for content pages
 */
export interface ContactMethod {
  type: 'phone' | 'email' | 'text' | 'whatsapp';
  label: string;
  value: string;
  href: string;
}

export interface ContactMethodsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  contactMethods: ContactMethod[];
  variant?: 'default' | 'centered' | 'split';
}

export const ContactMethodsSection: React.FC<ContactMethodsSectionProps> = ({
  title,
  subtitle,
  description,
  contactMethods,
  variant = 'default'
}) => {
  const getContactIcon = (type: ContactMethod['type']) => {
    switch (type) {
      case 'phone':
        return '📞';
      case 'email':
        return '📧';
      case 'text':
        return '💬';
      case 'whatsapp':
        return '📱';
    }
  };

  return (
    <Stack spacing="xl">
      {(title || subtitle || description) && (
        <Stack spacing="md" align={variant === 'centered' ? 'center' : 'flex-start'}>
          {title && <H3>{title}</H3>}
          {subtitle && <Text variant="lead">{subtitle}</Text>}
          {description && <Text variant="muted">{description}</Text>}
        </Stack>
      )}
      
      <Grid cols={variant === 'split' ? 2 : 3} gap="md">
        {contactMethods.map((method, index) => (
          <Col key={index} span={{ xs: 12, sm: 6, lg: variant === 'split' ? 6 : 4 }}>
            <Card variant="outlined">
              <Stack spacing="sm" align="center">
                <Text size="xl">{getContactIcon(method.type)}</Text>
                <Stack spacing="xs" align="center">
                  <Text weight="bold">{method.label}</Text>
                  <Link href={method.href}>
                    <Text variant="muted">{method.value}</Text>
                  </Link>
                </Stack>
              </Stack>
            </Card>
          </Col>
        ))}
      </Grid>
    </Stack>
  );
}; 