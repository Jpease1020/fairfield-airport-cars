// Page Template System Types
// This file defines the structure for our unified page template system

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'admin' | 'booking' | 'content';
  sections: PageSection[];
  layout: 'standard' | 'hero' | 'dashboard' | 'form' | 'grid';
  responsive: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  icon?: string;
  actions?: React.ReactNode[];
}

export interface PageSection {
  id: string;
  type: 'hero' | 'content' | 'grid' | 'form' | 'cta' | 'footer';
  components: ComponentConfig[];
  layout: {
    cols: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    responsive: boolean;
  };
  spacing: {
    padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
}

export interface ComponentConfig {
  id: string;
  type: string; // 'Button', 'Box', 'Text', etc.
  props: Record<string, any>;
  content?: EditableContent[];
  position: {
    row: number;
    col: number;
    span?: number;
  };
}

export interface EditableContent {
  id: string;
  type: 'text' | 'heading' | 'image' | 'button';
  content: string;
  databaseKey: string; // Links to CMS
  editable: boolean;
  validation?: ValidationRules;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: string) => boolean;
}

export interface ComponentPosition {
  sectionId: string;
  row: number;
  col: number;
  span?: number;
}

export interface AdminPageBuilder {
  templates: PageTemplate[];
  currentPage: PageTemplate;
  selectedComponent: ComponentConfig | null;
  dragState: {
    isDragging: boolean;
    draggedComponent: ComponentConfig | null;
    dropTarget: string | null;
  };
}

export interface TemplateCategories {
  marketing: {
    hero: string;
    features: string;
    pricing: string;
    contact: string;
    about: string;
  };
  admin: {
    dashboard: string;
    list: string;
    form: string;
    detail: string;
  };
  booking: {
    search: string;
    form: string;
    confirmation: string;
    status: string;
  };
  content: {
    article: string;
    gallery: string;
    faq: string;
    terms: string;
  };
}

export interface ComponentRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    defaultProps: Record<string, any>;
    category: 'layout' | 'content' | 'form' | 'navigation' | 'feedback';
    description: string;
    props: {
      [key: string]: {
        type: string;
        required: boolean;
        default?: any;
        description: string;
      };
    };
  };
}

export interface PageProps {
  template: PageTemplate;
  content?: Record<string, any>;
  editable?: boolean;
  onSave?: (databaseKey: string, value: any) => void;
}

export interface SectionProps {
  children: React.ReactNode;
  layout: PageSection['layout'];
  spacing: PageSection['spacing'];
}

export interface GridProps {
  children: React.ReactNode;
  cols: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  breakpoints?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface VirtualGridProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
} 