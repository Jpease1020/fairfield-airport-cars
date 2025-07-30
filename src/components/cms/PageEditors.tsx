import React from 'react';
import { Container, Card, Text, H3, H4, ActionButtonGroup } from '@/components/ui';
import { Input } from '@/design/components/core/layout/FormSystem';
import { Label } from '@/design/components/core/layout/label';
import { Stack } from '@/design/components/core/layout/layout/containers';

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
      <Card
        title={pageTitle}
        description="Edit the content and settings for this page"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <Stack spacing="md">
          <Container>
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={pageData.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('title', e.target.value)}
              placeholder="Enter page title"
            />
            <Text size="sm" color="secondary">The main title of the page</Text>
          </Container>
          
          <Container>
            <Label htmlFor="page-content">Page Content</Label>
            <Input
              id="page-content"
              value={pageData.content || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('content', e.target.value)}
              placeholder="Enter page content"
            />
            <Text size="sm" color="secondary">The main content of the page</Text>
          </Container>
          
          <Container>
            <Label htmlFor="page-meta-description">Meta Description</Label>
            <Input
              id="page-meta-description"
              value={pageData.metaDescription || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('metaDescription', e.target.value)}
              placeholder="Enter meta description"
            />
            <Text size="sm" color="secondary">SEO description for search engines</Text>
          </Container>
        </Stack>
      </Card>
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
      <Card
        title="Hero Section"
        description="Main banner content at the top of the homepage"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <Stack spacing="md">
          <Container>
            <Label htmlFor="hero-title">Hero Title</Label>
            <Input
              id="hero-title"
              value={pageData.hero.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('hero', 'title', e.target.value)}
              placeholder="Enter hero title"
            />
            <Text size="sm" color="secondary">Main headline that grabs visitor attention</Text>
          </Container>
          
          <Container>
            <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
            <Input
              id="hero-subtitle"
              value={pageData.hero.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('hero', 'subtitle', e.target.value)}
              placeholder="Enter hero subtitle"
            />
            <Text size="sm" color="secondary">Supporting text that explains your service</Text>
          </Container>
          
          <Container>
            <Label htmlFor="hero-cta">Call-to-Action Button Text</Label>
            <Input
              id="hero-cta"
              value={pageData.hero.ctaText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('hero', 'ctaText', e.target.value)}
              placeholder="Enter CTA text"
            />
            <Text size="sm" color="secondary">Text for the main action button</Text>
          </Container>
        </Stack>
      </Card>

      {/* Features Section */}
      <Card
        title="Features Section"
        description="Highlight your key service features"
      >
        <Stack spacing="md">
          <Container>
            <Label htmlFor="features-title">Features Section Title</Label>
            <Input
              id="features-title"
              value={pageData.features.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('features', 'title', e.target.value)}
              placeholder="Enter features title"
            />
            <Text size="sm" color="secondary">Heading for the features section</Text>
          </Container>
          
          {/* Feature Items */}
          {pageData.features.items.map((item: any, idx: number) => (
            <Card
              key={idx}
              title={`Feature ${idx + 1}`}
              description="Highlight your key service features"
            >
              <Stack spacing="md">
                <Container>
                  <Label htmlFor={`feature-${idx}-title`}>Feature Title</Label>
                  <Input
                    id={`feature-${idx}-title`}
                    value={item.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const items = [...pageData.features.items];
                      items[idx] = { ...items[idx], title: e.target.value };
                      onFieldChange('features', 'items', items);
                    }}
                    placeholder="Enter feature title"
                  />
                </Container>
                
                <Container>
                  <Label htmlFor={`feature-${idx}-description`}>Feature Description</Label>
                  <Input
                    id={`feature-${idx}-description`}
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const items = [...pageData.features.items];
                      items[idx] = { ...items[idx], description: e.target.value };
                      onFieldChange('features', 'items', items);
                    }}
                    placeholder="Enter feature description"
                  />
                </Container>
                
                <Container>
                  <Label htmlFor={`feature-${idx}-icon`}>Feature Icon</Label>
                  <Input
                    id={`feature-${idx}-icon`}
                    value={item.icon}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const items = [...pageData.features.items];
                      items[idx] = { ...items[idx], icon: e.target.value };
                      onFieldChange('features', 'items', items);
                    }}
                    placeholder="Enter feature icon"
                  />
                </Container>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Card>
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
      <Card
        title="Booking Page"
        description="Edit the content and settings for the booking page"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <Stack spacing="md">
          <Container>
            <Label htmlFor="booking-title">Page Title</Label>
            <Input
              id="booking-title"
              value={pageData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('title', e.target.value)}
              placeholder="Enter page title"
            />
            <Text size="sm" color="secondary">Main title for the booking page</Text>
          </Container>
          
          <Container>
            <Label htmlFor="booking-subtitle">Page Subtitle</Label>
            <Input
              id="booking-subtitle"
              value={pageData.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('subtitle', e.target.value)}
              placeholder="Enter page subtitle"
            />
            <Text size="sm" color="secondary">Supporting text below the title</Text>
          </Container>
          
          <Container>
            <Label htmlFor="booking-description">Page Description</Label>
            <Input
              id="booking-description"
              value={pageData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('description', e.target.value)}
              placeholder="Enter page description"
            />
            <Text size="sm" color="secondary">Detailed description of the booking process</Text>
          </Container>
        </Stack>
      </Card>
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
      <Card
        title="Help Page"
        description="Edit the help page content and sections"
        actions={<ActionButtonGroup buttons={saveButtons} />}
      >
        <Stack spacing="md">
          <Container>
            <Label htmlFor="help-title">Page Title</Label>
            <Input
              id="help-title"
              value={pageData.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFieldChange('title', e.target.value)}
              placeholder="Enter page title"
            />
            <Text size="sm" color="secondary">Main title for the help page</Text>
          </Container>
          
          {/* Help Sections */}
          {pageData.sections.map((section: any, idx: number) => (
            <Card
              key={idx}
              title={`Section ${idx + 1}`}
              description="Edit the help page content and sections"
            >
              <Stack spacing="md">
                <Container>
                  <Label htmlFor={`help-section-${idx}-title`}>Section Title</Label>
                  <Input
                    id={`help-section-${idx}-title`}
                    value={section.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const sections = [...pageData.sections];
                      sections[idx] = { ...sections[idx], title: e.target.value };
                      onFieldChange('sections', sections);
                    }}
                    placeholder="Enter section title"
                  />
                </Container>
                
                <Container>
                  <Label htmlFor={`help-section-${idx}-content`}>Section Content</Label>
                  <Input
                    id={`help-section-${idx}-content`}
                    value={section.content}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const sections = [...pageData.sections];
                      sections[idx] = { ...sections[idx], content: e.target.value };
                      onFieldChange('sections', sections);
                    }}
                    placeholder="Enter section content"
                  />
                </Container>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Card>
    </Container>
  );
}; 