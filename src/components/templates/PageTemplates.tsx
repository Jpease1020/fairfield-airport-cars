import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { useCMS } from '@/hooks/useCMS';
import { useEditMode } from '@/components/admin/EditModeProvider';
import { 
  CMSContentPage 
} from '@/components/layout/CMSContentPage';
import { 
  CMSConversionPage 
} from '@/components/layout/CMSConversionPage';
import { 
  CMSStatusPage 
} from '@/components/layout/CMSStatusPage';
import { 
  H2, Text
} from '@/components/ui/design-system';
import { 
  Star,
  Users,
  Shield,
  Phone,
  Mail,
  Calendar,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// PAGE TEMPLATE SYSTEM
// ============================================================================

/**
 * Template for creating new content pages (About, Help, Terms, etc.)
 */
export const createContentPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  sections: React.ReactNode[]
) => {
  return function ContentPageTemplate() {
    const { config: cmsConfig } = useCMS();
    const { editMode, handleFieldChange } = useEditMode();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <div className="">
          <div className="">
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load the content.</Text>
          </div>
        </div>
      );
    }

    return (
      <CMSContentPage 
        cmsConfig={cmsConfig} 
        pageType={pageType}
        title={pageContent?.title || "Page Title"}
        subtitle={pageContent?.subtitle || "Page Subtitle"}
        description={pageContent?.content || "Page description"}
        showTableOfContents={true}
        showRelatedLinks={true}
        containerMaxWidth="xl"
        isEditable={editMode}
        onFieldChange={(field, value) => handleFieldChange(pageType, field, value)}
      >
        {sections}
      </CMSContentPage>
    );
  };
};

/**
 * Template for creating new conversion pages (Booking, Contact, etc.)
 */
export const createConversionPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  formContent: React.ReactNode,
  trustSignals?: React.ReactNode
) => {
  return function ConversionPageTemplate() {
    const { config: cmsConfig } = useCMS();
    const { editMode, handleFieldChange } = useEditMode();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <div className="">
          <div className="">
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load the form.</Text>
          </div>
        </div>
      );
    }

    return (
      <CMSConversionPage 
        cmsConfig={cmsConfig} 
        pageType={pageType}
        title={pageContent?.title || "Form Title"}
        subtitle={pageContent?.subtitle || "Form Subtitle"}
        description={pageContent?.description || "Form description"}
        containerMaxWidth="xl"
        isEditable={editMode}
        onFieldChange={(field, value) => handleFieldChange(pageType, field, value)}
      >
        {formContent}
        {trustSignals}
      </CMSConversionPage>
    );
  };
};

/**
 * Template for creating new status pages (Success, Error, Pending, etc.)
 */
export const createStatusPageTemplate = (
  pageType: keyof CMSConfiguration['pages'],
  status: 'success' | 'pending' | 'error' | 'info',
  content: React.ReactNode,
  actions?: {
    primary?: { text: string; href: string; variant?: 'default' | 'outline' | 'secondary' };
    secondary?: { text: string; href: string; variant?: 'default' | 'outline' | 'secondary' };
  }
) => {
  return function StatusPageTemplate() {
    const { config: cmsConfig } = useCMS();
    const { editMode, handleFieldChange } = useEditMode();
    
    const pageContent = cmsConfig?.pages?.[pageType];

    if (!cmsConfig) {
      return (
        <div className="">
          <div className="">
            <H2>Loading...</H2>
            <Text variant="muted">Please wait while we load your status.</Text>
          </div>
        </div>
      );
    }

    return (
      <CMSStatusPage 
        cmsConfig={cmsConfig} 
        pageType={pageType}
        status={status}
        title={pageContent?.title || "Status Title"}
        subtitle={pageContent?.subtitle || "Status Subtitle"}
        description={pageContent?.description || "Status description"}
        showStatusIcon={true}
        showActionButtons={!!actions}
        primaryAction={actions?.primary}
        secondaryAction={actions?.secondary}
        containerMaxWidth="lg"
        isEditable={editMode}
        onFieldChange={(field, value) => handleFieldChange(pageType, field, value)}
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
    <section id={id} className="">
      <H2 className="">
        {IconComponent && <IconComponent className="" />}
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
    <div className="">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} variant="outlined" padding="lg">
            <CardContent className="">
              <div className="">
                <IconComponent className="" />
              </div>
              <H3 className="">{stat.value}</H3>
              <Text variant="small" className="">
                {stat.label}
              </Text>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

/**
 * Contact cards section template
 */
export const createContactSection = (contacts: Array<{
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  action: { text: string; href: string; type: 'tel' | 'mailto' | 'link' };
}>) => {
  return (
    <div className="">
      {contacts.map((contact, index) => {
        const IconComponent = contact.icon;
        const ActionComponent = contact.action.type === 'link' ? Link : 'a';
        const actionProps = contact.action.type === 'link' 
          ? { href: contact.action.href }
          : { href: contact.action.href };

        return (
          <Card key={index} variant="elevated" padding="lg">
            <CardContent className="">
              <div className="">
                <IconComponent className="" />
              </div>
              <H3 className="">{contact.title}</H3>
              <Text className="mb-4">{contact.value}</Text>
              <ActionComponent {...actionProps}>
                <Button variant="outline" size="sm">
                  {contact.action.text}
                </Button>
              </ActionComponent>
            </CardContent>
          </Card>
        );
      })}
    </div>
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
    <div className="">
      {faqs.map((faq, index) => (
        <Card key={index} variant="outlined" padding="lg">
          <CardContent>
            <H3 className="">{faq.question}</H3>
            <Text variant="small" className="">
              {faq.answer}
            </Text>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Feature cards section template
 */
export const createFeaturesSection = (features: Array<{
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}>) => {
  return (
    <div className="">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card key={index} variant="elevated" padding="lg">
            <CardContent>
              <div className="">
                <div className="">
                  <IconComponent className="" />
                </div>
                <div>
                  <H3>{feature.title}</H3>
                </div>
              </div>
              <Text variant="small" className="">
                {feature.description}
              </Text>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Creating a new About page using templates
 */
export const createAboutPage = () => {
  const sections = [
    createSection(
      'overview',
      'Our Story',
      <Lead>
        Fairfield Airport Car Service has been providing reliable, comfortable, and professional 
        transportation services for over a decade.
      </Lead>
    ),
    createSection(
      'stats',
      'Why Choose Us',
      createStatsSection([
        { icon: Star, value: '10+ Years', label: 'Of reliable service excellence' },
        { icon: Users, value: '10,000+', label: 'Satisfied customers served' },
        { icon: Shield, value: '100%', label: 'Licensed & insured service' }
      ])
    ),
    createSection(
      'contact',
      'Get in Touch',
      createContactSection([
        {
          icon: Phone,
          title: 'Phone',
          value: '(203) 555-0123',
          action: { text: 'Call Now', href: 'tel:(203) 555-0123', type: 'tel' }
        },
        {
          icon: Mail,
          title: 'Email',
          value: 'info@fairfieldairportcar.com',
          action: { text: 'Send Email', href: 'mailto:info@fairfieldairportcar.com', type: 'mailto' }
        },
        {
          icon: Calendar,
          title: 'Service Hours',
          value: '24/7 Service Available',
          action: { text: 'Book Now', href: '/book', type: 'link' }
        }
      ])
    )
  ];

  return createContentPageTemplate('about', sections);
};

/**
 * Example: Creating a new Help page using templates
 */
export const createHelpPage = () => {
  const sections = [
    createSection(
      'faq',
      'Frequently Asked Questions',
      createFAQSection([
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking at least 24 hours in advance, especially for early morning flights.'
        },
        {
          question: 'What if my flight is delayed?',
          answer: 'We monitor flight status and will adjust pickup times accordingly. No additional charges for reasonable delays.'
        }
      ])
    ),
    createSection(
      'contact',
      'Need Help?',
      createContactSection([
        {
          icon: Phone,
          title: 'Call Us',
          value: '(203) 555-0123',
          action: { text: 'Call Now', href: 'tel:(203) 555-0123', type: 'tel' }
        },
        {
          icon: Mail,
          title: 'Email Support',
          value: 'support@fairfieldairportcar.com',
          action: { text: 'Send Email', href: 'mailto:support@fairfieldairportcar.com', type: 'mailto' }
        },
        {
          icon: MessageCircle,
          title: 'Live Chat',
          value: 'Available during business hours',
          action: { text: 'Start Chat', href: '/contact', type: 'link' }
        }
      ])
    )
  ];

  return createContentPageTemplate('help', sections);
}; 