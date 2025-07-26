import React from 'react';
import { SettingInput, SettingSection, ActionButtonGroup } from '@/components/ui';
import { HomePageContent, HelpPageContent } from '@/types/cms';

// Generic Page Editor for simple pages (about, terms, privacy)
export interface GenericPageEditorProps {
  pageData: {
    title?: string;
    content?: string;
    metaDescription?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  pageTitle: string;
}

export const GenericPageEditor: React.FC<GenericPageEditorProps> = ({
  pageData,
  onFieldChange,
  onSave,
  saving,
  pageTitle
}) => {
  const saveButtons = [{
    label: saving ? 'Saving...' : 'Save Changes',
    onClick: onSave,
    variant: 'primary' as const,
    disabled: saving
  }];

  return (
    <SettingSection
      title={pageTitle}
      description="Edit page content and metadata"
      icon="📄"
      actions={<ActionButtonGroup buttons={saveButtons} />}
    >
      <SettingInput
        id={`${pageTitle.toLowerCase()}-title`}
        label="Page Title"
        description="The main heading displayed on the page"
        value={pageData.title || ''}
        onChange={(value) => onFieldChange('title', value)}
        icon="✏️"
      />
      
      <SettingInput
        id={`${pageTitle.toLowerCase()}-content`}
        label="Page Content"
        description="The main content displayed on the page"
        type="text"
        value={pageData.content || ''}
        onChange={(value) => onFieldChange('content', value)}
        icon="📝"
      />
      
      <SettingInput
        id={`${pageTitle.toLowerCase()}-meta`}
        label="Meta Description"
        description="SEO description for search engines"
        value={pageData.metaDescription || ''}
        onChange={(value) => onFieldChange('metaDescription', value)}
        icon="🔍"
      />
    </SettingSection>
  );
};

// Home Page Editor
export interface HomePageEditorProps {
  pageData: HomePageContent;
  onFieldChange: (section: string, field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

export const HomePageEditor: React.FC<HomePageEditorProps> = ({
  pageData,
  onFieldChange,
  onSave,
  saving
}) => {
  const saveButtons = [{
    label: saving ? 'Saving...' : 'Save Changes',
    onClick: onSave,
    variant: 'primary' as const,
    disabled: saving
  }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Hero Section */}
      <SettingSection
        title="Hero Section"
        description="Main banner content at the top of the homepage"
        icon="🎯"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <SettingInput
          id="hero-title"
          label="Hero Title"
          description="Main headline that grabs visitor attention"
          value={pageData.hero.title}
          onChange={(value) => onFieldChange('hero', 'title', value)}
          icon="🎯"
        />
        
        <SettingInput
          id="hero-subtitle"
          label="Hero Subtitle"
          description="Supporting text that explains your service"
          value={pageData.hero.subtitle}
          onChange={(value) => onFieldChange('hero', 'subtitle', value)}
          icon="📝"
        />
        
        <SettingInput
          id="hero-cta"
          label="Call-to-Action Button Text"
          description="Text for the main action button"
          value={pageData.hero.ctaText}
          onChange={(value) => onFieldChange('hero', 'ctaText', value)}
          icon="🔔"
        />
      </SettingSection>

      {/* Features Section */}
      <SettingSection
        title="Features Section"
        description="Highlight your key service features"
        icon="⭐"
      >
        <SettingInput
          id="features-title"
          label="Features Section Title"
          description="Heading for the features section"
          value={pageData.features.title}
          onChange={(value) => onFieldChange('features', 'title', value)}
          icon="⭐"
        />
        
        {/* Feature Items */}
        {pageData.features.items.map((item: any, idx: number) => (
          <div key={idx} style={{
            padding: 'var(--spacing-md)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--background-secondary)'
          }}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-md)' }}>
              Feature {idx + 1}
            </h4>
            
            <SettingInput
              id={`feature-${idx}-title`}
              label="Feature Title"
              value={item.title}
              onChange={(value) => {
                const items = [...pageData.features.items];
                items[idx] = { ...items[idx], title: value };
                onFieldChange('features', 'items', items);
              }}
              icon="📋"
            />
            
            <SettingInput
              id={`feature-${idx}-description`}
              label="Feature Description"
              value={item.description}
              onChange={(value) => {
                const items = [...pageData.features.items];
                items[idx] = { ...items[idx], description: value };
                onFieldChange('features', 'items', items);
              }}
              icon="📝"
            />
            
            <SettingInput
              id={`feature-${idx}-icon`}
              label="Feature Icon"
              value={item.icon}
              onChange={(value) => {
                const items = [...pageData.features.items];
                items[idx] = { ...items[idx], icon: value };
                onFieldChange('features', 'items', items);
              }}
              icon="🎨"
            />
          </div>
        ))}
      </SettingSection>

      {/* About Section */}
      <SettingSection
        title="About Section"
        description="Tell visitors about your company"
        icon="🏢"
      >
        <SettingInput
          id="about-title"
          label="About Section Title"
          value={pageData.about.title}
          onChange={(value) => onFieldChange('about', 'title', value)}
          icon="🏢"
        />
        
        <SettingInput
          id="about-content"
          label="About Content"
          type="text"
          value={pageData.about.content}
          onChange={(value) => onFieldChange('about', 'content', value)}
          icon="📄"
        />
      </SettingSection>

      {/* Contact Section */}
      <SettingSection
        title="Contact Section"
        description="Contact information and details"
        icon="📞"
      >
        <SettingInput
          id="contact-title"
          label="Contact Section Title"
          value={pageData.contact.title}
          onChange={(value) => onFieldChange('contact', 'title', value)}
          icon="📞"
        />
        
        <SettingInput
          id="contact-content"
          label="Contact Content"
          type="text"
          value={pageData.contact.content}
          onChange={(value) => onFieldChange('contact', 'content', value)}
          icon="📄"
        />
        
        <SettingInput
          id="contact-phone"
          label="Phone Number"
          value={pageData.contact.phone}
          onChange={(value) => onFieldChange('contact', 'phone', value)}
          icon="📱"
        />
        
        <SettingInput
          id="contact-email"
          label="Email Address"
          type="email"
          value={pageData.contact.email}
          onChange={(value) => onFieldChange('contact', 'email', value)}
          icon="✉️"
        />
      </SettingSection>
    </div>
  );
};

// Booking Page Editor
export interface BookingPageEditorProps {
  pageData: {
    title: string;
    subtitle: string;
    description?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const BookingPageEditor: React.FC<BookingPageEditorProps> = ({
  pageData,
  onFieldChange,
  onSave,
  saving
}) => {
  const saveButtons = [{
    label: saving ? 'Saving...' : 'Save Changes',
    onClick: onSave,
    variant: 'primary' as const,
    disabled: saving
  }];

  return (
    <SettingSection
      title="Booking Page"
      description="Configure the booking page content and messaging"
      icon="📅"
      actions={<ActionButtonGroup buttons={saveButtons} />}
    >
      <SettingInput
        id="booking-title"
        label="Page Title"
        description="Main heading on the booking page"
        value={pageData.title}
        onChange={(value) => onFieldChange('title', value)}
        icon="📅"
      />
      
      <SettingInput
        id="booking-subtitle"
        label="Page Subtitle"
        description="Supporting text below the main title"
        value={pageData.subtitle}
        onChange={(value) => onFieldChange('subtitle', value)}
        icon="📝"
      />
      
      <SettingInput
        id="booking-description"
        label="Page Description"
        description="Additional description or instructions"
        type="text"
        value={pageData.description || ''}
        onChange={(value) => onFieldChange('description', value)}
        icon="📄"
      />
    </SettingSection>
  );
};

// Help Page Editor
export interface HelpPageEditorProps {
  pageData: HelpPageContent;
  onFieldChange: (section: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

export const HelpPageEditor: React.FC<HelpPageEditorProps> = ({
  pageData,
  onFieldChange,
  onSave,
  saving
}) => {
  const saveButtons = [{
    label: saving ? 'Saving...' : 'Save Changes',
    onClick: onSave,
    variant: 'primary' as const,
    disabled: saving
  }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* FAQ Section */}
      <SettingSection
        title="FAQ Section"
        description="Frequently asked questions and answers"
        icon="❓"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        {pageData.faq.map((faq: any, idx: number) => (
          <div key={idx} style={{
            padding: 'var(--spacing-md)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--background-secondary)'
          }}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-md)' }}>
              FAQ {idx + 1}
            </h4>
            
            <SettingInput
              id={`faq-${idx}-question`}
              label="Question"
              value={faq.question}
              onChange={(value) => {
                const faqs = [...pageData.faq];
                faqs[idx] = { ...faqs[idx], question: value };
                onFieldChange('faq', faqs);
              }}
              icon="❓"
            />
            
            <SettingInput
              id={`faq-${idx}-answer`}
              label="Answer"
              type="text"
              value={faq.answer}
              onChange={(value) => {
                const faqs = [...pageData.faq];
                faqs[idx] = { ...faqs[idx], answer: value };
                onFieldChange('faq', faqs);
              }}
              icon="💬"
            />
          </div>
        ))}
      </SettingSection>

      {/* Contact Info Section */}
      <SettingSection
        title="Contact Information"
        description="Help page contact details"
        icon="📞"
      >
        <SettingInput
          id="help-phone"
          label="Contact Phone"
          value={pageData.contactInfo.phone}
          onChange={(value) => onFieldChange('contactInfo', { ...pageData.contactInfo, phone: value })}
          icon="📱"
        />
        
        <SettingInput
          id="help-email"
          label="Contact Email"
          type="email"
          value={pageData.contactInfo.email}
          onChange={(value) => onFieldChange('contactInfo', { ...pageData.contactInfo, email: value })}
          icon="✉️"
        />
        
        <SettingInput
          id="help-hours"
          label="Contact Hours"
          value={pageData.contactInfo.hours}
          onChange={(value) => onFieldChange('contactInfo', { ...pageData.contactInfo, hours: value })}
          icon="🕒"
        />
      </SettingSection>
    </div>
  );
}; 