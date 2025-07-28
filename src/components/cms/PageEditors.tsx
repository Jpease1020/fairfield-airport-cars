import React from 'react';
import { Container } from '@/components/ui';
import { SettingSection, SettingInput, ActionButtonGroup } from '@/components/ui';

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
    <Container>
      <SettingSection
        title={pageTitle}
        description="Edit the content and settings for this page"
        icon="📄"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <SettingInput
          id="page-title"
          label="Page Title"
          description="The main title of the page"
          value={pageData.title || ''}
          onChange={(value) => onFieldChange('title', value)}
          icon="📝"
        />
        
        <SettingInput
          id="page-content"
          label="Page Content"
          description="The main content of the page"
          value={pageData.content || ''}
          onChange={(value) => onFieldChange('content', value)}
          icon="📄"
        />
        
        <SettingInput
          id="page-meta-description"
          label="Meta Description"
          description="SEO description for search engines"
          value={pageData.metaDescription || ''}
          onChange={(value) => onFieldChange('metaDescription', value)}
          icon="🔍"
        />
      </SettingSection>
    </Container>
  );
};

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  features: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

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
    <Container>
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
          <SettingSection
            key={idx}
            title={`Feature ${idx + 1}`}
            description="Highlight your key service features"
            icon="📋"
          >
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
          </SettingSection>
        ))}
      </SettingSection>
    </Container>
  );
};

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
    <Container>
      <SettingSection
        title="Booking Page"
        description="Edit the content and settings for the booking page"
        icon="📅"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <SettingInput
          id="booking-title"
          label="Page Title"
          description="Main title for the booking page"
          value={pageData.title}
          onChange={(value) => onFieldChange('title', value)}
          icon="📝"
        />
        
        <SettingInput
          id="booking-subtitle"
          label="Page Subtitle"
          description="Supporting text below the title"
          value={pageData.subtitle}
          onChange={(value) => onFieldChange('subtitle', value)}
          icon="📄"
        />
        
        <SettingInput
          id="booking-description"
          label="Page Description"
          description="Detailed description of the booking process"
          value={pageData.description || ''}
          onChange={(value) => onFieldChange('description', value)}
          icon="📋"
        />
      </SettingSection>
    </Container>
  );
};

export interface HelpPageContent {
  title?: string;
  subtitle?: string;
  faqTitle?: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
    category: 'booking' | 'payment' | 'cancellation' | 'general';
  }>;
  contactInfo: {
    phone: string;
    email: string;
    hours: string;
  };
  contactSection?: {
    title: string;
    description: string;
    callButtonText: string;
    textButtonText: string;
  };
}

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
    <Container>
      <SettingSection
        title="Help Page"
        description="Edit the help page content and sections"
        icon="❓"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <SettingInput
          id="help-title"
          label="Page Title"
          description="Main title for the help page"
          value={pageData.title || ''}
          onChange={(value) => onFieldChange('title', value)}
          icon="📝"
        />
        
        {/* Help Sections */}
        {pageData.sections.map((section: any, idx: number) => (
          <SettingSection
            key={idx}
            title={`Section ${idx + 1}`}
            description="Edit the help page content and sections"
            icon="📋"
          >
            <SettingInput
              id={`help-section-${idx}-title`}
              label="Section Title"
              value={section.title}
              onChange={(value) => {
                const sections = [...pageData.sections];
                sections[idx] = { ...sections[idx], title: value };
                onFieldChange('sections', sections);
              }}
              icon="📋"
            />
            
            <SettingInput
              id={`help-section-${idx}-content`}
              label="Section Content"
              value={section.content}
              onChange={(value) => {
                const sections = [...pageData.sections];
                sections[idx] = { ...sections[idx], content: value };
                onFieldChange('sections', sections);
              }}
              icon="📄"
            />
          </SettingSection>
        ))}
      </SettingSection>
    </Container>
  );
}; 