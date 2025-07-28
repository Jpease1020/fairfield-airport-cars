import React from 'react';
import { Container, Text, H2, H3, Span } from '@/components/ui';
import { Card, Stack } from '@/components/ui/layout/containers';
import { CardBody } from '@/components/ui/card';
import { CMSStatusPage } from '@/components/layout/cms/CMSStatusPage';
import { useCMS } from '@/hooks/useCMS';
import { useEditMode } from '@/components/admin/EditModeProvider';
import { CMSConfiguration } from '@/types/cms';

// ============================================================================
// CONTENT PAGE TEMPLATES
// ============================================================================

/**
 * Standard content page template with sections
 */
export const createContentPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  sections: React.ReactNode[]
) => {
  return function ContentPageTemplate() {
    const { config: cmsConfig } = useCMS();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <Container>
          <Stack>
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load your content.</Text>
          </Stack>
        </Container>
      );
    }

    return (
      <Container>
        <Stack spacing="xl">
          <Stack>
            <H2>{(pageContent as any)?.title || (pageContent as any)?.hero?.title || "Page Title"}</H2>
            {(pageContent as any)?.subtitle && (
              <Text variant="lead">{(pageContent as any).subtitle}</Text>
            )}
            {(pageContent as any)?.description && (
              <Text variant="muted">{(pageContent as any).description}</Text>
            )}
          </Stack>
          
          {sections.map((section, index) => (
            <Container key={index}>
              {section}
            </Container>
          ))}
        </Stack>
      </Container>
    );
  };
};

// ============================================================================
// CONVERSION PAGE TEMPLATES
// ============================================================================

/**
 * Conversion page template with form and trust signals
 */
export const createConversionPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  formContent: React.ReactNode,
  trustSignals?: React.ReactNode
) => {
  return function ConversionPageTemplate() {
    const { config: cmsConfig } = useCMS();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <Container>
          <Stack>
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load your form.</Text>
          </Stack>
        </Container>
      );
    }

    return (
      <Container>
        <Stack spacing="xl">
          <Stack>
            <H2>{(pageContent as any)?.title || (pageContent as any)?.hero?.title || "Form Title"}</H2>
            {(pageContent as any)?.subtitle && (
              <Text variant="lead">{(pageContent as any).subtitle}</Text>
            )}
            {(pageContent as any)?.description && (
              <Text variant="muted">{(pageContent as any).description}</Text>
            )}
          </Stack>
          
          <Stack direction="horizontal" spacing="xl">
            <Container>
              {formContent}
            </Container>
            
            {trustSignals && (
              <Container>
                {trustSignals}
              </Container>
            )}
          </Stack>
        </Stack>
      </Container>
    );
  };
};

// ============================================================================
// STATUS PAGE TEMPLATES
// ============================================================================

/**
 * Status page template with success/error states
 */
export const createStatusPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  status: 'success' | 'pending' | 'error' | 'info',
  content: React.ReactNode,
  actions?: {
    primary?: { text: string; href: string; variant?: 'primary' | 'outline' | 'secondary' };
    secondary?: { text: string; href: string; variant?: 'primary' | 'outline' | 'secondary' };
  }
) => {
  return function StatusPageTemplate() {
    const { config: cmsConfig } = useCMS();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <Container>
          <Stack>
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load your status.</Text>
          </Stack>
        </Container>
      );
    }

    return (
      <CMSStatusPage 
        cmsConfig={cmsConfig} 
        pageType={pageType}
        status={status}
        title={(pageContent as any)?.title || (pageContent as any)?.hero?.title || "Status Title"}
        subtitle={(pageContent as any)?.subtitle || "Status Subtitle"}
        description={(pageContent as any)?.description || "Status description"}
        showStatusIcon={true}
        showActionButtons={!!actions}
        primaryAction={actions?.primary}
        secondaryAction={actions?.secondary}
        containerMaxWidth="lg"

      >
        {content}
      </CMSStatusPage>
    );
  };
};

// ============================================================================
// COMMON SECTION TEMPLATES
// ============================================================================

/**
 * Standard section template with title and content
 */
export const createSection = (
  id: string,
  title: string,
  content: React.ReactNode,
  icon?: React.ComponentType<any>
) => {
  const IconComponent = icon;
  
  return (
    <section id={id}>
      <H2>
        {IconComponent && <IconComponent />}
        {title}
      </H2>
      {content}
    </section>
  );
};

/**
 * Stats section template
 */
export const createStatsSection = (stats: Array<{
  icon: React.ComponentType<any>;
  value: string;
  label: string;
}>) => {
  return (
    <Container>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} variant="outlined">
            <CardBody>
              <Container>
                <IconComponent />
              </Container>
              <H3>{stat.value}</H3>
              <Text variant="small">
                {stat.label}
              </Text>
            </CardBody>
          </Card>
        );
      })}
    </Container>
  );
};

/**
 * Contact cards section template
 */
export const createContactSection = (contacts: Array<{
  icon: React.ComponentType<any>;
  value: string;
  action: { text: string; href: string; type: 'tel' | 'mailto' | 'link' };
}>) => {
  return (
    <Container>
      {contacts.map((contact, index) => {
        const IconComponent = contact.icon;
        return (
          <Card key={index} variant="outlined">
            <CardBody>
              <Container>
                <IconComponent />
              </Container>
              <H3>{contact.value}</H3>
              <Text variant="small">
                {contact.action.text}
              </Text>
            </CardBody>
          </Card>
        );
      })}
    </Container>
  );
};

/**
 * FAQ section template
 */
export const createFAQSection = (faqs: Array<{
  question: string;
  answer: string;
  category?: string;
}>) => {
  return (
    <Container>
      {faqs.map((faq, index) => (
        <Card key={index} variant="outlined">
          <CardBody>
            <H3>{faq.question}</H3>
            <Text>{faq.answer}</Text>
          </CardBody>
        </Card>
      ))}
    </Container>
  );
};

/**
 * Features section template
 */
export const createFeaturesSection = (features: Array<{
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}>) => {
  return (
    <Container>
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card key={index} variant="outlined">
            <CardBody>
              <Container>
                <IconComponent />
              </Container>
              <H3>{feature.title}</H3>
              <Text>{feature.description}</Text>
            </CardBody>
          </Card>
        );
      })}
    </Container>
  );
};

// ============================================================================
// SPECIFIC PAGE TEMPLATES
// ============================================================================

/**
 * About page template
 */
export const createAboutPage = () => {
  return createContentPageTemplate('about', [
    createSection('mission', 'Our Mission', 
      <Text>We provide reliable airport transportation services to the Fairfield community.</Text>
    ),
    createSection('team', 'Our Team',
      <Text>Meet our dedicated team of professional drivers.</Text>
    ),
    createSection('values', 'Our Values',
      <Text>Safety, reliability, and customer satisfaction are our top priorities.</Text>
    )
  ]);
};

/**
 * Help page template
 */
export const createHelpPage = () => {
  return createContentPageTemplate('help', [
    createFAQSection([
      {
        question: 'How do I book a ride?',
        answer: 'You can book a ride through our online booking form or by calling us directly.'
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'You can cancel your booking up to 2 hours before your scheduled pickup time.'
      },
      {
        question: 'Do you provide child seats?',
        answer: 'Yes, we provide child seats upon request. Please let us know when booking.'
      }
    ]),
    createContactSection([
      {
        icon: () => <Span>📞</Span>,
        value: '(555) 123-4567',
        action: { text: 'Call us', href: 'tel:+15551234567', type: 'tel' }
      },
      {
        icon: () => <Span>📧</Span>,
        value: 'info@fairfieldairportcars.com',
        action: { text: 'Email us', href: 'mailto:info@fairfieldairportcars.com', type: 'mailto' }
      }
    ])
  ]);
}; 